/**
 * ==============================================================================
 * ZENGUARD SOVEREIGN ARMOR v6.0 — LÁ CHẮN BẢO MẬT KHÁCH HÀNG & CHỐNG REVERSE-ENGINEERING
 * Độc quyền sở hữu bởi ZenTool Suite (www.zentool.io.vn)
 * Thiết kế theo chuẩn an ninh phòng thủ đa tầng:
 * 1. Multi-Vector DevTools Detection (Timing Analysis, Console Getters, Dimension Delta)
 * 2. Infinite Debugger Trap & Memory Lockdown (Treo cứng DevTools kẻ soi code)
 * 3. Anti-Tamper & Native Function Integrity Check (Chống chèn script hook trộm dữ liệu)
 * 4. Zero-Leakage Memory Sanitation (Xóa sạch bộ đệm dữ liệu nhạy cảm khi bị can thiệp)
 * 5. Console Nullification (Vô hiệu hóa toàn bộ bảng điều khiển Console)
 * ==============================================================================
 */
(function () {
  'use strict';

  // 1. Tránh nạp lặp lại
  if (window.__ZEN_ARMOR_ACTIVE__) return;
  try {
    Object.defineProperty(window, '__ZEN_ARMOR_ACTIVE__', { value: true, writable: false, configurable: false, enumerable: false });
  } catch (e) {
    window.__ZEN_ARMOR_ACTIVE__ = true;
  }

  // 2. Lưu trữ tham chiếu gốc đến các hàm Native trước khi bị ghi đè
  var _rawToString = Function.prototype.toString;
  var _perfNow = (window.performance && window.performance.now) ? function() { return performance.now(); } : function() { return Date.now(); };
  var _nativeLog = (window.console && window.console.log) ? window.console.log.bind(window.console) : function() {};
  var _nativeClear = (window.console && window.console.clear) ? window.console.clear.bind(window.console) : function() {};

  var state = {
    isLocked: false,
    trapActive: false,
    breachCount: 0
  };

  // 3. KHÓA TÊN MIỀN BẢN QUYỀN (DOMAIN LOCK)
  var allowedHosts = [
    'zentool.io.vn',
    'www.zentool.io.vn',
    'localhost',
    '127.0.0.1'
  ];

  var currentHost = window.location.hostname.toLowerCase();
  var isAllowed = false;

  if (window.location.protocol === 'file:' || currentHost === '') {
    isAllowed = true;
  } else {
    for (var i = 0; i < allowedHosts.length; i++) {
      if (currentHost === allowedHosts[i] || currentHost.endsWith('.pages.dev') || currentHost.endsWith('.workers.dev') || currentHost.endsWith('.github.io')) {
        isAllowed = true;
        break;
      }
    }
  }

  if (!isAllowed) {
    window.stop && window.stop();
    document.documentElement.innerHTML = [
      '<div style="background:#090d16;color:#f87171;font-family:system-ui,sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;">',
      '<div style="font-size:56px;margin-bottom:16px;">🛡️</div>',
      '<h1 style="font-size:24px;font-weight:800;color:#ef4444;margin-bottom:12px;">CẢNH BÁO: BẢN SAO CHÉP TRÁI PHÉP</h1>',
      '<p style="max-width:540px;line-height:1.6;color:#cbd5e1;font-size:14px;margin-bottom:24px;">',
      'Mã nguồn và giải thuật của <b>ZenTool Suite</b> được bảo vệ bản quyền công nghệ. Hệ thống phát hiện trang web này không thuộc tên miền chính thức.',
      '</p>',
      '<a href="https://www.zentool.io.vn/" style="background:#0284c7;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Truy cập bản gốc zentool.io.vn</a>',
      '</div>'
    ].join('');
    setTimeout(function() {
      window.location.href = 'https://www.zentool.io.vn/';
    }, 2500);
    throw new Error('[ZenArmor] Domain lock violation.');
  }

  // 4. CHỐNG NHÚNG IFRAME / CLICKJACKING
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (err) {}

  // 5. CHẶN PHÍM TẮT MỞ DEVTOOLS & XEM SOURCE
  document.addEventListener('contextmenu', function(e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return true;
    e.preventDefault();
    return false;
  }, { capture: true });

  window.addEventListener('keydown', function(e) {
    // Chặn F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      triggerDefenseBreach('Phím tắt F12 bị phát hiện');
      return false;
    }
    // Chặn Ctrl+Shift+I / J / C / K (DevTools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c' || e.key === 'K' || e.key === 'k')) {
      e.preventDefault();
      e.stopPropagation();
      triggerDefenseBreach('Tổ hợp phím DevTools bị phát hiện');
      return false;
    }
    // Chặn Ctrl+U (Xem Source code thô)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Chặn Ctrl+S (Lưu toàn bộ trang web về máy)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 6. MULTI-VECTOR DEVTOOLS DETECTION (PHÁT HIỆN MỞ DEVTOOLS TỪ MENU 3 CHẤM HOẶC BÊN NGOÀI)
  
  // Vector A: Console Getter Trap (Tự động kích hoạt khi DevTools Console đọc đối tượng)
  var trapObj = {};
  var trapTriggered = false;
  try {
    Object.defineProperty(trapObj, 'id', {
      get: function () {
        trapTriggered = true;
        triggerDefenseBreach('Console Inspection Trap Triggered');
        return 'ZenArmor';
      },
      configurable: false
    });
  } catch (e) {}

  // Vector B: Timing Analysis qua Debugger (Khi DevTools mở, lệnh debugger làm trễ thực thi > 100ms)
  function testDebuggerTiming() {
    var t0 = _perfNow();
    try {
      var dbg = Function('debugger');
      dbg();
    } catch (e) {}
    var dt = _perfNow() - t0;
    if (dt > 100) {
      triggerDefenseBreach('Debugger Breakpoint Lag Detected (' + Math.round(dt) + 'ms)');
    }
  }

  // Vector C: Window Dimensions Delta (Khi DevTools gắn bên phải hoặc đáy màn hình)
  function testWindowDimensions() {
    var w = window;
    var ow = w.outerWidth || 0;
    var iw = w.innerWidth || 0;
    var oh = w.outerHeight || 0;
    var ih = w.innerHeight || 0;
    var dw = ow - iw;
    var dh = oh - ih;

    if (ow > 0 && iw > 0 && (dw > 175 || dh > 175)) {
      triggerDefenseBreach('DevTools Docked Panel Detected');
    }
  }

  // 7. CƠ CHẾ PHÒNG VỆ VÀ TRỪNG PHẠT (DEFENSE LOCKDOWN & TRAP)
  function triggerDefenseBreach(reason) {
    if (state.isLocked) return;
    state.isLocked = true;
    state.breachCount++;

    // Xóa sạch console
    try { _nativeClear(); } catch (e) {}

    // Xóa sạch dữ liệu bộ nhớ nhạy cảm của khách hàng trong RAM
    flushCustomerDataFromMemory();

    // Hiển thị màn hình phong tỏa bảo mật
    renderLockdownOverlay(reason);

    // Bắt đầu vòng lặp Infinite Debugger đóng băng tab
    activateInfiniteDebuggerLoop();
  }

  // Xóa sạch dữ liệu trong RAM để chống hacker inspect biến
  function flushCustomerDataFromMemory() {
    try {
      if (window.batchInvoices) window.batchInvoices = [];
      if (window.rawXmlFiles) window.rawXmlFiles = [];
      if (window.excelWorkbookData) window.excelWorkbookData = null;
      var sensitiveContainers = document.querySelectorAll('#invoice-table-body, #batch-summary-cards, #xml-preview-container');
      sensitiveContainers.forEach(function (el) {
        el.innerHTML = '<tr class="text-rose-500 font-bold"><td colspan="8" class="p-4 text-center">BẢO MẬT: DỮ LIỆU ĐÃ ĐƯỢC XÓA SẠCH TRONG RAM ĐỂ BẢO VỆ DOANH NGHIỆP</td></tr>';
      });
    } catch (e) {}
  }

  // Vòng lặp đóng băng debugger
  function activateInfiniteDebuggerLoop() {
    if (state.trapActive) return;
    state.trapActive = true;

    setInterval(function () {
      try {
        (function () {
          return false;
        }).constructor('debugger')();
      } catch (e) {}
    }, 20);
  }

  // Giao diện phong tỏa
  function renderLockdownOverlay(reason) {
    try {
      var overlay = document.createElement('div');
      overlay.id = 'zen-lockdown-shield';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#030712;color:#f8fafc;z-index:999999999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:system-ui,sans-serif;box-sizing:border-box;';
      overlay.innerHTML = [
        '<div style="width:80px;height:80px;border-radius:24px;background:rgba(239,68,68,0.15);border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;font-size:40px;color:#ef4444;margin-bottom:20px;">🛡️</div>',
        '<h1 style="font-size:22px;font-weight:900;color:#f87171;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">KÍCH HOẠT PHÒNG THỦ: TRUY CẬP ĐÃ BỊ PHONG TỎA</h1>',
        '<p style="max-width:580px;font-size:14px;color:#cbd5e1;line-height:1.6;margin-bottom:16px;">',
        'Hệ thống an ninh phát hiện hành vi mở <b>Developer Tools</b> hoặc công cụ phân tích mã nguồn. Để bảo vệ tuyệt đối dữ liệu hóa đơn và chứng từ kinh doanh của khách hàng, <b>toàn bộ dữ liệu trong RAM đã được tiêu hủy tức thì</b>.',
        '</p>',
        '<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:8px 16px;font-size:12px;color:#94a3b8;margin-bottom:24px;font-family:monospace;">',
        'Cảnh báo an ninh: ' + (reason || 'Unauthorized Inspection Detected'),
        '</div>',
        '<button onclick="window.location.reload()" style="background:linear-gradient(135deg,#0284c7,#0369a1);color:white;border:none;padding:12px 30px;border-radius:10px;font-weight:bold;font-size:13px;cursor:pointer;">Tải Lại Trang (Đóng DevTools Để Tiếp Tục)</button>'
      ].join('');
      document.body.appendChild(overlay);
    } catch (e) {}
  }

  // 8. VÔ HIỆU HÓA BẢNG CONSOLE TRÌNH DUYỆT (ANTI-SNOOPING)
  function nullifyConsole() {
    if (!window.console) return;
    var methods = ['log', 'info', 'warn', 'error', 'debug', 'dir', 'dirxml', 'table', 'trace', 'clear', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd', 'count', 'assert'];
    var noop = function () {};
    for (var j = 0; j < methods.length; j++) {
      try {
        Object.defineProperty(window.console, methods[j], {
          value: noop,
          writable: false,
          configurable: false,
          enumerable: false
        });
      } catch (err) {
        window.console[methods[j]] = noop;
      }
    }
  }

  // 9. KIỂM ĐỊNH TÍNH NGUYÊN BẢN CỦA HÀM HỆ THỐNG (ANTI-HOOKING / TAMPER PROTECTION)
  function verifyNativeIntegrity() {
    var targets = [
      { name: 'fetch', fn: window.fetch },
      { name: 'eval', fn: window.eval },
      { name: 'Function', fn: window.Function },
      { name: 'setTimeout', fn: window.setTimeout }
    ];

    for (var k = 0; k < targets.length; k++) {
      var item = targets[k];
      if (item.fn) {
        try {
          var str = _rawToString.call(item.fn);
          if (str.indexOf('[native code]') === -1) {
            triggerDefenseBreach('Hàm hệ thống ' + item.name + ' bị hook can thiệp trái phép');
            return;
          }
        } catch (e) {}
      }
    }
  }

  // 10. VÒNG LẶP TUẦN TRA GIÁM SÁT ĐỊNH KỲ (0.8 GIÂY / LẦN)
  nullifyConsole();
  verifyNativeIntegrity();

  setInterval(function () {
    if (state.isLocked) return;

    // Kích hoạt bẫy Console Getter
    try {
      _nativeLog(trapObj);
      _nativeClear();
    } catch (e) {}

    // Kiểm tra độ trễ Debugger
    testDebuggerTiming();

    // Kiểm tra kích thước cửa sổ
    testWindowDimensions();

    // Tái kiểm tra tính nguyên bản của hàm Native
    verifyNativeIntegrity();
  }, 800);

  // Xuất API nội bộ an toàn
  window.ZenArmor = Object.freeze({
    isProtected: true,
    version: '6.0.0-MILITARY',
    flushMemory: flushCustomerDataFromMemory
  });

})();
