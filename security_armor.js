/**
 * ZenTool Security Armor — Lá Chắn Bảo Vệ Mã Nguồn & Chống Sao Chép
 * Độc quyền sở hữu bởi ZenTool Suite (www.zentool.io.vn)
 */
(function() {
  'use strict';

  // 1. DOMAIN LOCK — KHÓA TÊN MIỀN BẢN QUYỀN
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
      '<div style="background:#090d16;color:#f87171;font-family:sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;">',
      '<h1 style="font-size:28px;margin-bottom:12px;color:#ef4444;">⚠️ CẢNH BÁO VI PHẠM BẢN QUYỀN</h1>',
      '<p style="max-width:560px;line-height:1.6;color:#cbd5e1;font-size:15px;margin-bottom:24px;">',
      'Mã nguồn và giao diện của <b>ZenTool Suite</b> đã được đăng ký quyền sở hữu trí tuệ độc quyền.',
      'Hệ thống phát hiện trang web này là một bản sao chép bất hợp pháp không được cấp phép.',
      '</p>',
      '<a href="https://www.zentool.io.vn/" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Truy cập phiên bản chính thức zentool.io.vn</a>',
      '</div>'
    ].join('');
    setTimeout(function() {
      window.location.href = 'https://www.zentool.io.vn/';
    }, 3500);
    throw new Error('[ZenArmor] Unauthorized Domain Clone Detected');
  }

  // 2. ANTI-TAMPER — CHỐNG CHUỘT PHẢI & PHÍM TẮT SOI CODE
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener('keydown', function(e) {
    // Chặn F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    // Chặn Ctrl+U (Xem Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
    // Chặn Ctrl+S (Lưu trang)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
  });

  // 3. CONSOLE WARNING WATERMARK
  try {
    var banner = '%c[ZENTOOL SHIELD]%c Mã nguồn được bảo hộ bản quyền. Mọi hành vi reverse-engineering đều bị giám sát.';
    console.log(banner, 'color:#38bdf8;font-weight:bold;font-size:14px;', 'color:#94a3b8;font-size:12px;');
  } catch(e) {}
})();
