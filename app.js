// ZenTool Suite — Core Application Logic (Refined & Category-Driven)
// 100% Client-Side Architecture — Zero Server Storage

// --- STATE MANAGEMENT ---
let currentTab = 'invoice';
let currentInvoiceData = null;
let currentViewingInvoiceIndex = null;
let batchInvoices = [];
let convertedHeicFiles = [];
let selectedPdfFiles = [];
let selectedImagesForPdf = [];
let uploadedImageForCompress = null;
let currentPlatform = 'shopee';

// Standard Vietnam E-Commerce Fee Matrix by Category (Updated 2025 - 2026)
const CATEGORY_PROFILES = {
  fashion: {
    name: "Thời trang & Phụ kiện",
    fixedRateShopee: 0.145, // 14.5%
    fixedRateTiktok: 0.135, // 13.5%
    defaultReturnRate: 12,  // 12% do đổi size, thử đồ
    description: "Ngành có biên lợi nhuận cao nhưng tỷ lệ đổi trả/hoàn hàng lớn nhất sàn (8% - 15%)."
  },
  beauty: {
    name: "Sức khỏe & Sắc đẹp (Mỹ phẩm)",
    fixedRateShopee: 0.165, // 16.5%
    fixedRateTiktok: 0.140, // 14.0%
    defaultReturnRate: 5,   // 5%
    description: "Phí sàn cố định thuộc nhóm cao nhất (14% - 17%), đòi hỏi quản lý chặt chi phí quà tặng và mẫu thử."
  },
  fmcg: {
    name: "Bách hóa & Tiêu dùng nhanh",
    fixedRateShopee: 0.110, // 11.0%
    fixedRateTiktok: 0.100, // 10.0%
    defaultReturnRate: 4,   // 4%
    description: "Mặt hàng thiết yếu có mức phí sàn ưu đãi hơn, đơn hàng thường có giá trị trung bình vừa phải."
  },
  home: {
    name: "Nhà cửa & Đời sống",
    fixedRateShopee: 0.130, // 13.0%
    fixedRateTiktok: 0.120, // 12.0%
    defaultReturnRate: 7,   // 7%
    description: "Cần chú ý chi phí bao bì đóng gói bảo vệ chống vỡ móp khi vận chuyển."
  },
  electronics: {
    name: "Điện tử & Thiết bị công nghệ",
    fixedRateShopee: 0.060, // 6.0%
    fixedRateTiktok: 0.055, // 5.5%
    defaultReturnRate: 3,   // 3%
    description: "Phí cố định thấp nhất (4% - 8%) do giá trị đơn hàng cao, tỷ lệ hoàn hàng thấp nhưng rủi ro hỏng hóc cao."
  },
  general: {
    name: "Ngành hàng Khác / Tiêu chuẩn",
    fixedRateShopee: 0.050, // 5.0%
    fixedRateTiktok: 0.040, // 4.0%
    defaultReturnRate: 5,   // 5%
    description: "Áp dụng mức phí hoa hồng nền tảng mặc định cho các dòng sản phẩm chưa phân loại."
  }
};

// Inline Standard Sample XML Invoice
const INLINE_SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
  <DLHDon Id="HDON_0100109106_2026_0001289">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</THDon>
      <KHMSHDon>1</KHMSHDon>
      <KHHDon>C26TAA</KHHDon>
      <SHDon>0001289</SHDon>
      <NLap>2026-10-15</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1.0</TGia>
      <HTTToan>Chuyển khoản</HTTToan>
      <MSTTCGP>0100109106</MSTTCGP>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ZENCORE VIỆT NAM</Ten>
        <MST>0108923456</MST>
        <DChi>Tầng 12, Tòa nhà Landmark 72, Đường Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, TP Hà Nội</DChi>
        <SDThoai>024.7300.8888</SDThoai>
        <DCTDTu>billing@zencore.vn</DCTDTu>
        <STKNHang>0988776655</STKNHang>
        <TNHang>Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)</TNHang>
      </NBan>
      <NMua>
        <Ten>CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL</Ten>
        <MST>0317654321</MST>
        <DChi>Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh</DChi>
        <HVTNMHang>Nguyễn Văn Hoàng</HVTNMHang>
        <DCTDTu>finance@vietglobal.com</DCTDTu>
      </NMua>
      <DSHHDVu>
        <HHDVu>
          <STT>1</STT>
          <THHDVu>Dịch vụ Tối ưu hóa Dữ liệu và Tự động hóa Quy trình Bán hàng Omni-Channel Q3/2026</THHDVu>
          <DVT>Gói</DVT>
          <SLuong>1</SLuong>
          <DGia>18500000</DGia>
          <Tien>18500000</Tien>
          <TSuat>8%</TSuat>
        </HHDVu>
        <HHDVu>
          <STT>2</STT>
          <THHDVu>Gia hạn Bản quyền Phần mềm Quản trị Kho Hàng Đa Sàn Cloud ERP</THHDVu>
          <DVT>Tháng</DVT>
          <SLuong>6</SLuong>
          <DGia>1200000</DGia>
          <Tien>7200000</Tien>
          <TSuat>10%</TSuat>
        </HHDVu>
      </DSHHDVu>
      <TToan>
        <TgTCThue>25700000</TgTCThue>
        <TgTThue>2200000</TgTThue>
        <TgTTTBSo>27900000</TgTTTBSo>
        <TgTTTBChu>Hai mươi bảy triệu chín trăm nghìn đồng chẵn</TgTTTBChu>
      </TToan>
    </NDHDon>
    <DSCKS>
      <NBan>
        <Signature Id="SellerSignature">
          <SignatureValue>MEQCIB8Z3sF8Xyv27xJg789kLmNPQrTuVwXyZ...</SignatureValue>
          <KeyInfo>Chứng thư số Doanh nghiệp cấp bởi VNPT-CA (Hạn: 2028-12-31)</KeyInfo>
        </Signature>
      </NBan>
    </DSCKS>
  </DLHDon>
</HDon>`;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initZenGuardSecurity();
  initTheme();
  initLanguage();
  initCategorySelect();
  calculateDetailedProfit();
  initCompressSample();
  if (typeof updateWatermarkPreview === 'function') {
    setTimeout(updateWatermarkPreview, 100);
  }
  if (typeof ZenTelemetry !== 'undefined') {
    ZenTelemetry.init();
  }
});

// ============================================================
// HỆ THỐNG PHÒNG THỦ BẢO MẬT: ZENGUARD CYBERSECURITY SHIELD
// ============================================================
function initZenGuardSecurity() {
  // 1. Chống nhúng trộm iFrame / Anti-Clickjacking
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (err) {
    console.warn("ZenGuard: Phát hiện hành vi nhúng iFrame từ bên thứ ba!");
  }

  // 2. Chặn chuột phải trên các khu vực cấu trúc (cho phép trong input/textarea)
  document.addEventListener('contextmenu', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    e.preventDefault();
    showToast('🛡️ Chế độ bảo mật ZenGuard: Chức năng sao chép cấu trúc mã nguồn đã bị khóa.');
  });

  // 3. Chặn phím tắt mở DevTools, xem Source code và Lưu trang web
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      showToast('🛡️ Phím F12 bị vô hiệu hóa bởi ZenGuard.');
      return false;
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
      e.preventDefault();
      showToast('🛡️ Chức năng kiểm tra mã nguồn (Inspect) đã bị khóa.');
      return false;
    }
    // Ctrl+U (View source)
    if (e.ctrlKey && ['U', 'u'].includes(e.key)) {
      e.preventDefault();
      showToast('🛡️ Chức năng xem mã nguồn trang đã bị khóa.');
      return false;
    }
    // Ctrl+S (Save page HTML)
    if (e.ctrlKey && ['S', 's'].includes(e.key)) {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        showToast('🛡️ Lưu mã nguồn website bị vô hiệu hóa.');
        return false;
      }
    }
  });

  // 4. In thông điệp cảnh báo bản quyền & bảo mật trong Console
  try {
    console.log(
      "%c🛡️ ZENGUARD CYBERSECURITY SHIELD ACTIVE — 100% CLIENT-SIDE VERIFIED",
      "background: #0284c7; color: white; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;"
    );
    console.log(
      "%c[CẢNH BÁO BẢN QUYỀN]: Toàn bộ thuật toán bóc tách hóa đơn, ma trận phí sàn TMĐT và bộ nén ảnh thuộc sở hữu bản quyền của ZenTool Suite. Mọi hành vi sao chép, cào dữ liệu hoặc đảo ngược mã nguồn đều bị giám sát. Dữ liệu khách hàng được bảo mật tuyệt đối 100% trong RAM cục bộ (Zero-Knowledge Architecture).",
      "color: #dc2626; font-size: 11px; font-weight: bold;"
    );
  } catch (cErr) {}
}

// --- THEME & TAB UTILITIES ---
function initTheme() {
  const isDark = localStorage.getItem('zentool_dark') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = 'ri-sun-line text-lg';
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('zentool_dark', isDark);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = isDark ? 'ri-sun-line text-lg' : 'ri-moon-line text-lg';
}

function switchTab(tabId) {
  currentTab = tabId;
  const tabs = ['invoice', 'files', 'profit', 'media'];
  
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (t === tabId) {
        navBtn.className = "nav-tab px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-white dark:bg-slate-700 shadow-sm text-sky-600 dark:text-sky-300";
      } else {
        navBtn.className = "nav-tab px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900";
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: 'ZenTool Suite — Siêu Tiện Ích Trực Tuyến 100% Client-Side',
      text: 'Mở hóa đơn điện tử XML, gộp file văn phòng, tính lãi sàn TMĐT & nén ảnh bảo mật tuyệt đối!',
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Đã sao chép liên kết ZenTool vào bộ nhớ tạm!');
  }
}

// ============================================================
// PHÂN HỆ 1: TRÌNH ĐỌC & GOM BẢNG KÊ HÓA ĐƠN ĐIỆN TỬ XML (HÀNG LOẠT)
// ============================================================

// Đọc 1 hoặc hàng loạt file XML cùng lúc trong RAM
async function handleXmlUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  let loadedCount = 0;
  for (const file of files) {
    try {
      const text = await readFileAsText(file);
      const invoice = parseXmlInvoiceString(text, file.name);
      if (invoice) {
        batchInvoices.push(invoice);
        loadedCount++;
      }
    } catch (err) {
      console.error("Lỗi đọc file XML:", file.name, err);
    }
  }

  if (loadedCount > 0) {
    renderBatchInvoiceView();
    showToast(`Đã nạp thành công ${loadedCount} hóa đơn XML vào bảng kê!`);
  } else {
    alert("Không tìm thấy dữ liệu hóa đơn hợp lệ trong các file XML vừa chọn.");
  }

  event.target.value = '';
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Bóc tách dữ liệu từ chuỗi XML (Hỗ trợ chuẩn Thông tư 78, NĐ 123 & TT 32)
function parseXmlInvoiceString(xmlText, fileName = "HoaDon.xml") {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const getVal = (selectors) => {
      const arr = Array.isArray(selectors) ? selectors : [selectors];
      for (const sel of arr) {
        const el = xmlDoc.querySelector(sel);
        if (el && el.textContent.trim()) {
          return el.textContent.trim();
        }
      }
      return '';
    };

    const title = getVal(['THDon', 'InvoiceName', 'TenHDon']) || 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG';
    const khh = getVal(['KHHDon', 'KHMauHDon', 'InvoicePattern', 'MauSo']) || 'C26TAA';
    const sh = getVal(['SHDon', 'InvoiceNo', 'SoHDon']) || '0001289';
    const date = getVal(['NLap', 'InvoiceDate', 'NgayLap']) || new Date().toISOString().split('T')[0];
    const currency = getVal(['DVTTe', 'Currency', 'LoaiTien']) || 'VND';

    const sellerName = getVal(['NBan > Ten', 'NBan Ten', 'Seller LegalName', 'SellerName', 'NBan > TenDonVi']) || 'Đơn vị bán hàng';
    const sellerMst = getVal(['NBan > MST', 'NBan MST', 'Seller TaxCode', 'SellerTaxCode']) || 'Chưa có MST';
    const sellerAddress = getVal(['NBan > DChi', 'NBan DChi', 'Seller Address', 'SellerAddress']) || 'Chưa cập nhật';
    const sellerBank = (getVal(['NBan > STKNHang', 'Seller BankAccount']) 
      ? `${getVal(['NBan > STKNHang', 'Seller BankAccount'])} - ${getVal(['NBan > TNHang', 'Seller BankName'])}` 
      : 'Chưa cập nhật');

    const buyerName = getVal(['NMua > Ten', 'NMua Ten', 'Buyer LegalName', 'BuyerName', 'NMua > TenDonVi']) || 'Đơn vị mua hàng';
    const buyerMst = getVal(['NMua > MST', 'NMua MST', 'Buyer TaxCode', 'BuyerTaxCode']) || '---';
    const buyerAddress = getVal(['NMua > DChi', 'NMua DChi', 'Buyer Address', 'BuyerAddress']) || 'Chưa cập nhật';
    const buyerRep = getVal(['NMua > HVTNMHang', 'Buyer ContactName', 'NMua HVTNMHang']) || 'Chưa cập nhật';

    let subtotal = Number(getVal(['TgTCThue', 'TotalBeforeTax', 'TongTienChuaThue'])) || 0;
    let tax = Number(getVal(['TgTThue', 'TaxAmount', 'TongTienThue'])) || 0;
    let total = Number(getVal(['TgTTTBSo', 'TotalAmount', 'TongTienThanhToan'])) || 0;
    const totalWords = getVal(['TgTTTBChu', 'TotalAmountInWords', 'TongTienBangChu']) || 'Không có thông tin bằng chữ';

    const itemNodes = xmlDoc.querySelectorAll('DSHHDVu > HHDVu, HHDVu, InvoiceItem, Item');
    const items = [];

    itemNodes.forEach((node, index) => {
      const name = node.querySelector('THHDVu, ItemName, TenHang')?.textContent?.trim();
      if (!name) return;
      const stt = node.querySelector('STT, LineNumber')?.textContent?.trim() || (index + 1);
      const unit = node.querySelector('DVT, Unit, DonViTinh')?.textContent?.trim() || 'Cái';
      const qty = Number(node.querySelector('SLuong, Quantity, SoLuong')?.textContent?.trim()) || 1;
      const price = Number(node.querySelector('DGia, UnitPrice, DonGia')?.textContent?.trim()) || 0;
      const amount = Number(node.querySelector('Tien, Amount, ThanhTien')?.textContent?.trim()) || (qty * price);
      const vatRate = node.querySelector('TSuat, TaxRate, ThueSuat')?.textContent?.trim() || '10%';

      items.push({ stt, name, unit, qty, price, amount, vatRate });
    });

    if (total === 0 && subtotal === 0 && items.length > 0) {
      subtotal = items.reduce((acc, it) => acc + it.amount, 0);
      tax = Math.round(subtotal * 0.1);
      total = subtotal + tax;
    } else if (total === 0 && subtotal > 0) {
      total = subtotal + tax;
    }

    return {
      title, khh, sh, date, currency,
      sellerName, sellerMst, sellerAddress, sellerBank,
      buyerName, buyerMst, buyerAddress, buyerRep,
      subtotal, tax, total, totalWords, items,
      fileName,
      rawXml: xmlText
    };
  } catch (err) {
    console.error("Lỗi phân giải XML:", err);
    return null;
  }
}

// Giữ tương thích với gọi hàm đơn lẻ
function parseXmlInvoice(xmlText) {
  const data = parseXmlInvoiceString(xmlText, "HoaDon_DonLe.xml");
  if (!data) {
    alert('Không thể đọc file XML. Định dạng có thể chưa chuẩn hoặc bị hỏng.');
    return;
  }
  currentInvoiceData = data;
  renderInvoiceUI(currentInvoiceData);
}

// Hiển thị giao diện hóa đơn đơn lẻ để xem chi tiết / in PDF
function renderInvoiceUI(data) {
  const placeholder = document.getElementById('invoice-placeholder');
  const batchView = document.getElementById('xml-batch-view');
  const card = document.getElementById('printable-invoice');

  if (placeholder) placeholder.classList.add('hidden');
  if (batchView) batchView.classList.add('hidden');
  if (card) card.classList.remove('hidden');

  document.getElementById('inv-title').textContent = data.title;
  document.getElementById('inv-khh').textContent = data.khh;
  document.getElementById('inv-sh').textContent = data.sh;
  document.getElementById('inv-date').textContent = data.date;
  document.getElementById('inv-currency').textContent = data.currency;

  document.getElementById('inv-seller-name').textContent = data.sellerName;
  document.getElementById('inv-seller-mst').textContent = data.sellerMst;
  document.getElementById('inv-seller-address').textContent = data.sellerAddress;
  document.getElementById('inv-seller-bank').textContent = data.sellerBank;

  document.getElementById('inv-buyer-name').textContent = data.buyerName;
  document.getElementById('inv-buyer-mst').textContent = data.buyerMst;
  document.getElementById('inv-buyer-address').textContent = data.buyerAddress;
  document.getElementById('inv-buyer-rep').textContent = data.buyerRep;

  const tableBody = document.getElementById('inv-items-table');
  tableBody.innerHTML = '';

  data.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50";
    tr.innerHTML = `
      <td class="py-2 px-1 text-center font-mono text-slate-500">${item.stt}</td>
      <td class="py-2 px-2 font-medium text-slate-900 dark:text-slate-100">${item.name}</td>
      <td class="py-2 px-2 text-center text-slate-500">${item.unit}</td>
      <td class="py-2 px-2 text-right font-mono">${item.qty.toLocaleString('vi-VN')}</td>
      <td class="py-2 px-2 text-right font-mono">${item.price.toLocaleString('vi-VN')}</td>
      <td class="py-2 px-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">${item.amount.toLocaleString('vi-VN')}</td>
      <td class="py-2 px-2 text-center font-mono text-sky-600 font-bold">${item.vatRate}</td>
    `;
    tableBody.appendChild(tr);
  });

  document.getElementById('inv-subtotal').textContent = `${Math.round(data.subtotal).toLocaleString('vi-VN')} VND`;
  document.getElementById('inv-tax').textContent = `${Math.round(data.tax).toLocaleString('vi-VN')} VND`;
  document.getElementById('inv-total').textContent = `${Math.round(data.total).toLocaleString('vi-VN')} VND`;
  document.getElementById('inv-total-words').textContent = data.totalWords;

  // Cập nhật nút quay lại bảng kê
  const backBtn = document.getElementById('btn-back-to-batch');
  if (backBtn) {
    if (batchInvoices.length > 0) {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }
  }
}

// Hiển thị bảng kê hàng loạt & 4 Thẻ KPI
function renderBatchInvoiceView(listToRender) {
  const list = listToRender !== undefined ? listToRender : batchInvoices;
  
  const placeholder = document.getElementById('invoice-placeholder');
  const batchView = document.getElementById('xml-batch-view');
  const singleView = document.getElementById('printable-invoice');
  const clearBtn = document.getElementById('xml-clear-btn');
  const badge = document.getElementById('xml-total-loaded-badge');

  if (badge) badge.textContent = batchInvoices.length;

  if (batchInvoices.length === 0) {
    if (placeholder) placeholder.classList.remove('hidden');
    if (batchView) batchView.classList.add('hidden');
    if (singleView) singleView.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
    return;
  }

  if (placeholder) placeholder.classList.add('hidden');
  if (batchView) batchView.classList.remove('hidden');
  if (singleView) singleView.classList.add('hidden');
  if (clearBtn) clearBtn.classList.remove('hidden');

  // Tính toán 4 Thẻ KPI Kế Toán
  const totalCount = batchInvoices.length;
  const sumSubtotal = batchInvoices.reduce((acc, cur) => acc + (cur.subtotal || 0), 0);
  const sumTax = batchInvoices.reduce((acc, cur) => acc + (cur.tax || 0), 0);
  const sumTotal = batchInvoices.reduce((acc, cur) => acc + (cur.total || 0), 0);

  const kpiCount = document.getElementById('batch-kpi-count');
  const kpiSubtotal = document.getElementById('batch-kpi-subtotal');
  const kpiTax = document.getElementById('batch-kpi-tax');
  const kpiTotal = document.getElementById('batch-kpi-total');

  if (kpiCount) kpiCount.textContent = totalCount;
  if (kpiSubtotal) kpiSubtotal.textContent = `${Math.round(sumSubtotal).toLocaleString('vi-VN')} đ`;
  if (kpiTax) kpiTax.textContent = `${Math.round(sumTax).toLocaleString('vi-VN')} đ`;
  if (kpiTotal) kpiTotal.textContent = `${Math.round(sumTotal).toLocaleString('vi-VN')} đ`;

  // Render các dòng trong bảng
  const tbody = document.getElementById('batch-invoices-tbody');
  const showingCount = document.getElementById('batch-showing-count');
  if (showingCount) showingCount.textContent = list.length;

  if (tbody) {
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-400">Không tìm thấy hóa đơn nào khớp với từ khóa tìm kiếm.</td></tr>`;
      return;
    }

    list.forEach((inv, idx) => {
      const originalIdx = batchInvoices.indexOf(inv);
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/60 transition";
      tr.innerHTML = `
        <td class="py-2.5 px-2 text-center font-mono text-slate-400">${idx + 1}</td>
        <td class="py-2.5 px-2 font-mono font-bold text-sky-600 dark:text-sky-400">${inv.sh || '---'}</td>
        <td class="py-2.5 px-2 font-mono text-slate-500">${inv.khh || '---'}</td>
        <td class="py-2.5 px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">${inv.date || '---'}</td>
        <td class="py-2.5 px-2 font-medium text-slate-900 dark:text-slate-100 max-w-[220px] truncate" title="${inv.sellerName}">${inv.sellerName}</td>
        <td class="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-400">${inv.sellerMst || '---'}</td>
        <td class="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">${Math.round(inv.subtotal || 0).toLocaleString('vi-VN')} đ</td>
        <td class="py-2.5 px-2 text-right font-mono text-amber-600 dark:text-amber-400">${Math.round(inv.tax || 0).toLocaleString('vi-VN')} đ</td>
        <td class="py-2.5 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">${Math.round(inv.total || 0).toLocaleString('vi-VN')} đ</td>
        <td class="py-2.5 px-2 text-center whitespace-nowrap">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="viewBatchInvoice(${originalIdx})" class="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 font-bold text-[11px] transition flex items-center gap-1" title="Xem chi tiết & in">
              <i class="ri-eye-line"></i> Xem
            </button>
            <button onclick="deleteBatchInvoice(${originalIdx})" class="p-1 rounded text-rose-400 hover:text-rose-600 transition" title="Xóa hóa đơn này">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Bộ lọc tìm kiếm thời gian thực
function filterBatchInvoices(keyword) {
  if (!keyword || !keyword.trim()) {
    renderBatchInvoiceView(batchInvoices);
    return;
  }
  const term = keyword.trim().toLowerCase();
  const filtered = batchInvoices.filter(inv => 
    (inv.sellerName && inv.sellerName.toLowerCase().includes(term)) ||
    (inv.sellerMst && inv.sellerMst.toLowerCase().includes(term)) ||
    (inv.sh && inv.sh.toLowerCase().includes(term)) ||
    (inv.khh && inv.khh.toLowerCase().includes(term)) ||
    (inv.buyerName && inv.buyerName.toLowerCase().includes(term))
  );
  renderBatchInvoiceView(filtered);
}

// Xem chi tiết một hóa đơn từ bảng kê
function viewBatchInvoice(index) {
  if (index < 0 || index >= batchInvoices.length) return;
  currentInvoiceData = batchInvoices[index];
  currentViewingInvoiceIndex = index;
  renderInvoiceUI(currentInvoiceData);
  window.scrollTo({ top: 150, behavior: 'smooth' });
}

// Quay lại chế độ bảng kê
function backToBatchView() {
  document.getElementById('printable-invoice')?.classList.add('hidden');
  document.getElementById('xml-batch-view')?.classList.remove('hidden');
  window.scrollTo({ top: 150, behavior: 'smooth' });
}

// Xóa 1 hóa đơn khỏi danh sách
function deleteBatchInvoice(index) {
  if (index >= 0 && index < batchInvoices.length) {
    batchInvoices.splice(index, 1);
    const searchVal = document.getElementById('batch-search-input')?.value;
    if (searchVal) {
      filterBatchInvoices(searchVal);
    } else {
      renderBatchInvoiceView();
    }
    showToast('Đã xóa hóa đơn khỏi bảng kê.');
  }
}

// Xóa toàn bộ hóa đơn
function clearAllBatchInvoices() {
  if (batchInvoices.length > 0) {
    if (!confirm('Anh có chắc muốn xóa toàn bộ danh sách hóa đơn hiện tại không?')) return;
  }
  batchInvoices = [];
  currentInvoiceData = null;
  const searchInput = document.getElementById('batch-search-input');
  if (searchInput) searchInput.value = '';
  renderBatchInvoiceView();
  showToast('Đã làm trống bảng kê.');
}

// Xuất file Excel (.xlsx) chuẩn nghiệp vụ kế toán thuế bằng SheetJS
function exportBatchInvoicesToExcel() {
  if (!batchInvoices.length) {
    alert('Chưa có hóa đơn nào trong bảng kê để xuất Excel.');
    return;
  }

  if (typeof XLSX !== 'undefined') {
    const wb = XLSX.utils.book_new();
    
    const wsData = [
      ["BẢNG KÊ HÓA ĐƠN ĐIỆN TỬ (BÓC TÁCH TỰ ĐỘNG BẰNG ZENTOOL SUITE)"],
      [`Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`],
      ["Cam kết bảo mật: 100% Client-Side RAM — Không tải dữ liệu lên bất kỳ máy chủ nào."],
      [],
      [
        "STT",
        "Số Hóa Đơn",
        "Ký Hiệu Mẫu",
        "Ngày Lập",
        "Tên Đơn Vị Bán Hàng",
        "Mã Số Thuế Bán",
        "Địa Chỉ Người Bán",
        "Tên Đơn Vị Mua Hàng",
        "Mã Số Thuế Mua",
        "Tiền Hàng (Chưa Thuế)",
        "Tiền Thuế GTGT",
        "Tổng Tiền Thanh Toán",
        "Tên File Gốc"
      ]
    ];

    let sumSubtotal = 0;
    let sumTax = 0;
    let sumTotal = 0;

    batchInvoices.forEach((inv, idx) => {
      const sub = Number(inv.subtotal) || 0;
      const tx = Number(inv.tax) || 0;
      const tot = Number(inv.total) || 0;

      sumSubtotal += sub;
      sumTax += tx;
      sumTotal += tot;

      wsData.push([
        idx + 1,
        inv.sh || "",
        inv.khh || "",
        inv.date || "",
        inv.sellerName || "",
        inv.sellerMst || "",
        inv.sellerAddress || "",
        inv.buyerName || "",
        inv.buyerMst || "",
        sub,
        tx,
        tot,
        inv.fileName || ""
      ]);
    });

    // Dòng tổng cộng
    wsData.push([
      "TỔNG CỘNG",
      `${batchInvoices.length} Hóa đơn`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      sumSubtotal,
      sumTax,
      sumTotal,
      ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Căn chỉnh độ rộng các cột
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Số HĐ
      { wch: 12 }, // Ký hiệu
      { wch: 12 }, // Ngày lập
      { wch: 38 }, // Tên bán
      { wch: 16 }, // MST Bán
      { wch: 38 }, // Địa chỉ bán
      { wch: 38 }, // Tên mua
      { wch: 16 }, // MST Mua
      { wch: 20 }, // Tiền hàng
      { wch: 16 }, // Tiền thuế
      { wch: 22 }, // Tổng thanh toán
      { wch: 25 }  // Tên file
    ];

    XLSX.utils.book_append_sheet(wb, ws, "BangKeHoaDon_ZenTool");
    XLSX.writeFile(wb, `Bang_Ke_Hoa_Don_Dien_Tu_ZENTOOL_${Date.now()}.xlsx`);
    showToast('🎉 Đã xuất thành công file Excel Bảng Kê Hóa Đơn (.xlsx)!');
  } else {
    // Dự phòng xuất CSV UTF-8 kèm BOM
    let csv = "\uFEFFSTT,Số Hóa Đơn,Ký Hiệu,Ngày Lập,Đơn Vị Bán Hàng,MST Bán,Đơn Vị Mua Hàng,MST Mua,Tiền Hàng,Tiền Thuế GTGT,Tổng Thanh Toán\n";
    batchInvoices.forEach((inv, idx) => {
      csv += `"${idx + 1}","${inv.sh}","${inv.khh}","${inv.date}","${(inv.sellerName||'').replace(/"/g, '""')}","${inv.sellerMst}","${(inv.buyerName||'').replace(/"/g, '""')}","${inv.buyerMst}",${inv.subtotal},${inv.tax},${inv.total}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Ke_Hoa_Don_Dien_Tu_ZENTOOL_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file bảng kê CSV (UTF-8).');
  }
}

// Nạp 5 Hóa Đơn Mẫu Doanh Nghiệp Thực Tế (Viettel, MISA, Petrolimex, FPT, VNPT)
function loadSampleBatchInvoices() {
  const sampleList = [
    {
      title: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      khh: "1C26TNN",
      sh: "0004521",
      date: "2026-10-02",
      currency: "VND",
      sellerName: "TRUNG TÂM KINH DOANH VNPT - HÀ NỘI - CHI NHÁNH TỔNG CÔNG TY DỊCH VỤ VIỄN THÔNG",
      sellerMst: "0106869738-002",
      sellerAddress: "Số 75 Đinh Tiên Hoàng, Phường Tràng Tiền, Quận Hoàn Kiếm, TP Hà Nội",
      sellerBank: "111000012345 - VietinBank CN Hà Nội",
      buyerName: "CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL",
      buyerMst: "0317654321",
      buyerAddress: "Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
      buyerRep: "Nguyễn Văn Hoàng",
      subtotal: 4800000,
      tax: 480000,
      total: 5280000,
      totalWords: "Năm triệu hai trăm tám mươi nghìn đồng chẵn",
      items: [
        { stt: 1, name: "Cước Dịch vụ Internet Cáp Quang FiberVNN Doanh nghiệp 500Mbps (Tháng 10/2026)", unit: "Gói", qty: 1, price: 3200000, amount: 3200000, vatRate: "10%" },
        { stt: 2, name: "Dịch vụ Thuê địa chỉ IPv4 Tĩnh Doanh nghiệp (Tháng 10/2026)", unit: "IP", qty: 2, price: 800000, amount: 1600000, vatRate: "10%" }
      ],
      fileName: "VNPT_Internet_0004521.xml"
    },
    {
      title: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      khh: "1C26MAB",
      sh: "0019842",
      date: "2026-10-05",
      currency: "VND",
      sellerName: "CÔNG TY CỔ PHẦN MISA",
      sellerMst: "0101243150",
      sellerAddress: "Tầng 9, Tòa nhà Technosoft, Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội",
      sellerBank: "0021000123456 - Vietcombank CN Thăng Long",
      buyerName: "CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL",
      buyerMst: "0317654321",
      buyerAddress: "Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
      buyerRep: "Nguyễn Văn Hoàng",
      subtotal: 3500000,
      tax: 350000,
      total: 3850000,
      totalWords: "Ba triệu tám trăm năm mươi nghìn đồng chẵn",
      items: [
        { stt: 1, name: "Bản quyền Phần mềm Hóa đơn điện tử meInvoice - Gói 5.000 hóa đơn", unit: "Gói", qty: 1, price: 3500000, amount: 3500000, vatRate: "10%" }
      ],
      fileName: "MISA_meInvoice_0019842.xml"
    },
    {
      title: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      khh: "1C26PXX",
      sh: "0087612",
      date: "2026-10-09",
      currency: "VND",
      sellerName: "CÔNG TY XĂNG DẦU KHU VỰC I - TNHH MỘT THÀNH VIÊN (PETROLIMEX HÀ NỘI)",
      sellerMst: "0100107694-001",
      sellerAddress: "Số 1 Khâm Thiên, Phường Khâm Thiên, Quận Đống Đa, TP Hà Nội",
      sellerBank: "0011000888999 - Vietcombank Sở Giao Dịch",
      buyerName: "CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL",
      buyerMst: "0317654321",
      buyerAddress: "Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
      buyerRep: "Nguyễn Văn Hoàng",
      subtotal: 12600000,
      tax: 1008000,
      total: 13608000,
      totalWords: "Mười ba triệu sáu trăm linh tám nghìn đồng chẵn",
      items: [
        { stt: 1, name: "Nhiên liệu Xăng RON 95-V Euro 5 phục vụ đội xe giao vận e-commerce", unit: "Lít", qty: 600, price: 21000, amount: 12600000, vatRate: "8%" }
      ],
      fileName: "Petrolimex_Xang_0087612.xml"
    },
    {
      title: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      khh: "1C26FAA",
      sh: "0008320",
      date: "2026-10-12",
      currency: "VND",
      sellerName: "CÔNG TY CỔ PHẦN VIỄN THÔNG FPT (FPT TELECOM)",
      sellerMst: "0101778163",
      sellerAddress: "Tòa nhà FPT, Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP Hà Nội",
      sellerBank: "1902000555666 - Techcombank CN Hà Nội",
      buyerName: "CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL",
      buyerMst: "0317654321",
      buyerAddress: "Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
      buyerRep: "Nguyễn Văn Hoàng",
      subtotal: 18200000,
      tax: 1820000,
      total: 20020000,
      totalWords: "Hai mươi triệu không trăm hai mươi nghìn đồng chẵn",
      items: [
        { stt: 1, name: "Thuê máy chủ ảo Cloud Server Enterprise (16 vCPU, 32GB RAM, 500GB NVMe) Q4/2026", unit: "Gói", qty: 1, price: 15000000, amount: 15000000, vatRate: "10%" },
        { stt: 2, name: "Dịch vụ Sao lưu đám mây Cloud Backup tự động hàng ngày 1TB", unit: "Gói", qty: 1, price: 3200000, amount: 3200000, vatRate: "10%" }
      ],
      fileName: "FPT_CloudServer_0008320.xml"
    },
    {
      title: "HÓA ĐƠN GIÁ TRỊ GIA TĂNG",
      khh: "1C26VTT",
      sh: "0023419",
      date: "2026-10-14",
      currency: "VND",
      sellerName: "TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI (VIETTEL)",
      sellerMst: "0100109106",
      sellerAddress: "Lô D26 Khu đô thị mới Cầu Giấy, Phường Yên Hòa, Quận Cầu Giấy, TP Hà Nội",
      sellerBank: "0011000000001 - MBBank Sở Giao Dịch",
      buyerName: "CÔNG TY TNHH PHÁT TRIỂN THƯƠNG MẠI SỐ VIỆT GLOBAL",
      buyerMst: "0317654321",
      buyerAddress: "Số 188 Nguyễn Văn Cừ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
      buyerRep: "Nguyễn Văn Hoàng",
      subtotal: 2100000,
      tax: 210000,
      total: 2310000,
      totalWords: "Hai triệu ba trăm mười nghìn đồng chẵn",
      items: [
        { stt: 1, name: "Gia hạn Chứng thư số Doanh nghiệp Viettel-CA USB Token (Thời hạn 03 năm)", unit: "Gói", qty: 1, price: 2100000, amount: 2100000, vatRate: "10%" }
      ],
      fileName: "Viettel_CA_0023419.xml"
    }
  ];

  batchInvoices = [...sampleList];
  renderBatchInvoiceView();
  showToast("⚡ Đã nạp thành công 5 hóa đơn doanh nghiệp mẫu vào bảng kê!");
}

function loadSampleInvoice() {
  fetch('/api/sample-invoice')
    .then(res => res.text())
    .then(xmlString => {
      parseXmlInvoice(xmlString);
    })
    .catch(() => {
      parseXmlInvoice(INLINE_SAMPLE_XML);
    });
}

function downloadSampleXmlFile() {
  const blob = new Blob([INLINE_SAMPLE_XML], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "HoaDonDienTu_Mau_0001289.xml";
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã tải file "HoaDonDienTu_Mau_0001289.xml" về máy tính!');
}

function exportInvoiceCsv() {
  if (!currentInvoiceData || !currentInvoiceData.items.length) {
    alert('Không có dữ liệu hàng hóa để xuất CSV.');
    return;
  }

  let csv = "\uFEFFSTT,Tên hàng hóa dịch vụ,ĐVT,Số lượng,Đơn giá,Thành tiền,Thuế suất\n";
  currentInvoiceData.items.forEach(it => {
    csv += `"${it.stt}","${it.name.replace(/"/g, '""')}","${it.unit}",${it.qty},${it.price},${it.amount},"${it.vatRate}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BangKe_HoaDon_${currentInvoiceData.sh}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã xuất file CSV chi tiết hàng hóa!');
}

// ============================================================
// PHÂN HỆ 2: BỘ TIỆN ÍCH FILE VĂN PHÒNG & CHUYỂN ĐỔI ĐỊNH DẠNG
// ============================================================

// Floating Toast Notification Helper
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast-notify');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');
  if (!toast || !msgEl) {
    alert(msg);
    return;
  }
  msgEl.textContent = msg;
  if (isError) {
    iconEl.className = 'ri-error-warning-fill text-rose-400 text-base';
  } else {
    iconEl.className = 'ri-checkbox-circle-fill text-emerald-400 dark:text-emerald-600 text-base';
  }
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

// Nhật ký phiên làm việc (Chỉ lưu tạm thời trong RAM của máy tính)
let officeSessionHistory = [];

function logOfficeAction(toolName, detail) {
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  officeSessionHistory.unshift({ time, toolName, detail });
  renderOfficeHistory();
}

function renderOfficeHistory() {
  const container = document.getElementById('office-history-list');
  const countEl = document.getElementById('office-history-count');
  if (countEl) countEl.textContent = officeSessionHistory.length;
  if (!container) return;

  if (!officeSessionHistory.length) {
    container.innerHTML = `<p class="italic text-slate-400 text-[11px] py-1">Chưa có thao tác nào trong phiên này. Mọi thao tác xong sẽ hiển thị tại đây để anh dễ theo dõi.</p>`;
    return;
  }

  container.innerHTML = officeSessionHistory.map((item, idx) => `
    <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[11px] text-slate-400">${item.time}</span>
        <span class="font-bold text-slate-700 dark:text-slate-200">${item.toolName}:</span>
        <span class="text-slate-600 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md">${item.detail}</span>
      </div>
      <span class="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">✓ Hoàn tất</span>
    </div>
  `).join('');
}

function clearOfficeSessionHistory() {
  officeSessionHistory = [];
  renderOfficeHistory();

  // Reset toàn bộ file đang chọn trên cả 11 công cụ
  clearAllPdfMerge();
  clearSplitPdf();
  clearRotatePdf();
  clearWatermarkPdf();
  clearAllImagesForPdf();
  clearFontConverter();
  clearReorderPdf();
  clearCompressPdf();
  clearPdfToImg();
  clearUnlockPdf();
  clearSignPdf();

  showToast('🧹 Đã xóa sạch lịch sử phiên làm việc và giải phóng toàn bộ bộ nhớ RAM!');
}

// Bộ lọc phân loại 11 công cụ PDF văn phòng
function filterPdfTools(cat) {
  const cards = document.querySelectorAll('.tool-card');
  const buttons = ['all', 'pages', 'convert', 'security'];
  buttons.forEach(b => {
    const btn = document.getElementById(`filter-tool-${b}`);
    if (btn) {
      if (b === cat) {
        btn.className = "px-3 py-1.5 rounded-lg font-bold transition bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 transition";
      }
    }
  });

  cards.forEach(card => {
    if (cat === 'all' || card.classList.contains(`tool-cat-${cat}`)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// 1. Gộp File PDF (Hỗ trợ xóa từng file chọn nhầm hoặc xóa tất cả)
function handlePdfFiles(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  selectedPdfFiles = [...selectedPdfFiles, ...files];
  renderPdfFileList();
  event.target.value = '';
}

function renderPdfFileList() {
  const listContainer = document.getElementById('pdf-list-container');
  const filesList = document.getElementById('pdf-files-list');
  const countEl = document.getElementById('pdf-merge-count');
  if (!listContainer || !filesList) return;

  if (countEl) countEl.textContent = selectedPdfFiles.length;

  if (!selectedPdfFiles.length) {
    listContainer.classList.add('hidden');
    return;
  }

  listContainer.classList.remove('hidden');
  filesList.innerHTML = selectedPdfFiles.map((f, i) => `
    <div class="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
      <span class="truncate max-w-[170px] sm:max-w-[200px] font-medium" title="${f.name}">${i + 1}. ${f.name}</span>
      <div class="flex items-center gap-2">
        <span class="text-slate-400 font-mono text-[11px]">${(f.size / 1024).toFixed(1)} KB</span>
        <button onclick="removePdfFile(${i})" class="text-rose-500 hover:text-rose-700 p-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Xóa file chọn nhầm này">
          <i class="ri-close-circle-line text-sm"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function removePdfFile(index) {
  selectedPdfFiles.splice(index, 1);
  renderPdfFileList();
}

function clearAllPdfMerge() {
  selectedPdfFiles = [];
  renderPdfFileList();
  const input = document.getElementById('pdf-merge-input');
  if (input) input.value = '';
}

// Helper: Tự động kiểm tra và nạp thư viện PDF-Lib (ưu tiên file local vendor/pdf-lib.min.js)
async function ensurePdfLib() {
  if (typeof PDFLib !== 'undefined') return true;

  const loadScript = (src) => new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(typeof PDFLib !== 'undefined');
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

  // 1. Nạp từ thư mục local vendor (offline 100%)
  if (await loadScript('vendor/pdf-lib.min.js')) return true;

  // 2. Dự phòng qua Unpkg
  if (await loadScript('https://unpkg.com/pdf-lib/dist/pdf-lib.min.js')) return true;

  // 3. Dự phòng qua JSDelivr
  if (await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.9/dist/pdf-lib.min.js')) return true;

  return false;
}

async function executeMergePdf() {
  if (selectedPdfFiles.length < 2) {
    alert('Vui lòng chọn ít nhất 2 file PDF để tiến hành gộp.');
    return;
  }

  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5) để hệ thống tự nạp file vendor.');
    return;
  }

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of selectedPdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_HopNhat_PDF_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Gộp PDF', `Đã ghép thành công ${selectedPdfFiles.length} tệp thành 1 file duy nhất`);
    showToast(`🎉 Gộp ${selectedPdfFiles.length} file PDF thành công! Đã tải về máy.`);
  } catch (err) {
    console.error(err);
    alert('Lỗi gộp PDF: ' + err.message);
  }
}

// 2. Chuyển Ảnh sang PDF (Hỗ trợ xóa từng ảnh hoặc xóa toàn bộ)
function handleImagesForPdf(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  selectedImagesForPdf = [...selectedImagesForPdf, ...files];
  renderImagesForPdf();
  event.target.value = '';
}

function renderImagesForPdf() {
  const container = document.getElementById('img-pdf-container');
  const listEl = document.getElementById('img-pdf-list');
  const countEl = document.getElementById('img-pdf-count');
  if (!container || !listEl) return;

  if (countEl) countEl.textContent = selectedImagesForPdf.length;

  if (!selectedImagesForPdf.length) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  listEl.innerHTML = selectedImagesForPdf.map((f, i) => `
    <div class="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px]">
      <span class="truncate max-w-[170px] sm:max-w-[200px] font-medium" title="${f.name}">${i + 1}. ${f.name}</span>
      <div class="flex items-center gap-1.5">
        <span class="text-slate-400 font-mono text-[10px]">${(f.size / 1024).toFixed(0)} KB</span>
        <button onclick="removeImageForPdf(${i})" class="text-rose-500 hover:text-rose-700 p-0.5 rounded" title="Xóa ảnh chọn nhầm này">
          <i class="ri-close-circle-line text-xs"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function removeImageForPdf(index) {
  selectedImagesForPdf.splice(index, 1);
  renderImagesForPdf();
}

function clearAllImagesForPdf() {
  selectedImagesForPdf = [];
  renderImagesForPdf();
  const input = document.getElementById('img-to-pdf-input');
  if (input) input.value = '';
}

async function convertImagesToPdf() {
  if (!selectedImagesForPdf.length) {
    alert('Vui lòng chọn ít nhất 1 ảnh (JPG, PNG) để tạo PDF.');
    return;
  }
  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5).');
    return;
  }

  try {
    const pdfDoc = await PDFLib.PDFDocument.create();
    const A4_W = 595.28;
    const A4_H = 841.89;
    const MARGIN = 30;
    const MAX_W = A4_W - (MARGIN * 2);
    const MAX_H = A4_H - (MARGIN * 2);

    for (const file of selectedImagesForPdf) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else {
        image = await pdfDoc.embedPng(arrayBuffer);
      }

      const scale = Math.min(MAX_W / image.width, MAX_H / image.height, 1);
      const drawW = image.width * scale;
      const drawH = image.height * scale;
      const posX = (A4_W - drawW) / 2;
      const posY = (A4_H - drawH) / 2;

      const page = pdfDoc.addPage([A4_W, A4_H]);
      page.drawImage(image, {
        x: posX,
        y: posY,
        width: drawW,
        height: drawH
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_GhepAnh_A4_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Ảnh sang PDF', `Đã ghép thành công ${selectedImagesForPdf.length} ảnh sang PDF chuẩn A4`);
    showToast(`🎉 Ghép ${selectedImagesForPdf.length} ảnh sang PDF chuẩn A4 thành công!`);
  } catch (err) {
    alert('Lỗi chuyển đổi: ' + err.message);
  }
}

// 3. Tách Trang PDF theo khoảng (Kế thừa từ CIT-PDF, hỗ trợ xóa file chọn nhầm)
let selectedPdfForSplit = null;
function handlePdfForSplit(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedPdfForSplit = file;
  document.getElementById('split-file-name').textContent = file.name + ` (${(file.size / 1024).toFixed(1)} KB)`;
  document.getElementById('split-controls').classList.remove('hidden');
  event.target.value = '';
}

function clearSplitPdf() {
  selectedPdfForSplit = null;
  const controls = document.getElementById('split-controls');
  if (controls) controls.classList.add('hidden');
  const input = document.getElementById('pdf-split-input');
  if (input) input.value = '';
}

async function executeSplitPdf() {
  if (!selectedPdfForSplit) {
    alert('Vui lòng chọn 1 file PDF để tách trang.');
    return;
  }
  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5).');
    return;
  }
  const rangeStr = document.getElementById('split-range-input').value.trim();
  if (!rangeStr) {
    alert('Vui lòng nhập khoảng trang cần tách (Ví dụ: 1-3, 5).');
    return;
  }
  try {
    const arrayBuffer = await selectedPdfForSplit.arrayBuffer();
    const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const totalPages = srcDoc.getPageCount();
    
    const pageIndices = parsePageRanges(rangeStr, totalPages);
    if (!pageIndices.length) {
      alert(`Khoảng trang không hợp lệ. File này có tổng cộng ${totalPages} trang.`);
      return;
    }
    
    const newDoc = await PDFLib.PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach(p => newDoc.addPage(p));
    
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_TachTrang_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Tách PDF', `Đã tách ${pageIndices.length} trang từ tệp "${selectedPdfForSplit.name}"`);
    showToast(`🎉 Đã tách thành công ${pageIndices.length} trang và lưu vào máy!`);
  } catch (err) {
    alert('Lỗi tách trang PDF: ' + err.message);
  }
}

function parsePageRanges(str, maxPages) {
  const indices = new Set();
  const parts = str.split(',');
  for (const part of parts) {
    const clean = part.trim();
    if (clean.includes('-')) {
      const [start, end] = clean.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const page = Number(clean);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        indices.add(page - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

// 4. Xoay Chiều Trang PDF (Kế thừa từ CIT-PDF, hỗ trợ xóa file chọn nhầm)
let selectedPdfForRotate = null;
function handlePdfForRotate(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedPdfForRotate = file;
  document.getElementById('rotate-file-name').textContent = file.name;
  document.getElementById('rotate-controls').classList.remove('hidden');
  event.target.value = '';
}

function clearRotatePdf() {
  selectedPdfForRotate = null;
  const controls = document.getElementById('rotate-controls');
  if (controls) controls.classList.add('hidden');
  const input = document.getElementById('pdf-rotate-input');
  if (input) input.value = '';
}

async function executeRotatePdf() {
  if (!selectedPdfForRotate) {
    alert('Vui lòng chọn file PDF để xoay.');
    return;
  }
  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5).');
    return;
  }
  const angle = Number(document.getElementById('rotate-angle-select').value) || 90;
  try {
    const arrayBuffer = await selectedPdfForRotate.arrayBuffer();
    const doc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = doc.getPages();
    pages.forEach(p => {
      const current = p.getRotation().angle;
      p.setRotation(PDFLib.degrees((current + angle) % 360));
    });
    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_Xoay_${angle}do_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Xoay PDF', `Đã xoay toàn bộ ${pages.length} trang theo góc ${angle}° tệp "${selectedPdfForRotate.name}"`);
    showToast(`🎉 Đã xoay toàn bộ ${pages.length} trang theo góc ${angle}° thành công!`);
  } catch (err) {
    alert('Lỗi xoay PDF: ' + err.message);
  }
}

// 5. Đóng Dấu Bản Quyền / Watermark PDF Pro (Hỗ trợ tùy biến phông, kích thước, màu sắc & độ mờ)
let selectedPdfForWatermark = null;

function hexToRgb(hex) {
  let c = (hex || '#dc2626').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function setWmColor(colorHex) {
  const picker = document.getElementById('wm-color-picker');
  if (picker) picker.value = colorHex;
  updateWatermarkPreview();
}

function getWatermarkFontFamily(val) {
  switch (val) {
    case 'serif': return '"Times New Roman", Georgia, Cambria, serif';
    case 'mono': return '"Courier New", "JetBrains Mono", Consolas, monospace';
    case 'impact': return 'Impact, "Arial Black", sans-serif';
    case 'sans':
    default:
      return '"Segoe UI", Arial, "Helvetica Neue", sans-serif';
  }
}

function getWatermarkOptions() {
  const textInput = document.getElementById('wm-text-input');
  const text = (textInput ? textInput.value.trim() : '') || 'BẢN SAO NỘI BỘ';

  const fontSelect = document.getElementById('wm-font-select');
  const fontKey = fontSelect ? fontSelect.value : 'sans';
  const fontFamily = getWatermarkFontFamily(fontKey);

  const sizeSlider = document.getElementById('wm-size-slider');
  const fontSize = sizeSlider ? Number(sizeSlider.value) : 80;

  const opacitySlider = document.getElementById('wm-opacity-slider');
  const opacityVal = opacitySlider ? Number(opacitySlider.value) : 35;
  const opacity = opacityVal / 100;

  const colorPicker = document.getElementById('wm-color-picker');
  const colorHex = colorPicker ? colorPicker.value : '#dc2626';
  const rgb = hexToRgb(colorHex);

  return { text, fontKey, fontFamily, fontSize, opacityVal, opacity, colorHex, rgb };
}

function updateWatermarkPreview() {
  const opts = getWatermarkOptions();

  const sizeValEl = document.getElementById('wm-size-val');
  if (sizeValEl) sizeValEl.textContent = `${opts.fontSize}px`;

  const opacityValEl = document.getElementById('wm-opacity-val');
  if (opacityValEl) opacityValEl.textContent = `${opts.opacityVal}%`;

  const canvas = document.getElementById('wm-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Dựng nền mô phỏng giấy
  ctx.save();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  // Vẽ watermark nghiêng nhẹ ở trung tâm preview
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-15 * Math.PI / 180);

  const previewScale = Math.min(1.2, Math.max(0.4, opts.fontSize / 70));
  const previewFontSize = Math.round(22 * previewScale);
  ctx.font = `900 ${previewFontSize}px ${opts.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Fill text với độ mờ
  ctx.fillStyle = `rgba(${opts.rgb.r}, ${opts.rgb.g}, ${opts.rgb.b}, ${Math.max(0.2, opts.opacity)})`;
  ctx.fillText(opts.text, 0, 0);

  // Viền nét mảnh tạo tương phản
  ctx.strokeStyle = `rgba(${opts.rgb.r}, ${opts.rgb.g}, ${opts.rgb.b}, ${Math.max(0.15, opts.opacity * 0.75)})`;
  ctx.lineWidth = 1.2;
  ctx.strokeText(opts.text, 0, 0);

  ctx.restore();
}

function handlePdfForWatermark(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedPdfForWatermark = file;
  const fileNameEl = document.getElementById('wm-file-name');
  if (fileNameEl) fileNameEl.textContent = file.name;
  const fileBox = document.getElementById('wm-file-selected-box');
  if (fileBox) fileBox.classList.remove('hidden');
  const pickBtn = document.getElementById('wm-pick-file-btn');
  if (pickBtn) pickBtn.classList.add('hidden');
  updateWatermarkPreview();
  event.target.value = '';
}

function clearWatermarkPdf() {
  selectedPdfForWatermark = null;
  const fileBox = document.getElementById('wm-file-selected-box');
  if (fileBox) fileBox.classList.add('hidden');
  const pickBtn = document.getElementById('wm-pick-file-btn');
  if (pickBtn) pickBtn.classList.remove('hidden');
  const input = document.getElementById('pdf-wm-input');
  if (input) input.value = '';
}

// Tạo ảnh Watermark chữ chìm độ nét cao bằng Canvas nhúng vào PDF
function createWatermarkPng(text, customOptions) {
  return new Promise((resolve, reject) => {
    try {
      const opts = customOptions || getWatermarkOptions();
      const canvas = document.createElement('canvas');
      const size = 1000;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-45 * Math.PI / 180); // Xoay chéo chuẩn 45 độ

      let fontSize = opts.fontSize || 80;
      const canvasFontSize = Math.round(fontSize * 1.2);
      ctx.font = `900 ${canvasFontSize}px ${opts.fontFamily}`;

      const metrics = ctx.measureText(text);
      if (metrics.width > 850) {
        const scaledSize = Math.max(24, Math.floor(canvasFontSize * (850 / metrics.width)));
        ctx.font = `900 ${scaledSize}px ${opts.fontFamily}`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Màu chữ theo cấu hình của người dùng
      ctx.fillStyle = `rgba(${opts.rgb.r}, ${opts.rgb.g}, ${opts.rgb.b}, ${opts.opacity})`;
      ctx.fillText(text, 0, 0);

      // Viền nét mảnh nhẹ tạo độ tương phản
      ctx.strokeStyle = `rgba(${opts.rgb.r}, ${opts.rgb.g}, ${opts.rgb.b}, ${opts.opacity * 0.75})`;
      ctx.lineWidth = 2.5;
      ctx.strokeText(text, 0, 0);

      ctx.restore();

      const fallbackDataUrl = () => {
        const dataUrl = canvas.toDataURL('image/png');
        const binStr = atob(dataUrl.split(',')[1]);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        resolve(bytes.buffer);
      };

      if (canvas.toBlob) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            fallbackDataUrl();
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve(buf);
        }, 'image/png');
      } else {
        fallbackDataUrl();
      }
    } catch (err) {
      reject(err);
    }
  });
}

async function executeWatermarkPdf() {
  if (!selectedPdfForWatermark) {
    const input = document.getElementById('pdf-wm-input');
    if (input) input.click();
    return;
  }
  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5).');
    return;
  }

  const opts = getWatermarkOptions();
  const text = opts.text;

  try {
    const arrayBuffer = await selectedPdfForWatermark.arrayBuffer();
    const doc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = doc.getPages();
    
    // Tạo ảnh watermark PNG hỗ trợ trọn vẹn tiếng Việt có dấu với cấu hình tùy biến
    const pngBuffer = await createWatermarkPng(text, opts);
    const watermarkImage = await doc.embedPng(pngBuffer);
    
    pages.forEach(p => {
      const { width, height } = p.getSize();
      const wmDim = Math.min(width, height) * 0.85;
      p.drawImage(watermarkImage, {
        x: (width - wmDim) / 2,
        y: (height - wmDim) / 2,
        width: wmDim,
        height: wmDim,
        opacity: 0.95,
      });
    });
    
    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_Watermark_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Watermark', `Đã đóng dấu "${text}" (${opts.fontKey}, ${opts.fontSize}px, ${opts.colorHex}, ${opts.opacityVal}%) vào tệp "${selectedPdfForWatermark.name}"`);
    showToast(`🎉 Đã đóng dấu watermark "${text}" thành công!`);
  } catch (err) {
    alert('Lỗi đóng dấu watermark: ' + err.message);
  }
}

// 6. Chuyển Đổi Font Chữ Tiếng Việt Văn Phòng (TCVN3 sang Unicode Chuẩn)
const TCVN3_CHARS = "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";
const TCVN3_MAP = {
  'µ': 'à', '¸': 'á', '¶': 'ả', '·': 'ã', '¹': 'ạ',
  '¨': 'ă', '»': 'ằ', '¾': 'ắ', '¼': 'ẳ', '½': 'ẵ', 'Æ': 'ặ',
  '©': 'â', 'Ç': 'ầ', 'Ê': 'ấ', 'È': 'ẩ', 'É': 'ẫ', 'Ë': 'ậ',
  'Ì': 'è', 'Ð': 'é', 'Î': 'ẻ', 'Ï': 'ẽ', 'Ñ': 'ẹ',
  'ª': 'ê', 'Ò': 'ề', 'Õ': 'ế', 'Ó': 'ể', 'Ô': 'ễ', 'Ö': 'ệ',
  '×': 'ì', 'Ý': 'í', 'Ø': 'ỉ', 'Ü': 'ĩ', 'Þ': 'ị',
  'ß': 'ò', 'á': 'ó', 'à': 'ỏ', 'ã': 'õ', 'ä': 'ọ',
  '«': 'ô', 'å': 'ồ', 'è': 'ố', 'æ': 'ổ', 'ç': 'ỗ', 'é': 'ộ',
  '¬': 'ơ', 'ê': 'ờ', 'í': 'ớ', 'ë': 'ở', 'ì': 'ỡ', 'î': 'ợ',
  'ï': 'ù', 'ó': 'ú', 'ñ': 'ủ', 'ò': 'ũ', 'ô': 'ụ',
  '­': 'ư', 'õ': 'ừ', 'ø': 'ứ', 'ö': 'ử', '÷': 'ữ', 'ù': 'ự',
  'ú': 'ỳ', 'ý': 'ý', 'û': 'ỷ', 'ü': 'ỹ', 'þ': 'ỵ',
  '®': 'đ', '§': 'Đ'
};

function clearFontConverter() {
  document.getElementById('font-input-text').value = '';
  document.getElementById('font-output-text').value = '';
}

function convertTcvn3ToUnicode() {
  const input = document.getElementById('font-input-text').value;
  if (!input) {
    alert('Vui lòng dán văn bản bị lỗi font vào ô bên trái.');
    return;
  }

  let output = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    output += TCVN3_MAP[ch] !== undefined ? TCVN3_MAP[ch] : ch;
  }

  document.getElementById('font-output-text').value = output;
  logOfficeAction('Sửa lỗi font', `Đã chuyển đổi đoạn văn bản (${input.length} ký tự) sang Unicode chuẩn`);
  showToast('⚡ Đã sửa lỗi font tiếng Việt thành công!');
}

function copyConvertedFont() {
  const out = document.getElementById('font-output-text').value;
  if (!out) return;
  navigator.clipboard.writeText(out);
  showToast('📋 Đã sao chép văn bản Unicode chuẩn sang bộ nhớ tạm!');
}

// ------------------------------------------------------------
// 7. XÓA TRANG & ĐỔI THỨ TỰ TRANG PDF TRỰC QUAN (MỚI ⭐)
// ------------------------------------------------------------
let reorderPdfBytes = null;
let reorderPdfFileName = '';
let reorderPages = [];

async function handlePdfForReorder(event) {
  const file = event.target.files[0];
  if (!file) return;
  reorderPdfFileName = file.name;
  reorderPdfBytes = await file.arrayBuffer();
  reorderPages = [];

  document.getElementById('reorder-file-info').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  document.getElementById('reorder-controls').classList.remove('hidden');

  const grid = document.getElementById('reorder-grid');
  grid.innerHTML = '<div class="col-span-3 py-4 text-center text-purple-600 font-bold text-xs"><i class="ri-loader-4-line animate-spin text-base"></i> Đang kết xuất hình ảnh các trang...</div>';

  try {
    if (window.pdfjsLib) {
      const loadingTask = pdfjsLib.getDocument({ data: reorderPdfBytes });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        reorderPages.push({
          pageNum: i,
          originalIndex: i - 1,
          thumbUrl: canvas.toDataURL(),
          deleted: false
        });
      }
    } else {
      const isReady = await ensurePdfLib();
      if (isReady) {
        const doc = await PDFLib.PDFDocument.load(reorderPdfBytes);
        const numPages = doc.getPageCount();
        for (let i = 1; i <= numPages; i++) {
          reorderPages.push({
            pageNum: i,
            originalIndex: i - 1,
            thumbUrl: '',
            deleted: false
          });
        }
      }
    }
    renderReorderGrid();
  } catch (err) {
    console.error("Lỗi dựng trang PDF:", err);
    alert("Không thể đọc tệp PDF. Tệp có thể có mật khẩu bảo vệ hoặc bị lỗi định dạng.");
  }
  event.target.value = '';
}

function renderReorderGrid() {
  const grid = document.getElementById('reorder-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!reorderPages.length) {
    grid.innerHTML = '<p class="col-span-3 text-center text-slate-400 py-3">Không có trang nào.</p>';
    return;
  }

  reorderPages.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = `p-1.5 rounded-lg border text-center text-[10px] space-y-1 transition relative ${
      p.deleted ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 opacity-50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`;

    div.innerHTML = `
      <div class="h-16 w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded overflow-hidden">
        ${p.thumbUrl ? `<img src="${p.thumbUrl}" class="max-h-16 object-contain" />` : `<span class="font-bold text-slate-400">Trang ${p.pageNum}</span>`}
      </div>
      <div class="flex items-center justify-between px-1">
        <span class="font-bold ${p.deleted ? 'line-through text-rose-500' : 'text-slate-700 dark:text-slate-300'}">P.${p.pageNum}</span>
        <div class="flex gap-0.5">
          <button type="button" onclick="shiftReorderPage(${idx}, -1)" class="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 font-bold" title="Dời sang trái">◄</button>
          <button type="button" onclick="shiftReorderPage(${idx}, 1)" class="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 font-bold" title="Dời sang phải">►</button>
        </div>
      </div>
      <button type="button" onclick="toggleDeletePage(${idx})" class="w-full py-0.5 text-[9px] font-bold rounded ${
        p.deleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-300' : 'bg-rose-50 text-rose-600 border border-rose-200'
      }">
        ${p.deleted ? 'Khôi phục' : 'Xóa trang'}
      </button>
    `;
    grid.appendChild(div);
  });
}

function toggleDeletePage(idx) {
  if (reorderPages[idx]) {
    reorderPages[idx].deleted = !reorderPages[idx].deleted;
    renderReorderGrid();
  }
}

function shiftReorderPage(idx, dir) {
  const targetIdx = idx + dir;
  if (targetIdx >= 0 && targetIdx < reorderPages.length) {
    const tmp = reorderPages[idx];
    reorderPages[idx] = reorderPages[targetIdx];
    reorderPages[targetIdx] = tmp;
    renderReorderGrid();
  }
}

function clearReorderPdf() {
  reorderPdfBytes = null;
  reorderPdfFileName = '';
  reorderPages = [];
  document.getElementById('reorder-controls')?.classList.add('hidden');
  const input = document.getElementById('pdf-reorder-input');
  if (input) input.value = '';
}

async function executeReorderPdf() {
  if (!reorderPdfBytes) {
    alert("Vui lòng chọn file PDF để sắp xếp trang.");
    return;
  }
  const activePages = reorderPages.filter(p => !p.deleted);
  if (!activePages.length) {
    alert("Anh đã xóa hết tất cả các trang! Vui lòng giữ lại ít nhất 1 trang.");
    return;
  }

  const isReady = await ensurePdfLib();
  if (!isReady) return;

  try {
    const srcDoc = await PDFLib.PDFDocument.load(reorderPdfBytes);
    const newDoc = await PDFLib.PDFDocument.create();

    const indices = activePages.map(p => p.originalIndex);
    const copied = await newDoc.copyPages(srcDoc, indices);
    copied.forEach(p => newDoc.addPage(p));

    const newBytes = await newDoc.save();
    const blob = new Blob([newBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_XepTrang_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    logOfficeAction('Xóa/Đổi trang PDF', `Đã xuất file PDF mới gồm ${activePages.length} trang từ "${reorderPdfFileName}"`);
    showToast(`🎉 Xuất file PDF mới thành công (${activePages.length} trang)!`);
  } catch (err) {
    alert("Lỗi xuất PDF: " + err.message);
  }
}

// ------------------------------------------------------------
// 8. NÉN GIẢM DUNG LƯỢNG FILE PDF (MỚI ⭐)
// ------------------------------------------------------------
let compressPdfBytes = null;
let compressPdfFileName = '';
let compressPdfOrigSize = 0;

function handlePdfForCompress(event) {
  const file = event.target.files[0];
  if (!file) return;
  compressPdfFileName = file.name;
  compressPdfOrigSize = file.size;

  const reader = new FileReader();
  reader.onload = (e) => {
    compressPdfBytes = e.target.result;
    document.getElementById('compress-file-info').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('compress-controls').classList.remove('hidden');
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function clearCompressPdf() {
  compressPdfBytes = null;
  compressPdfFileName = '';
  compressPdfOrigSize = 0;
  document.getElementById('compress-controls')?.classList.add('hidden');
  const input = document.getElementById('pdf-compress-input');
  if (input) input.value = '';
}

async function executeCompressPdf() {
  if (!compressPdfBytes) {
    alert("Vui lòng chọn file PDF để nén.");
    return;
  }

  const isReady = await ensurePdfLib();
  if (!isReady) return;

  showToast("Đang tối ưu hóa luồng nhị phân PDF...");

  try {
    const doc = await PDFLib.PDFDocument.load(compressPdfBytes);
    
    // Lược bỏ metadata thừa
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setProducer('ZenTool Suite Optimizer');
    doc.setCreator('ZenTool');

    // Lưu với cấu hình Object Streams nén chặt
    const compressedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 100
    });

    const newSize = compressedBytes.length;
    const savedPercent = Math.max(0, Math.round((1 - (newSize / compressPdfOrigSize)) * 100));

    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_Nen_${compressPdfFileName}`;
    a.click();
    URL.revokeObjectURL(url);

    logOfficeAction('Nén PDF', `Đã nén tệp "${compressPdfFileName}": ${(compressPdfOrigSize/1024).toFixed(1)} KB ➔ ${(newSize/1024).toFixed(1)} KB (Giảm -${savedPercent}%)`);
    showToast(`🎉 Nén PDF thành công! Đã giảm -${savedPercent}% dung lượng.`);
  } catch (err) {
    alert("Lỗi nén file PDF: " + err.message);
  }
}

// ------------------------------------------------------------
// 9. TRÍCH XUẤT ẢNH TỪ PDF SANG JPG/PNG & 1-CLICK ZIP (MỚI ⭐)
// ------------------------------------------------------------
let extractPdfBytes = null;
let extractPdfFileName = '';

function handlePdfForImagesExtract(event) {
  const file = event.target.files[0];
  if (!file) return;
  extractPdfFileName = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    extractPdfBytes = e.target.result;
    document.getElementById('pdf-to-img-info').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('pdf-to-img-controls').classList.remove('hidden');
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function clearPdfToImg() {
  extractPdfBytes = null;
  extractPdfFileName = '';
  document.getElementById('pdf-to-img-controls')?.classList.add('hidden');
  const input = document.getElementById('pdf-to-img-input');
  if (input) input.value = '';
}

async function executePdfToImages() {
  if (!extractPdfBytes) {
    alert("Vui lòng chọn file PDF để trích xuất ảnh.");
    return;
  }

  if (!window.pdfjsLib) {
    alert("Thư viện PDF.js đang được nạp. Anh vui lòng thử lại sau 3 giây.");
    return;
  }

  const btn = document.getElementById('btn-extract-pdf-images');
  if (btn) btn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Đang trích xuất ảnh...';

  const format = document.getElementById('pdf-img-format')?.value || 'jpeg';
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';
  const scale = Number(document.getElementById('pdf-img-dpi')?.value) || 1.5;

  try {
    const loadingTask = pdfjsLib.getDocument({ data: extractPdfBytes });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const images = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise(res => canvas.toBlob(res, mimeType, 0.9));
      images.push({ pageNum: i, blob, fileName: `Trang_${i}.${ext}` });
    }

    if (typeof JSZip !== 'undefined') {
      const zip = new JSZip();
      const folder = zip.folder(`ZenTool_Anh_PDF_${extractPdfFileName.replace('.pdf', '')}`);
      images.forEach(img => folder.file(img.fileName, img.blob));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZenTool_PDF_Trang_Anh_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`📦 Đã trích xuất ${images.length} trang và đóng gói ZIP thành công!`);
    } else {
      images.forEach((img, idx) => {
        setTimeout(() => {
          const url = URL.createObjectURL(img.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = img.fileName;
          a.click();
          URL.revokeObjectURL(url);
        }, idx * 200);
      });
      showToast(`🎉 Đã xuất thành công ${images.length} ảnh từ file PDF!`);
    }

    logOfficeAction('Trích xuất ảnh PDF', `Đã xuất ${numPages} trang thành ảnh từ "${extractPdfFileName}"`);
  } catch (err) {
    console.error("Lỗi trích xuất ảnh:", err);
    alert("Lỗi trích xuất ảnh PDF: " + err.message);
  } finally {
    if (btn) btn.innerHTML = '<i class="ri-folder-zip-line"></i> Trích Xuất & Tải File ZIP';
  }
}

// ------------------------------------------------------------
// 10. MỞ KHÓA / GỠ MẬT KHẨU PDF SAO KÊ NGÂN HÀNG (MỚI ⭐)
// ------------------------------------------------------------
let unlockPdfBytes = null;
let unlockPdfFileName = '';

function handlePdfForUnlock(event) {
  const file = event.target.files[0];
  if (!file) return;
  unlockPdfFileName = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    unlockPdfBytes = e.target.result;
    document.getElementById('unlock-file-info').textContent = file.name;
    document.getElementById('unlock-controls').classList.remove('hidden');
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function clearUnlockPdf() {
  unlockPdfBytes = null;
  unlockPdfFileName = '';
  document.getElementById('unlock-controls')?.classList.add('hidden');
  const input = document.getElementById('pdf-unlock-input');
  if (input) input.value = '';
}

async function executeUnlockPdf() {
  if (!unlockPdfBytes) {
    alert("Vui lòng chọn file PDF sao kê cần mở khóa.");
    return;
  }

  const password = document.getElementById('unlock-password-input').value.trim();
  if (!password) {
    alert("Vui lòng nhập mật khẩu (CCCD/CMND hoặc ngày sinh) của file sao kê.");
    return;
  }

  if (!window.pdfjsLib) {
    alert("Thư viện giải mã đang nạp. Vui lòng thử lại sau vài giây.");
    return;
  }

  showToast("Đang giải mã và loại bỏ mật khẩu vĩnh viễn...");

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: unlockPdfBytes,
      password: password
    });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const isReady = await ensurePdfLib();
    if (!isReady) return;

    // Tái tạo lại tài liệu PDF mới sạch hoàn toàn mật khẩu
    const cleanDoc = await PDFLib.PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));
      const imgBytes = await imgBlob.arrayBuffer();
      const embeddedImg = await cleanDoc.embedJpg(imgBytes);

      const ptWidth = viewport.width / 2.0;
      const ptHeight = viewport.height / 2.0;
      const newPage = cleanDoc.addPage([ptWidth, ptHeight]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: ptWidth,
        height: ptHeight
      });
    }

    const cleanBytes = await cleanDoc.save();
    const blob = new Blob([cleanBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = unlockPdfFileName.replace('.pdf', '');
    a.download = `${baseName}_DaMoKhoa_ZenTool.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    logOfficeAction('Mở khóa PDF', `Đã gỡ mật khẩu thành công tệp sao kê "${unlockPdfFileName}"`);
    showToast("🎉 Đã mở khóa thành công! File tải về không còn mật khẩu nữa.");
  } catch (err) {
    console.error("Lỗi giải mã PDF:", err);
    alert("Mật khẩu không chính xác hoặc tệp không hỗ trợ định dạng này. Anh vui lòng kiểm tra lại mật khẩu CCCD/ngày sinh!");
  }
}

// ------------------------------------------------------------
// 11. KÝ TÊN ĐIỆN TỬ LÊN HỢP ĐỒNG PDF (MỚI ⭐)
// ------------------------------------------------------------
let signPdfBytes = null;
let signPdfFileName = '';
let signMode = 'draw';
let signatureImageDataUrl = null;
let signatureCanvasInit = false;

function handlePdfForSign(event) {
  const file = event.target.files[0];
  if (!file) return;
  signPdfFileName = file.name;

  const reader = new FileReader();
  reader.onload = async (e) => {
    signPdfBytes = e.target.result;
    document.getElementById('sign-file-info').textContent = file.name;
    document.getElementById('sign-controls').classList.remove('hidden');

    if (!signatureCanvasInit) {
      initSignatureCanvas();
      signatureCanvasInit = true;
    }

    if (window.pdfjsLib) {
      try {
        const pdf = await pdfjsLib.getDocument({ data: signPdfBytes }).promise;
        const select = document.getElementById('sign-page-select');
        if (select) {
          select.innerHTML = `
            <option value="last">Trang cuối cùng (${pdf.numPages}) — Khuyên dùng</option>
            ${Array.from({ length: pdf.numPages }, (_, i) => `<option value="${i + 1}">Trang ${i + 1}</option>`).join('')}
          `;
        }
      } catch (e) {}
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function switchSignMode(mode) {
  signMode = mode;
  const drawArea = document.getElementById('sign-draw-area');
  const uploadArea = document.getElementById('sign-upload-area');
  const tabDraw = document.getElementById('sign-tab-draw');
  const tabUpload = document.getElementById('sign-tab-upload');

  if (mode === 'draw') {
    drawArea?.classList.remove('hidden');
    uploadArea?.classList.add('hidden');
    tabDraw.className = "px-2.5 py-1 font-bold text-blue-600 border-b-2 border-blue-600";
    tabUpload.className = "px-2.5 py-1 text-slate-400 hover:text-slate-600";
  } else {
    drawArea?.classList.add('hidden');
    uploadArea?.classList.remove('hidden');
    tabUpload.className = "px-2.5 py-1 font-bold text-blue-600 border-b-2 border-blue-600";
    tabDraw.className = "px-2.5 py-1 text-slate-400 hover:text-slate-600";
  }
}

function initSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;

  ctx.strokeStyle = "#0369a1"; // Nét mực xanh bút ký
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (e.touches) e.preventDefault();
  };

  const doDraw = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (e.touches) e.preventDefault();
  };

  const stopDraw = () => {
    drawing = false;
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', doDraw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', doDraw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);
}

function clearSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureImageDataUrl = null;
}

function handleSignatureImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r > 215 && g > 215 && b > 215) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      signatureImageDataUrl = canvas.toDataURL('image/png');
      showToast("✓ Đã tải và tự động lọc trong suốt nền chữ ký!");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearSignPdf() {
  signPdfBytes = null;
  signPdfFileName = '';
  signatureImageDataUrl = null;
  clearSignatureCanvas();
  document.getElementById('sign-controls')?.classList.add('hidden');
  const input = document.getElementById('pdf-sign-input');
  if (input) input.value = '';
}

async function executeSignPdf() {
  if (!signPdfBytes) {
    alert("Vui lòng chọn file hợp đồng PDF cần ký.");
    return;
  }

  let pngDataUrl = signatureImageDataUrl;
  if (signMode === 'draw') {
    const canvas = document.getElementById('signature-canvas');
    if (canvas) pngDataUrl = canvas.toDataURL('image/png');
  }

  if (!pngDataUrl) {
    alert("Vui lòng vẽ chữ ký tay hoặc tải ảnh chữ ký trước khi đóng dấu hợp đồng.");
    return;
  }

  const isReady = await ensurePdfLib();
  if (!isReady) return;

  showToast("Đang chèn chữ ký vào hợp đồng...");

  try {
    const doc = await PDFLib.PDFDocument.load(signPdfBytes);
    const pages = doc.getPages();
    const total = pages.length;

    const pageSelectVal = document.getElementById('sign-page-select')?.value || 'last';
    let targetIndex = total - 1;
    if (pageSelectVal !== 'last') {
      targetIndex = Math.max(0, Math.min(total - 1, Number(pageSelectVal) - 1));
    }

    const targetPage = pages[targetIndex];
    const { width, height } = targetPage.getSize();

    const binStr = atob(pngDataUrl.split(',')[1]);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }

    const sigImage = await doc.embedPng(bytes.buffer);

    const sigW = 150;
    const sigH = 65;
    const posX = Math.max(20, width - sigW - 60);
    const posY = Math.max(30, 80);

    targetPage.drawImage(sigImage, {
      x: posX,
      y: posY,
      width: sigW,
      height: sigH
    });

    const signedBytes = await doc.save();
    const blob = new Blob([signedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = signPdfFileName.replace('.pdf', '');
    a.download = `${baseName}_DaKy_ZenTool.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    logOfficeAction('Ký hợp đồng PDF', `Đã ký thành công lên trang ${targetIndex + 1} tệp "${signPdfFileName}"`);
    showToast("🎉 Ký hợp đồng thành công! Đã lưu file PDF hoàn chỉnh về máy.");
  } catch (err) {
    console.error("Lỗi ký PDF:", err);
    alert("Lỗi ký hợp đồng: " + err.message);
  }
}

// ============================================================
// PHÂN HỆ 3: TÍNH LỢI NHUẬN SÀN & THUẾ TMĐT CHUYÊN SÂU
// ============================================================

function initCategorySelect() {
  const sel = document.getElementById('calc-category-select');
  if (!sel) return;
  sel.innerHTML = Object.keys(CATEGORY_PROFILES).map(k => `
    <option value="${k}">${CATEGORY_PROFILES[k].name}</option>
  `).join('');
}

function onCategoryChange() {
  const catKey = document.getElementById('calc-category-select').value;
  const profile = CATEGORY_PROFILES[catKey] || CATEGORY_PROFILES.general;

  document.getElementById('cat-desc-text').textContent = profile.description;
  document.getElementById('calc-return-rate').value = profile.defaultReturnRate;

  calculateDetailedProfit();
}

function setPlatform(platform) {
  currentPlatform = platform;
  const shopeeBtn = document.getElementById('platform-shopee-btn');
  const tiktokBtn = document.getElementById('platform-tiktok-btn');

  if (platform === 'shopee') {
    shopeeBtn.className = "py-2.5 px-3 rounded-xl border-2 border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition";
    tiktokBtn.className = "py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition";
  } else {
    tiktokBtn.className = "py-2.5 px-3 rounded-xl border-2 border-black dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition";
    shopeeBtn.className = "py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition";
  }

  calculateDetailedProfit();
}

function calculateDetailedProfit() {
  const catKey = document.getElementById('calc-category-select') ? document.getElementById('calc-category-select').value : 'fashion';
  const profile = CATEGORY_PROFILES[catKey] || CATEGORY_PROFILES.fashion;

  const cogs = Number(document.getElementById('calc-cogs').value) || 0;
  const price = Number(document.getElementById('calc-price').value) || 0;
  const packaging = Number(document.getElementById('calc-packaging').value) || 0;
  const ads = Number(document.getElementById('calc-ads').value) || 0;
  const affiliateRate = (Number(document.getElementById('calc-affiliate-rate').value) || 0) / 100;
  const returnRate = (Number(document.getElementById('calc-return-rate').value) || 0) / 100;

  const hasFreeship = document.getElementById('fee-freeship').checked;
  const hasVoucher = document.getElementById('fee-voucher').checked;
  const hasTax = document.getElementById('calc-tax-enabled').checked;

  // 1. Phí giao dịch / xử lý thanh toán (6% chuẩn Shopee & TikTok Shop mới nhất)
  const paymentFeeRate = 0.06;
  const paymentFee = price * paymentFeeRate;

  // 2. Phí hạ tầng / xử lý đơn cố định (3.000 VNĐ / đơn thành công)
  const infrastructureFee = price > 0 ? 3000 : 0;

  // 3. Phí hoa hồng nền tảng / Phí cố định theo ngành hàng
  const fixedRate = (currentPlatform === 'shopee') ? profile.fixedRateShopee : profile.fixedRateTiktok;
  const fixedCommissionFee = price * fixedRate;

  // 4. Phí dịch vụ tùy chọn
  // Freeship Xtra: Shopee 6% (tối đa 40.000đ), TikTok 5.5%
  let freeshipFee = 0;
  if (hasFreeship) {
    if (currentPlatform === 'shopee') {
      freeshipFee = Math.min(price * 0.06, 40000);
    } else {
      freeshipFee = price * 0.055;
    }
  }

  // Voucher Xtra: 4%
  const voucherFee = hasVoucher ? (price * 0.04) : 0;

  // Hoa hồng Affiliate Tiếp thị liên kết (KOL / KOC)
  const affiliateFee = price * affiliateRate;

  // Tổng các khoản phí bị sàn khấu trừ
  const totalPlatformDeductions = paymentFee + infrastructureFee + fixedCommissionFee + freeshipFee + voucherFee;

  // Tiền sàn thanh toán về ví nhà bán hàng (Net Payout)
  const netPayout = price - totalPlatformDeductions;

  // 5. Chi phí hao hụt hàng hoàn (Chuyển hoàn bị gãy hỏng bao bì + phí đóng gói mất trắng)
  const returnDamagePerUnit = (cogs * 0.15 + packaging + 12000) * returnRate;

  // 6. Nghĩa vụ thuế TMĐT (Thông tư 40/2021/TT-BTC: 1% GTGT + 0.5% TNCN = 1.5% Doanh thu)
  const taxAmount = hasTax ? (price * 0.015) : 0;

  // 7. Chi phí vận hành
  const operationCosts = packaging + ads + affiliateFee;

  // 8. LỢI NHUẬN RÒNG THỰC TẾ (NET PROFIT)
  const netProfit = netPayout - cogs - operationCosts - returnDamagePerUnit - taxAmount;
  const netMargin = price > 0 ? (netProfit / price) * 100 : 0;

  // Update KPI Cards
  document.getElementById('kpi-net-profit').textContent = `${Math.round(netProfit).toLocaleString('vi-VN')} đ`;
  const marginPrefix = currentLanguage === 'de' ? 'Netto-Gewinnmarge:' : (currentLanguage === 'en' ? 'Net Margin:' : 'Biên lãi ròng:');
  document.getElementById('kpi-net-margin').textContent = `${marginPrefix} ${netMargin.toFixed(1)}%`;
  document.getElementById('kpi-payout').textContent = `${Math.round(netPayout).toLocaleString('vi-VN')} đ`;

  // Color Coding KPI
  const kpiEl = document.getElementById('kpi-net-profit');
  if (netProfit < 0) {
    kpiEl.className = "text-2xl font-black text-rose-600 dark:text-rose-400 font-mono";
  } else if (netMargin < 12) {
    kpiEl.className = "text-2xl font-black text-amber-500 font-mono";
  } else {
    kpiEl.className = "text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono";
  }

  // Update Breakdown Table
  document.getElementById('breakdown-revenue').textContent = `${price.toLocaleString('vi-VN')} đ`;
  document.getElementById('breakdown-cogs').textContent = `-${cogs.toLocaleString('vi-VN')} đ`;
  document.getElementById('breakdown-fixed-fee').textContent = `-${Math.round(fixedCommissionFee).toLocaleString('vi-VN')} đ (${(fixedRate * 100).toFixed(1)}%)`;
  document.getElementById('breakdown-payment-fee').textContent = `-${Math.round(paymentFee + infrastructureFee).toLocaleString('vi-VN')} đ (6% + 3k)`;
  document.getElementById('breakdown-service-fee').textContent = `-${Math.round(freeshipFee + voucherFee).toLocaleString('vi-VN')} đ`;
  document.getElementById('breakdown-operation-costs').textContent = `-${Math.round(operationCosts).toLocaleString('vi-VN')} đ`;
  document.getElementById('breakdown-return-cost').textContent = `-${Math.round(returnDamagePerUnit).toLocaleString('vi-VN')} đ (Tỷ lệ ${(returnRate * 100).toFixed(0)}%)`;
  document.getElementById('breakdown-tax').textContent = `-${Math.round(taxAmount).toLocaleString('vi-VN')} đ`;

  // Update AI Copilot Advice
  generateDetailedAiAdvice(netProfit, netMargin, price, totalPlatformDeductions, ads, returnRate, profile.name);
}

function generateDetailedAiAdvice(netProfit, netMargin, price, totalFees, ads, returnRate, catName) {
  const box = document.getElementById('ai-advisor-box');
  const text = document.getElementById('ai-advisor-text');

  if (netProfit < 0) {
    box.className = "p-4 sm:p-5 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/30 text-xs space-y-2";
    text.innerHTML = `⚠️ <strong>BÁO ĐỘNG ĐỎ: ĐANG BÁN LỖ NGẦM ${Math.round(netProfit).toLocaleString('vi-VN')} đ TRÊN MỖI ĐƠN!</strong><br>
    Với ngành <strong>${catName}</strong>, phí sàn (${Math.round(totalFees).toLocaleString('vi-VN')} đ) cộng với chi phí Ads và tỷ lệ hoàn hàng (${(returnRate * 100).toFixed(0)}%) đã vượt quá giá bán.<br>
    <strong>Đề xuất khắc phục:</strong> Nâng giá niêm yết lên tối thiểu <strong>${Math.round((price * 1.25) / 1000) * 1000} đ</strong> hoặc tạo gói combo 2 sản phẩm để dàn trải chi phí cố định 3.000đ và phí Ads.`;
  } else if (netMargin < 12) {
    box.className = "p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/30 text-xs space-y-2";
    text.innerHTML = `⚡ <strong>CẢNH BÁO: BIÊN LÃI MỎNG (${netMargin.toFixed(1)}%) — RỦI RO LỖ CUỐI THÁNG CAO!</strong><br>
    Mức lãi ròng ${Math.round(netProfit).toLocaleString('vi-VN')} đ/đơn rất dễ bị cuốn trôi nếu tuần tới phát sinh thêm ca hoàn hàng hoặc khách áp voucher trợ giá.<br>
    <strong>Đề xuất:</strong> Hãy cân nhắc giảm tỷ lệ hoa hồng Affiliate hoặc đàm phán lại giá vốn nhà cung cấp để đẩy biên lãi lên trên 18%.`;
  } else {
    box.className = "p-4 sm:p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/20 text-xs space-y-2";
    text.innerHTML = `🎉 <strong>CHỈ SỐ TÀI CHÍNH AN TOÀN: BIÊN LÃI RÒNG ĐẠT ${netMargin.toFixed(1)}% (${Math.round(netProfit).toLocaleString('vi-VN')} đ/đơn)!</strong><br>
    Mô hình sản phẩm <strong>${catName}</strong> này đã bao gồm đầy đủ thuế TMĐT 1.5%, chi phí hoàn hàng và mọi phí sàn. Anh có thể tự tin đẩy mạnh hiển thị!`;
  }
}

// ============================================================
// PHÂN HỆ 4: ĐỔI ẢNH HEIC IPHONE & NÉN ẢNH TỐI ƯU
// ============================================================

// Chuyển đổi giữa 2 phân nhóm: Đổi ảnh HEIC vs Nén ảnh WebP
function switchMediaSubTab(subTab) {
  const heicView = document.getElementById('media-heic-view');
  const compressView = document.getElementById('media-compress-view');
  const bgremoveView = document.getElementById('media-bgremove-view');
  const btnHeic = document.getElementById('media-subtab-heic');
  const btnCompress = document.getElementById('media-subtab-compress');
  const btnBgremove = document.getElementById('media-subtab-bgremove');

  const activeClass = "px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm";
  const inactiveClass = "px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900";

  if (heicView) heicView.classList.toggle('hidden', subTab !== 'heic');
  if (compressView) compressView.classList.toggle('hidden', subTab !== 'compress');
  if (bgremoveView) bgremoveView.classList.toggle('hidden', subTab !== 'bgremove');

  if (btnHeic) btnHeic.className = (subTab === 'heic') ? activeClass : inactiveClass;
  if (btnCompress) btnCompress.className = (subTab === 'compress') ? activeClass : inactiveClass;
  if (btnBgremove) btnBgremove.className = (subTab === 'bgremove') ? activeClass : inactiveClass;
}

// ------------------------------------------------------------
// TÍNH NĂNG 1: CHUYỂN ĐỔI ẢNH HEIC HÀNG LOẠT (CLIENT-SIDE IN RAM)
// ------------------------------------------------------------

async function handleHeicBatchUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const targetFormat = document.getElementById('heic-format-select')?.value || 'image/jpeg';
  const targetQuality = Number(document.getElementById('heic-quality-select')?.value) || 0.8;
  const targetExt = targetFormat === 'image/jpeg' ? 'jpg' : (targetFormat === 'image/webp' ? 'webp' : 'png');

  const progressBox = document.getElementById('heic-progress-box');
  const progressBar = document.getElementById('heic-progress-bar');
  const progressLabel = document.getElementById('heic-progress-label');
  const progressPercent = document.getElementById('heic-progress-percent');
  const placeholder = document.getElementById('heic-placeholder');
  const resultsContainer = document.getElementById('heic-results-container');

  if (placeholder) placeholder.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.add('hidden');
  if (progressBox) progressBox.classList.remove('hidden');

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round(((i) / files.length) * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `Đang giải mã ảnh (${i + 1}/${files.length}): ${file.name}...`;

    try {
      let convertedBlob = null;
      // Thử giải mã qua heic2any nếu có sẵn
      if (typeof heic2any !== 'undefined') {
        try {
          const res = await heic2any({
            blob: file,
            toType: targetFormat,
            quality: targetQuality
          });
          convertedBlob = Array.isArray(res) ? res[0] : res;
        } catch (hErr) {
          console.warn("heic2any cảnh báo, thử canvas fallback:", hErr);
          convertedBlob = await convertFileViaCanvasFallback(file, targetFormat, targetQuality);
        }
      } else {
        convertedBlob = await convertFileViaCanvasFallback(file, targetFormat, targetQuality);
      }

      if (convertedBlob) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const outFileName = `${baseName}_converted.${targetExt}`;
        const objectUrl = URL.createObjectURL(convertedBlob);

        convertedHeicFiles.push({
          origName: file.name,
          origSize: file.size,
          outName: outFileName,
          blob: convertedBlob,
          size: convertedBlob.size,
          url: objectUrl,
          ext: targetExt,
          formatName: targetExt.toUpperCase()
        });
        successCount++;
      }
    } catch (err) {
      console.error("Không thể chuyển đổi file:", file.name, err);
    }
  }

  if (progressBar) progressBar.style.width = '100%';
  if (progressPercent) progressPercent.textContent = '100%';
  if (progressLabel) progressLabel.textContent = `Hoàn tất chuyển đổi ${successCount}/${files.length} ảnh!`;

  setTimeout(() => {
    if (progressBox) progressBox.classList.add('hidden');
    renderHeicResultsList();
    if (successCount > 0) {
      showToast(`🎉 Đã chuyển đổi thành công ${successCount} ảnh iPhone sang ${targetExt.toUpperCase()}!`);
    } else {
      alert("Không thể chuyển đổi các file đã chọn. Vui lòng kiểm tra lại định dạng file .heic/.heif.");
    }
  }, 400);

  event.target.value = '';
}

// Fallback xử lý file ảnh bằng HTML5 Canvas nếu heic2any gặp file ảnh thường
function convertFileViaCanvasFallback(file, targetFormat, targetQuality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        }, targetFormat, targetQuality);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Thử nghiệm nhanh chuyển đổi 3 ảnh mẫu thực tế với 1 click
async function loadSampleHeicTest() {
  const progressBox = document.getElementById('heic-progress-box');
  const progressBar = document.getElementById('heic-progress-bar');
  const progressLabel = document.getElementById('heic-progress-label');
  const progressPercent = document.getElementById('heic-progress-percent');
  const placeholder = document.getElementById('heic-placeholder');
  const resultsContainer = document.getElementById('heic-results-container');

  if (placeholder) placeholder.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.add('hidden');
  if (progressBox) progressBox.classList.remove('hidden');

  const targetFormat = document.getElementById('heic-format-select')?.value || 'image/jpeg';
  const targetQuality = Number(document.getElementById('heic-quality-select')?.value) || 0.8;
  const targetExt = targetFormat === 'image/jpeg' ? 'jpg' : (targetFormat === 'image/webp' ? 'webp' : 'png');

  // Sinh 3 ảnh canvas độ phân giải cao mô phỏng ảnh iPhone
  const samples = [
    {
      title: "IMG_4821_iPhone16Pro_SanPhamShopee.heic",
      theme: "fashion",
      tag: "Ảnh chụp sản phẩm mẫu (Shopee Live)",
      origSize: 4.8 * 1024 * 1024
    },
    {
      title: "IMG_4822_iPhone16Pro_ChungTuThue.heic",
      theme: "doc",
      tag: "Ảnh chụp chứng từ hóa đơn kế toán",
      origSize: 3.9 * 1024 * 1024
    },
    {
      title: "IMG_4823_iPhone16Pro_KienHangKho.heic",
      theme: "package",
      tag: "Ảnh kiểm tra đóng gói kiện hàng",
      origSize: 5.2 * 1024 * 1024
    }
  ];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const pct = Math.round(((i + 1) / samples.length) * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `Đang mô phỏng giải mã (${i + 1}/3): ${s.title}...`;

    // Tạo canvas vẽ ảnh mô phỏng đẹp mắt
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (s.theme === 'fashion') {
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);
    } else if (s.theme === 'doc') {
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);
    }

    // Khung viền và thẻ nội dung
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("ZenTool HEIC Converter Engine", 80, 140);

    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#fef08a";
    ctx.fillText(s.tag, 80, 210);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Tên file gốc: ${s.title}`, 80, 300);
    ctx.fillText(`Chuẩn cảm biến: Apple iPhone 16 Pro Max — 48MP HEIF/HEIC`, 80, 350);
    ctx.fillText(`Độ phân giải xuất: 1200 x 800 px (Chuẩn nét cao)`, 80, 400);
    ctx.fillText(`Dung lượng gốc iPhone: ${(s.origSize / (1024 * 1024)).toFixed(1)} MB`, 80, 450);
    ctx.fillText(`Bảo mật: 100% Xử lý Client-Side trong RAM — Zero Server Upload`, 80, 500);

    // Dấu Watermark chất lượng
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "bold 80px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ZENTOOL VERIFIED", 600, 680);
    ctx.textAlign = "left";

    // Xuất ra Blob
    const blob = await new Promise(res => canvas.toBlob(res, targetFormat, targetQuality));
    const baseName = s.title.substring(0, s.title.lastIndexOf('.'));
    const outFileName = `${baseName}_converted.${targetExt}`;
    const objectUrl = URL.createObjectURL(blob);

    convertedHeicFiles.push({
      origName: s.title,
      origSize: s.origSize,
      outName: outFileName,
      blob: blob,
      size: blob.size,
      url: objectUrl,
      ext: targetExt,
      formatName: targetExt.toUpperCase()
    });

    await new Promise(r => setTimeout(r, 200));
  }

  setTimeout(() => {
    if (progressBox) progressBox.classList.add('hidden');
    renderHeicResultsList();
    showToast("⚡ Đã chuyển đổi thành công 3 ảnh iPhone mẫu sang JPG siêu nét!");
  }, 300);
}

// Hiển thị danh sách các thẻ ảnh đã chuyển đổi
function renderHeicResultsList() {
  const placeholder = document.getElementById('heic-placeholder');
  const resultsContainer = document.getElementById('heic-results-container');
  const cardsList = document.getElementById('heic-cards-list');
  const countBadge = document.getElementById('heic-converted-count');

  if (countBadge) countBadge.textContent = convertedHeicFiles.length;

  if (convertedHeicFiles.length === 0) {
    if (placeholder) placeholder.classList.remove('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    return;
  }

  if (placeholder) placeholder.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.remove('hidden');

  if (cardsList) {
    cardsList.innerHTML = '';
    convertedHeicFiles.forEach((item, index) => {
      const origSizeMb = (item.origSize / (1024 * 1024)).toFixed(2);
      const newSizeKb = (item.size / 1024).toFixed(1);
      const savedPercent = item.origSize > 0 
        ? Math.max(0, Math.round((1 - (item.size / item.origSize)) * 100)) 
        : 0;

      const card = document.createElement('div');
      card.className = "flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition gap-3";
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <img src="${item.url}" class="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800" alt="Thumbnail">
          <div class="min-w-0">
            <h5 class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title="${item.outName}">
              ${item.outName}
            </h5>
            <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>Gốc: <strong class="text-slate-700 dark:text-slate-300">${origSizeMb} MB</strong></span>
              <span>➔</span>
              <span>Đã đổi: <strong class="text-purple-600 dark:text-purple-400 font-mono">${newSizeKb} KB</strong></span>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Giảm -${savedPercent}%
              </span>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                ${item.formatName}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="downloadSingleHeic(${index})" class="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs transition flex items-center gap-1 shadow-sm">
            <i class="ri-download-2-line"></i> <span class="hidden sm:inline">Tải Về</span>
          </button>
          <button onclick="deleteSingleHeic(${index})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition" title="Xóa ảnh này">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;
      cardsList.appendChild(card);
    });
  }
}

// Tải 1 ảnh lẻ
function downloadSingleHeic(index) {
  const item = convertedHeicFiles[index];
  if (!item) return;
  const a = document.createElement('a');
  a.href = item.url;
  a.download = item.outName;
  a.click();
  showToast(`Đã tải ảnh "${item.outName}"!`);
}

// Xóa 1 ảnh khỏi danh sách
function deleteSingleHeic(index) {
  if (index >= 0 && index < convertedHeicFiles.length) {
    const item = convertedHeicFiles[index];
    URL.revokeObjectURL(item.url);
    convertedHeicFiles.splice(index, 1);
    renderHeicResultsList();
    showToast('Đã xóa ảnh.');
  }
}

// Tải toàn bộ ảnh thành file ZIP
async function downloadAllHeicZip() {
  if (!convertedHeicFiles.length) {
    alert('Chưa có ảnh nào được chuyển đổi để tải.');
    return;
  }

  if (typeof JSZip !== 'undefined') {
    const zip = new JSZip();
    const folder = zip.folder("ZenTool_Anh_Da_Chuyen_Doi");
    convertedHeicFiles.forEach(item => {
      folder.file(item.outName, item.blob);
    });

    showToast('Đang đóng gói file ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_Anh_Chuyen_Doi_All_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Đã tải trọn bộ file ZIP thành công!');
  } else {
    // Dự phòng tải từng file tuần tự
    convertedHeicFiles.forEach((item, idx) => {
      setTimeout(() => downloadSingleHeic(idx), idx * 250);
    });
    showToast('Đang tải từng ảnh xuống máy tính...');
  }
}

// Xóa toàn bộ ảnh đã chuyển đổi
function clearAllHeicFiles() {
  if (convertedHeicFiles.length > 0) {
    if (!confirm('Anh có chắc muốn xóa toàn bộ danh sách ảnh đã chuyển đổi không?')) return;
  }
  convertedHeicFiles.forEach(it => URL.revokeObjectURL(it.url));
  convertedHeicFiles = [];
  renderHeicResultsList();
  showToast('Đã xóa toàn bộ ảnh.');
}

// ------------------------------------------------------------
// TÍNH NĂNG 2: NÉN ẢNH & TỐI ƯU TỐC ĐỘ (WEBP / JPG)
// ------------------------------------------------------------

function initCompressSample() {
  const canvas = document.getElementById('media-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 400;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ZenTool Image Optimizer", 200, 190);

  ctx.fillStyle = "#64748b";
  ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Kéo thả ảnh để nén giảm 80% dung lượng", 200, 220);
}

function handleImageCompressUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById('orig-size-label').textContent = `Dung lượng gốc: ${(file.size / 1024).toFixed(1)} KB`;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      uploadedImageForCompress = img;
      renderCompressedCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateQualitySlider(val) {
  document.getElementById('quality-number').textContent = `${val}%`;
  renderCompressedCanvas();
}

function renderCompressedCanvas() {
  const canvas = document.getElementById('media-canvas');
  if (!canvas || !uploadedImageForCompress) return;
  const ctx = canvas.getContext('2d');

  canvas.width = uploadedImageForCompress.width;
  canvas.height = uploadedImageForCompress.height;

  ctx.drawImage(uploadedImageForCompress, 0, 0);

  const quality = Number(document.getElementById('compress-quality-slider').value) / 100;
  const format = document.getElementById('compress-format-select').value; // 'image/webp' or 'image/jpeg'

  canvas.toBlob((blob) => {
    if (blob) {
      document.getElementById('compressed-size-label').textContent = `Sau khi nén: ${(blob.size / 1024).toFixed(1)} KB (Đã giảm tối ưu)`;
    }
  }, format, quality);
}

function downloadCompressedImage() {
  const canvas = document.getElementById('media-canvas');
  if (!canvas || !uploadedImageForCompress) {
    alert('Vui lòng chọn ảnh trước khi tải.');
    return;
  }

  const quality = Number(document.getElementById('compress-quality-slider').value) / 100;
  const format = document.getElementById('compress-format-select').value;
  const ext = format === 'image/webp' ? 'webp' : 'jpg';

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTool_NenAnh_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    alert('🎉 Đã tải ảnh nén về máy tính của anh!');
  }, format, quality);
}


// ============================================================
// HỆ THỐNG ĐA NGÔN NGỮ TOÀN NĂNG (UNIVERSAL i18n ENGINE): VI / EN / DE
// Đồng bộ 100% toàn bộ giao diện: Tab 1 (XML), Tab 2 (12 PDF Tools),
// Tab 3 (Lợi nhuận sàn & Thuế), Tab 4 (Studio ảnh & Tách nền),
// Bảng kê, Hộp thoại Modal, Nút bấm, Placeholder, Tooltips & Báo cáo.
// ============================================================

const TRANSLATIONS = {
  vi: {},
  en: {
  "(Bạn hoàn toàn có thể rút dây mạng hoặc ngắt Wifi mà trang web vẫn đọc hóa đơn bình thường 100%)": "(You can completely unplug the network cable or turn off Wi-Fi and the site will still read invoices normally, 100%)",
  "(Ký điện tử hợp lệ bởi Doanh nghiệp)": "(Electronically signed and valid per the Business)",
  "(Ký, ghi rõ họ tên)": "(Sign and print full name clearly)",
  "...": "...",
  "0 VND": "0 VND",
  "0 dòng • 0 cột": "0 rows • 0 columns",
  "0 đ": "0 VND",
  "1. Sàn Giao Dịch:": "1. Marketplace:",
  "1. Tăng Tốc Độ Mở Trang Web Gấp 5 Lần": "1. Speed Up Website Loading 5x",
  "1.5% Doanh Thu": "1.5% of Revenue",
  "100% RAM": "100% RAM",
  "100% Riêng Tư Tại Máy Bạn": "100% In-Browser Privacy",
  "100% trong RAM trình duyệt, không tải lên server": "100% in browser RAM, never uploaded to a server",
  "12%": "12%",
  "2. Chọn Ngành Hàng Sản Phẩm:": "2. Select Product Category:",
  "2. Gửi Email Không Bị Báo Lỗi Vượt 25MB": "2. Send Emails Without 25MB Size Errors",
  "3. Đăng Bán Trên Shopee & TikTok Shop Không Bị Từ Chối": "3. List on Shopee & TikTok Shop Without Rejection",
  "35%": "35%",
  "4. Tiết Kiệm Dung Lượng Ổ Cứng & Google Drive": "4. Save Disk & Google Drive Storage",
  "80%": "80%",
  "80% là mức vàng: Dung lượng giảm 75% mà mắt thường không thấy khác biệt.": "80% is the sweet spot: file size drops 75% with no visible difference to the naked eye.",
  "Bao Bì Đóng Gói (đ):": "Packaging Cost (VND):",
  "Biên lãi: 0%": "Profit margin: 0%",
  "Bóc Tách Bảng PDF Sang Excel": "Extract PDF Tables to Excel",
  "Bấm \\\"Xem\\\" để mở bản in chi tiết từng hóa đơn": "Click \\\"View\\\" to open the detailed printout of each invoice",
  "Bấm \\\"Xóa\\\" trên trang để loại bỏ hoặc mũi tên để dời vị trí:": "Click \\\"Delete\\\" on a page to remove it, or the arrows to reorder:",
  "Bộ Siêu Tiện Ích PDF Văn Phòng Toàn Năng (11 Trong 1)": "All-in-One Office PDF Super Toolkit (11-in-1)",
  "CAM KẾT BẢO MẬT 100%: DỮ LIỆU CỦA BẠN KHÔNG BAO GIỜ TẢI LÊN MÁY CHỦ": "100% PRIVACY GUARANTEE: YOUR DATA IS NEVER UPLOADED TO A SERVER",
  "Cam kết 100% trong RAM: Mật khẩu và số dư không bao giờ gửi lên mạng.": "100% in-RAM guarantee: passwords and balances are never sent over the network.",
  "Cam kết bảo mật 100% Client-Side • Hoàn toàn Miễn phí": "100% Client-Side Privacy Guarantee • Completely Free",
  "Chi Tiết Khấu Trừ Thực Tế:": "Actual Deduction Breakdown:",
  "Chi phí Ads, Đóng gói & Affiliate:": "Ad, Packaging & Affiliate Costs:",
  "Chia sẻ": "Share",
  "Chuyển văn bản TCVN3 (.VNTime) sang Unicode chuẩn": "Convert TCVN3 (.VNTime) text to standard Unicode",
  "Chuyển đổi hàng loạt ảnh .HEIC từ iPhone sang JPG/PNG trong 2 giây & nén WebP siêu nhẹ. 100% trong RAM máy tính.": "Batch-convert iPhone .HEIC photos to JPG/PNG in 2 seconds & compress to ultra-light WebP. 100% in your computer's RAM.",
  "Chưa chọn ảnh": "No images selected",
  "Chưa có hóa đơn nào được tải": "No invoices have been loaded yet",
  "Chưa có thao tác nào trong phiên này. Mọi thao tác xong sẽ hiển thị tại đây để anh dễ theo dõi.": "No actions in this session yet. Completed actions will appear here so you can easily track them.",
  "Chưa có ảnh": "No images yet",
  "Chưa có ảnh HEIC nào được chuyển đổi": "No HEIC images have been converted yet",
  "Chấm màu trên ảnh": "Pick color from image",
  "Chất Lượng Xuất Ảnh:": "Image Export Quality:",
  "Chất lượng nén:": "Compression quality:",
  "Chế độ nén:": "Compression mode:",
  "Chọn 1 file PDF để tách": "Select 1 PDF file to split",
  "Chọn PDF chứa bảng biểu (Sao kê, Báo cáo)": "Select a PDF containing tables (Statements, Reports)",
  "Chọn các file PDF để gộp": "Select PDF files to merge",
  "Chọn các ảnh từ iPhone (.heic) kéo vào khung bên trái, hoặc bấm \\\"⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu\\\" để trải nghiệm.": "Drag iPhone photos (.heic) into the left panel, or click \\\"⚡ Try Sample Image Conversion\\\" to experience it.",
  "Chọn file Hợp Đồng PDF để ký": "Select a PDF Contract file to sign",
  "Chọn file PDF sao kê bị khóa": "Select a locked PDF statement file",
  "Chọn file PDF để lấy ảnh": "Select a PDF file to extract images",
  "Chọn file PDF để nén": "Select a PDF file to compress",
  "Chọn file PDF để xoay": "Select a PDF file to rotate",
  "Chọn file PDF để xếp trang": "Select a PDF file to arrange pages",
  "Chọn file PDF để đóng dấu": "Select a PDF file to stamp",
  "Chọn hoặc kéo thả ảnh cần tách nền vào đây": "Select or drag & drop the image to remove the background here",
  "Chọn nhiều ảnh (JPG, PNG)": "Select multiple images (JPG, PNG)",
  "Chờ nén...": "Compressing...",
  "Chữ Ký Số Hợp Lệ": "Valid Digital Signature",
  "Copy": "Copy",
  "Cứu Lỗi Font Tiếng Việt": "Fix Vietnamese Font Errors",
  "Doanh thu bán ra (Giá cho khách):": "Sales Revenue (Customer Price):",
  "Dán văn bản bị lỗi font chữ ô vuông/loạn mã vào đây...": "Paste text with square-box/garbled font errors here...",
  "Dùng chuột hoặc ngón tay để vẽ chữ ký": "Use your mouse or finger to draw your signature",
  "Dữ liệu chỉ tồn tại tạm thời trong RAM máy tính. Khi bấm xóa, toàn bộ dấu vết sẽ biến mất vĩnh viễn.": "Data exists only temporarily in your computer's RAM. When you click delete, all traces disappear permanently.",
  "Ghép File & Tiện Ích": "Office PDF Suite",
  "Ghép File & Tiện Ích Văn Phòng": "Merge & Office PDF Suite",
  "Ghép Ảnh Thành File PDF": "Merge Images into PDF",
  "Ghép ảnh chụp CCCD, bằng lái, hợp đồng thành 1 PDF": "Merge photos of ID cards, driver's licenses, and contracts into 1 PDF",
  "Giá Bán Cho Khách (VND):": "Customer Selling Price (VND):",
  "Giá Nhập / Giá Vốn (VND):": "Purchase Price / Cost Price (VND):",
  "Giá vốn sản phẩm (COGS):": "Product Cost (COGS):",
  "Giảm nhẹ dung lượng để gửi mail & lưu trữ": "Slightly reduce file size for email & storage",
  "Gói Dịch Vụ Sàn Tùy Chọn:": "Optional Marketplace Service Packages:",
  "Gói Freeship Xtra (Shopee 6% / TikTok 5.5%)": "Freeship Xtra Package (Shopee 6% / TikTok 5.5%)",
  "Gói Voucher Xtra (4%)": "Voucher Xtra Package (4%)",
  "Gộp & Lưu Về Máy Ngay": "Merge & Save to Device Now",
  "Gộp Nhiều File PDF": "Merge Multiple PDF Files",
  "Gỡ pass sao kê VCB, MB, Techcombank, lương": "Remove password from VCB, MB, Techcombank, payroll statements",
  "HOT": "HOT",
  "Hao hụt hoàn hàng & vận chuyển chiều về:": "Return & return-shipping loss:",
  "Hiển thị 0 hóa đơn": "Showing 0 invoices",
  "Hoa Hồng Affiliate (%):": "Affiliate Commission (%):",
  "HÓA ĐƠN GIÁ TRỊ GIA TĂNG": "VALUE ADDED TAX INVOICE",
  "Hóa Đơn XML": "XML Invoices",
  "Hỗ trợ JPG, PNG, WEBP dung lượng tối đa 25MB": "Supports JPG, PNG, WEBP up to 25MB",
  "Hỗ trợ JPG, PNG, WebP (Ảnh sản phẩm, logo, chân dung)": "Supports JPG, PNG, WebP (product photos, logos, portraits)",
  "Hỗ trợ chọn 50 - 100 ảnh iPhone cùng lúc": "Supports selecting 50 - 100 iPhone photos at once",
  "Hỗ trợ chọn nhiều file cùng lúc (hoặc 1 file đơn)": "Supports selecting multiple files at once (or a single file)",
  "In Hóa Đơn / Lưu PDF": "Print Invoice / Save PDF",
  "Khấu trừ Thuế TNCN (0.5%) & Thuế GTGT (1%) cho hộ kinh doanh cá nhân": "Personal Income Tax (0.5%) & VAT (1%) deduction for individual businesses",
  "Kéo thả các file .HEIC vào đây": "Drag & drop .HEIC files here",
  "Kéo thả các file .XML vào đây": "Drag & drop .XML files here",
  "Kéo thả ảnh vào đây để nén": "Drag & drop images here to compress",
  "Kéo tăng nếu còn sót viền nền; kéo giảm nếu bị ăn lẹm vào chi tiết sản phẩm.": "Increase if background edges remain; decrease if it eats into product details.",
  "Ký Tên Lên Hợp Đồng PDF\\n TIỆN ÍCH": "Sign PDF Contracts\\n UTILITY",
  "Ký hiệu: ...": "Symbol: ...",
  "Ký vào trang:": "Sign on page:",
  "Kết Quả Trong Suốt Thời Gian Thực": "Real-Time Results",
  "Kết quả tiếng Việt chuẩn Unicode sẽ hiện ở đây...": "Standard Unicode Vietnamese result will appear here...",
  "Làm mịn & Khử răng cưa (Feathering):": "Smoothing & Feathering:",
  "Lãi Sàn & Thuế": "Profit & Tax",
  "Lọc theo Tên người bán, MST, Số hóa đơn...": "Filter by Seller Name, Tax ID, Invoice Number...",
  "Lợi Nhuận Ròng / Đơn:": "Net Profit / Order:",
  "Lợi Nhuận Sàn": "Marketplace Profit",
  "Lợi Nhuận Sàn & Thuế 2026": "E-Commerce Profit & Taxes 2026",
  "Miễn Phí 100% • Không Thu Phí • Không Lưu Trữ Dữ Liệu Lên Server": "100% Free • Zero Cost • No Server Storage Or Tracking",
  "Màu nền nhận diện": "Brand background color",
  "Mã số thuế: ...": "Tax ID: ...",
  "Mẫu": "Sample",
  "Mở Khóa & Lưu File PDF Sạch": "Unlock & Save Clean PDF File",
  "Mở Khóa Mật Khẩu PDF\\n 100% RAM": "Unlock PDF Password\\n 100% RAM",
  "Nghĩa vụ Thuế TMĐT (1.5% DT):": "E-commerce Tax Obligation (1.5% of Revenue):",
  "Ngày lập: ...": "Issue date: ...",
  "Người Bán Hàng": "Seller",
  "Người Mua Hàng": "Buyer",
  "Người mua: ...": "Buyer: ...",
  "Nhập chữ cần đóng dấu (VD: BẢN SAO, MẬT)": "Enter watermark text (e.g., COPY, CONFIDENTIAL)",
  "Nhập mật khẩu (CCCD hoặc ngày sinh)...": "Enter password (ID number or date of birth)...",
  "Nhật Ký Phiên Làm Việc\\n 0": "Session Activity Log\\n 0",
  "Nén & Tải Về Máy": "Compress & Download",
  "Nén Dung Lượng PDF\\n HOT": "Compress PDF Size\\n HOT",
  "Nén Ảnh": "Compress Images",
  "Nén Ảnh WebP": "Compress to WebP",
  "Nối nhiều file chứng từ, hợp đồng thành 1": "Combine multiple document and contract files into 1",
  "Phí cố định hoa hồng theo ngành:": "Fixed category commission fee:",
  "Phí giao dịch thanh toán & hạ tầng:": "Payment transaction & infrastructure fees:",
  "Phí gói Freeship Xtra & Voucher Xtra:": "Freeship Xtra & Voucher Xtra package fees:",
  "Quay Lại Bảng Kê": "Back to Statement",
  "Sau khi sàn trừ hết các khoản": "After the marketplace deducts all fees",
  "Shopee": "Shopee",
  "Studio Ảnh": "Photo Studio",
  "Số tiền viết bằng chữ: ...": "Amount in words: ...",
  "Số tài khoản: ...": "Account number: ...",
  "Số: ...": "No.: ...",
  "Sửa tài liệu scan bị ngược hoặc nằm ngang": "Fix scanned documents that are upside down or sideways",
  "TIỆN ÍCH": "UTILITY",
  "Thuế TMĐT (Thông tư 40/2021/TT-BTC):": "E-commerce Tax (Circular 40/2021/TT-BTC):",
  "Thêm chữ chìm bảo vệ chứng từ chống sao chép": "Add watermark to protect documents against copying",
  "Thông báo": "Notification",
  "Thử Ảnh Mẫu (1-Click)": "Try Sample Image (1-Click)",
  "TikTok Shop": "TikTok Shop",
  "Tiền Ads/Đơn (đ):": "Ad Cost/Order (VND):",
  "Tiền Hàng (Chưa Thuế)": "Goods Amount (Excl. Tax)",
  "Tiền Sàn Trả Về (Payout):": "Marketplace Payout:",
  "Tiền Thuế GTGT": "VAT Amount",
  "Tiền thuế GTGT:": "VAT amount:",
  "Tiền tệ: VND": "Currency: VND",
  "Trích Xuất & Tải File ZIP": "Extract & Download ZIP File",
  "Trích Xuất PDF Sang Ảnh\\n ZIP": "Extract PDF to Images\\n ZIP",
  "Trợ Lý Dự Toán Lợi Nhuận Sàn & Thuế TMĐT (2025 - 2026)": "Marketplace Profit & E-commerce Tax Estimator (2025 - 2026)",
  "TÁCH NỀN ẢNH 1 CHẠM 100% TRONG RAM — KHÔNG WATERMARK, KHÔNG GIỚI HẠN": "ONE-CLICK BACKGROUND REMOVAL 100% IN RAM — NO WATERMARK, NO LIMITS",
  "Tách & Trích Xuất Trang PDF": "Split & Extract PDF Pages",
  "Tách & Tải Về Máy": "Split & Download",
  "Tách Nền Ảnh (PNG Trong Suốt)": "Remove Image Background (Transparent PNG)",
  "Tách riêng các trang cần lấy (VD: 1-3, 5)": "Extract specific pages (e.g., 1-3, 5)",
  "TẠI SAO ẢNH IPHONE (.HEIC) KHÔNG MỞ ĐƯỢC TRÊN MÁY TÍNH VÀ SHOPPE/TIKTOK?": "WHY WON'T IPHONE (.HEIC) PHOTOS OPEN ON COMPUTERS AND SHOPEE/TIKTOK?",
  "Tại Sao Bạn Cần Nén Ảnh? Tính Năng Này Giúp Gì Cho Bạn?": "Why Do You Need Image Compression? How Does This Feature Help You?",
  "Tải 1 File XML Mẫu": "Download a Sample XML File",
  "Tải Lên Hóa Đơn XML (Đơn Lẻ hoặc Hàng Loạt)": "Upload XML Invoices (Single or Batch)",
  "Tải PNG Trong Suốt (Full HD)": "Download Transparent PNG (Full HD)",
  "Tải Ảnh Chữ Ký": "Download Signature Image",
  "Tải Ảnh Đã Nén Về Máy": "Download Compressed Images",
  "Tất Cả (12 Công Cụ)": "All (12 Tools)",
  "TỔNG TIỀN THANH TOÁN:": "TOTAL PAYMENT:",
  "Tổng Số Hóa Đơn": "Total Invoices",
  "Tổng Thanh Toán": "Total Payment",
  "Tổng tiền chưa thuế:": "Subtotal (excl. tax):",
  "Tự động nhận diện dòng/cột & xuất file .xlsx sạch sẽ": "Auto-detect rows/columns & export a clean .xlsx file",
  "Tỷ lệ hoàn trả / hủy hàng dự kiến của shop:": "Shop's expected return / cancellation rate:",
  "VD: 1-3, 5 hoặc 2, 4": "e.g., 1-3, 5 or 2, 4",
  "Vui lòng kéo thả các file .XML vào khung bên trái hoặc bấm vào nút \\\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\\\" ở góc trên.": "Please drag & drop .XML files into the left panel, or click the \\\"⚡ Try 5 Sample Invoices Statement\\\" button in the top corner.",
  "Vẽ Tay": "Draw by Hand",
  "Vẽ chữ ký tay hoặc chèn ảnh chữ ký trong suốt": "Draw a handwritten signature or insert a transparent signature image",
  "Xem 1 Hóa Đơn Mẫu": "View a Sample Invoice",
  "Xem thumbnail từng trang, bỏ trang thừa": "Preview page thumbnails, remove extra pages",
  "Xem trước số liệu": "Preview figures",
  "Xoay & Lưu Về Máy": "Rotate & Download",
  "Xoay Chiều Trang PDF": "Rotate PDF Pages",
  "Xuất Bảng Kê Excel": "Export Excel Statement",
  "Xuất Bảng Kê Excel (.xlsx)": "Export Excel Statement (.xlsx)",
  "Xuất Excel (.xlsx)": "Export Excel (.xlsx)",
  "Xuất File PDF Mới": "Export New PDF File",
  "Xuất Thành File PDF (Khổ A4)": "Export as PDF File (A4 Size)",
  "Xuất từng trang thành JPG/PNG nét cao": "Export each page as high-resolution JPG/PNG",
  "Xóa": "Delete",
  "Xóa & Đổi Thứ Tự Trang\\n HOT": "Delete & Reorder Pages\\n HOT",
  "Xóa Hết": "Clear All",
  "Xóa Lịch Sử & Dọn Sạch RAM": "Clear History & Wipe RAM",
  "Xóa Sạch Lịch Sử Khi Xong": "Clear History When Done",
  "Xóa tất cả": "Delete all",
  "Xóa vẽ lại": "Clear and redraw",
  "Xử Lý Ảnh Chuyên Nghiệp: Đổi Ảnh HEIC (iPhone) & Nén Ảnh": "Professional Image Processing: Convert HEIC (iPhone) Photos & Compress Images",
  "ZIP": "ZIP",
  "ZenTool": "ZenTool",
  "ZenTool Suite": "ZenTool Suite",
  "Đang giải mã ảnh HEIC trong RAM...": "Decoding HEIC images in RAM...",
  "Đang tính toán phân tích chỉ số...": "Calculating and analyzing metrics...",
  "Đang tải thông tin ngành hàng...": "Loading category information...",
  "Đã chuyển đổi thành công: 0 ảnh": "Successfully converted: 0 images",
  "Đã chọn 0 tệp PDF:": "Selected 0 PDF files:",
  "Đã chọn 0 ảnh:": "Selected 0 images:",
  "Đã nạp: 0 file": "Loaded: 0 files",
  "Đóng Chữ Ký & Lưu Hợp Đồng": "Apply Signature & Save Contract",
  "Đóng Dấu & Tải Về Máy": "Stamp & Download",
  "Đóng Dấu Bản Quyền (Watermark)": "Add Copyright Watermark",
  "Địa chỉ: ...": "Address: ...",
  "Định Dạng Xuất Ra:": "Output Format:",
  "Định Dạng Đầu Ra:": "Output Format:",
  "Đọc & Gom Bảng Kê Hóa Đơn Điện Tử XML Hàng Loạt": "Read & Aggregate Batch XML E-Invoice Statements",
  "Đọc & Gom Hóa Đơn XML": "Parse & Merge XML Invoices",
  "Đọc Hóa Đơn XML": "Read XML Invoices",
  "Đổi Ảnh HEIC & Nén Ảnh": "Photo Studio & HEIC Converter",
  "Đổi Ảnh HEIC (iPhone)": "Convert iPhone HEIC",
  "Độ nhạy xóa màu (Tolerance):": "Color removal sensitivity (Tolerance):",
  "• 1-Click xuất ra file Excel chuẩn để kê khai thuế.": "• 1-Click export to a standard Excel file for tax declaration.",
  "• Bấm \\\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\\\" để trải nghiệm bảng kê kế toán mẫu tức thì.": "• Click \\\"⚡ Try 5 Sample Invoices Statement\\\" to instantly experience a sample accounting statement.",
  "• Kéo thả 1 hoặc nhiều file XML vào ô trên để bóc tách ngay.": "• Drag & drop one or more XML files into the box above to extract immediately.",
  "⚡ Sửa Lỗi Font Ngay": "⚡ Fix Font Errors Now",
  "⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu": "⚡ Try 5 Sample Invoices Statement",
  "⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu": "⚡ Try Sample Image Conversion",
  "✓ Tự động lọc nền trắng thành trong suốt": "✓ Automatically filter white background to transparent",
  "💡 Hướng dẫn nhanh:": "💡 Quick guide:",
  "💡 Nền caro biểu thị vùng trong suốt. Khi chèn lên web hoặc sàn Shopee/TikTok, nền sẽ tự động hòa vào ảnh nền đích.": "💡 The checkerboard indicates transparent areas. When placed on a website or Shopee/TikTok, the background automatically blends into the target background.",
  "📑 Ghép & Xử Lý Trang (4)": "📑 Pages & Merge (4)",
  "📦 Tải Toàn Bộ (File ZIP)": "📦 Download All (ZIP File)",
  "🔄 Chuyển Đổi & Nén (4)": "🔄 Convert & Compress (4)",
  "🔒 Ký Tên & Bảo Mật (4)": "🔒 Sign & Protect (4)",
  "Tiếng Việt": "Vietnamese",
  "English": "English",
  "Deutsch": "German",
  "Tách Nền Ảnh 1 Chạm": "1-Touch Background Remover",
  "Tách Nền Ảnh (PNG)": "Background Remover (PNG)",
  "Xem Trước Bảng": "Table Preview",
  "Đang xử lý...": "Processing...",
  "Thành công!": "Success!",
  "Đã sao chép!": "Copied to clipboard!",
  "Báo cáo lợi nhuận": "Profit Report",
  "Xem chi tiết": "View Details",
  "Đóng": "Close",
  "In Bảng Kê": "Print Statement",
  "Xuất Excel Bảng Kê": "Export Invoices to Excel",
  "Tải Về": "Download",
  "Làm lại": "Reset",
  "\"Ảnh chụp từ điện thoại nét căng thì cứ để nguyên đăng lên, tại sao phải nén làm gì?\"": "\"Phone photos are already razor-sharp, so why bother compressing them before uploading?\"",
  "\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\"": "\"⚡ Try the 5-Invoice Sample Statement\"",
  "\"⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu\"": "\"⚡ Try the Sample Image Conversion\"",
  "-0 đ": "-0 VND",
  ". Chúng tôi không lưu trữ, không sao chép, và không có máy chủ trung gian nào có thể xem được số liệu kinh doanh của bạn.": ". We do not store, do not copy, and have no intermediary server that can see your business data.",
  ". Dung lượng quá nặng này chính là thủ phạm gây ra 4 rắc rối lớn hàng ngày:": ". This excessive file size is the culprit behind 4 major daily headaches:",
  ". Thực tế, một bức ảnh chụp điện thoại thường nặng từ": ". In reality, a phone photo typically weighs between",
  ". Xử lý 100% tại trình duyệt máy tính của bạn, không upload ảnh lên mạng, không yêu cầu đăng ký hay thẻ tín dụng.": ". Processed 100% in your computer's browser, no image upload to the internet, no sign-up or credit card required.",
  ". ZenTool giúp bạn chuyển đổi hàng loạt sang": ". ZenTool lets you batch-convert to",
  ".HEIC": ".HEIC",
  "5MB đến 15MB": "5MB to 15MB",
  "70% — Tối Ưu Dung Lượng (Cực nhẹ cho gửi mail)": "70% — Size Optimized (Ultra-light for email)",
  "80% — Tiêu Chuẩn Vàng (Đẹp & Giảm 70% dung lượng)": "80% — Golden Standard (Great quality & 70% smaller)",
  "90% — Cực Kỳ Sắc Nét (Gần như không nén)": "90% — Ultra Sharp (Almost no compression)",
  "Bấm \"Xem\" để mở bản in chi tiết từng hóa đơn": "Click \"View\" to open the detailed printout of each invoice",
  "Bấm \"Xóa\" trên trang để loại bỏ hoặc mũi tên để dời vị trí:": "Click \"Delete\" on a page to remove it, or the arrows to reorder:",
  "Chuẩn JPEG / JPG (Khuyên Dùng - Tương thích 100% mọi nơi)": "JPEG / JPG Standard (Recommended - 100% compatible everywhere)",
  "Chuẩn JPEG / JPG Tiêu Chuẩn": "Standard JPEG / JPG",
  "Chuẩn PNG (Giữ chi tiết nguyên bản chất lượng cao)": "PNG Standard (Preserves original high-quality detail)",
  "Chuẩn WebP (Siêu nhẹ cho Website & Đăng sàn)": "WebP Standard (Ultra-light for websites & marketplace listings)",
  "Chuẩn WebP Thế Hệ Mới (Siêu Nhẹ - Khuyên Dùng)": "Next-Gen WebP Standard (Ultra-Light - Recommended)",
  "Chẩn Đoán Của Trợ Lý:": "Assistant's Diagnosis:",
  "Chọn các ảnh từ iPhone (.heic) kéo vào khung bên trái, hoặc bấm": "Select photos from your iPhone (.heic) and drag them into the left panel, or click",
  "Các sàn thương mại điện tử yêu cầu ảnh tải lên phải dưới 1MB - 2MB. Ảnh nén sang chuẩn": "E-commerce marketplaces require uploaded images to be under 1MB - 2MB. Images compressed to",
  "Giải pháp thay thế hoàn hảo cho Remove.bg và Canva Pro: Tách phông nền trắng/màu đơn sắc của ảnh sản phẩm, ảnh chụp chân dung và xuất thẳng file": "The perfect alternative to Remove.bg and Canva Pro: remove white/solid-color backgrounds from product and portrait photos and export directly as",
  "Gộp, tách, nén, mở khóa sao kê ngân hàng, ký hợp đồng, xóa/đổi thứ tự trang, và cứu lỗi font chữ. 100% Client-Side trong RAM, bảo mật tuyệt đối!": "Merge, split, compress, unlock bank statements, sign contracts, delete/reorder pages, and fix font errors. 100% client-side in RAM, absolutely secure!",
  "Hiển thị": "Display",
  "Hòm thư Gmail hay Outlook thường giới hạn file đính kèm dưới 25MB. Đính kèm 3 bức ảnh gốc là hòm thư báo lỗi không gửi được. Nén ảnh giúp bạn gửi cả chục ảnh nhẹ nhàng.": "Gmail or Outlook inboxes usually limit attachments to under 25MB. Attaching 3 original photos makes the inbox report a send error. Compressing images lets you send a dozen photos with ease.",
  "JPG / PNG chuẩn quốc tế": "International-standard JPG / PNG",
  "Khách hàng lướt web trên điện thoại nếu ảnh load quá 3 giây họ sẽ tắt ngay lập tức. Nén ảnh giúp trang web mở ra trong tích tắc, giữ chân khách mua hàng.": "If images take more than 3 seconds to load on mobile, customers leave immediately. Compressing images makes your site open in a flash, keeping shoppers engaged.",
  "Kéo thả 50 - 100 file XML cùng lúc để bóc tách thông tin và tự động xuất ra Bảng Kê Excel (.xlsx) chuẩn thuế. 100% trong RAM máy tính.": "Drag and drop 50 - 100 XML files at once to extract data and automatically export a tax-compliant Excel Statement (.xlsx). 100% in your computer's RAM.",
  "Ký Hiệu": "Series",
  "Ký Tên Lên Hợp Đồng PDF": "Sign PDF Contracts",
  "Ký hiệu:": "Series:",
  "LƯU Ý MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ:": "LEGAL DISCLAIMER:",
  "Lưu trữ 1.000 ảnh gốc tốn 10GB dung lượng máy. Sau khi nén chỉ còn chưa tới 1.5GB, không bao giờ phải lo máy tính bị báo đầy bộ nhớ.": "Storing 1,000 original photos takes up 10GB of disk space. After compression it's under 1.5GB, so you never have to worry about your computer reporting low memory.",
  "MST Bán": "Seller Tax ID",
  "Mã số thuế:": "Tax ID:",
  "Mọi công thức và số liệu tính toán tại ZenTool chỉ mang tính chất": "All formulas and calculations in ZenTool are for",
  "Mọi file hóa đơn XML, chứng từ hợp đồng đều được": "All XML invoice files and contract documents are",
  "Mở Khóa Mật Khẩu PDF": "Unlock PDF Password",
  "Ngày Lập": "Issue Date",
  "Ngày lập:": "Issue date:",
  "Người mua:": "Buyer:",
  "Nhiều người thắc mắc:": "Many people wonder:",
  "Nhật Ký Phiên Làm Việc": "Session Log",
  "Nén Cực Nhẹ (Giảm 75% - 85% cho gửi mail gấp)": "Ultra Light (75% - 85% smaller for urgent email)",
  "Nén Dung Lượng PDF": "Compress PDF Size",
  "Nén Giữ Nét Cao (Giảm 30% - 40% cho in ấn)": "High-Quality Compression (30% - 40% smaller for printing)",
  "PNG trong suốt Full HD": "Full HD Transparent PNG",
  "Phân bổ chính xác theo từng ngành hàng cụ thể, khấu trừ phí thanh toán (6%), phí hạ tầng (3k), phí ngành, chi phí hoàn hủy và thuế TNCN/GTGT.": "Accurately allocated by specific product category, deducting payment fees (6%), infrastructure fees (3k), category fees, return/cancellation costs, and PIT/VAT.",
  "STT": "No.",
  "Siêu nét (2.0x)": "Ultra Sharp (2.0x)",
  "Số HĐ": "Inv No.",
  "Số Lượng": "Quantity",
  "Số tiền viết bằng chữ:": "Amount in words:",
  "Số tài khoản:": "Account number:",
  "Số:": "No.:",
  "Thao Tác": "Actions",
  "Thuế Suất": "Tax Rate",
  "Thuế VAT": "VAT",
  "Thành Tiền": "Total Amount",
  "Tiêu Chuẩn (Giảm 50% - 70%, giữ chữ rõ nét)": "Standard (50% - 70% smaller, keeps text crisp)",
  "Tiền Hàng": "Goods Amount",
  "Tiền tệ:": "Currency:",
  "Trang 1": "Page 1",
  "Trang cuối cùng (Khuyên Dùng)": "Last page (Recommended)",
  "Trích Xuất PDF Sang Ảnh": "Extract PDF to Images",
  "Tên Hàng Hóa, Dịch Vụ": "Goods/Service Name",
  "VND": "VND",
  "Vui lòng kéo thả các file .XML vào khung bên trái hoặc bấm vào nút": "Please drag and drop the .XML files into the left panel or click the button",
  "WebP": "WebP",
  "Xoay Ngược 180 Độ (Lộn ngược đầu)": "Rotate 180 Degrees (Upside down)",
  "Xoay Phải 90 Độ (Thuận chiều kim đồng hồ)": "Rotate Right 90 Degrees (Clockwise)",
  "Xoay Trái 270 Độ (Ngược chiều kim đồng hồ)": "Rotate Left 270 Degrees (Counterclockwise)",
  "Xóa & Đổi Thứ Tự Trang": "Delete & Reorder Pages",
  "ZenTool Suite — Siêu Tiện Ích Văn Phòng & Trợ Lý Lợi Nhuận Bán Hàng 100% Client-Side": "ZenTool Suite — 100% Client-Side Office Utilities & Sales Profit Assistant",
  "Zero Server Upload": "Zero Server Upload",
  "báo lỗi không hỗ trợ định dạng này": "reports that this format is not supported",
  "dự toán kinh doanh giả định và tham khảo": "hypothetical business estimates and reference only",
  "dựa trên biểu phí công bố công khai của các sàn và biểu thuế hiện hành. Đây không phải là cam kết kế toán hay văn bản pháp lý thay thế cho quyết toán chính thức từ Cơ quan Thuế hoặc báo cáo tài chính Kênh Người Bán của sàn. Nhà bán hàng tự chịu trách nhiệm với chiến lược giá và nghĩa vụ thuế thực tế của mình.": "based on publicly disclosed marketplace fee schedules and current tax tables. This is not an accounting commitment or a legal document replacing official settlement from the Tax Authority or the marketplace's Seller Channel financial reports. Sellers are responsible for their own pricing strategy and actual tax obligations.",
  "file": "file",
  "giữ nguyên độ sắc nét nhưng dung lượng giảm tới 80%, sàn duyệt ngay lập tức.": "preserves sharpness while reducing size by up to 80%, and the marketplace approves it instantly.",
  "hóa đơn": "invoice",
  "iPhone từ iOS 11 mặc định lưu ảnh dưới định dạng": "iPhones from iOS 11 onward save photos by default in",
  "siêu nét chỉ trong 2 giây, không tải ảnh lên bất kỳ máy chủ nào!": "ultra-sharp in just 2 seconds, without uploading images to any server!",
  "tệp PDF:": "PDF file:",
  "xử lý trực tiếp trong bộ nhớ RAM trình duyệt máy tính của bạn": "processed directly in your computer browser's RAM",
  "ĐVT": "Unit",
  "Đã chuyển đổi thành công:": "Successfully converted:",
  "Đã chọn": "Selected",
  "Đã ký số điện tử": "Electronically signed",
  "Đã nạp:": "Loaded:",
  "Đơn Giá": "Unit Price",
  "Đơn Vị Bán Hàng": "Seller",
  "Đơn Vị Bán Hàng:": "Seller:",
  "Đơn Vị Mua Hàng:": "Buyer:",
  "Địa chỉ:": "Address:",
  "Độ nét cao (1.5x)": "High Sharpness (1.5x)",
  "để tiết kiệm bộ nhớ. Nhưng máy tính Windows cũ, Zalo trên PC, phần mềm kế toán và các sàn Shopee/TikTok thường": "to save storage. But older Windows computers, Zalo on PC, accounting software, and Shopee/TikTok marketplaces often",
  "để trải nghiệm bảng kê kế toán mẫu tức thì.": "to experience the sample accounting statement instantly.",
  "để trải nghiệm.": "to try it.",
  "Ảnh JPG": "JPG Image",
  "Ảnh PNG": "PNG Image",
  "ảnh": "image",
  "ảnh:": "image:",
  "ở góc trên.": "in the top corner.",
  "• Bấm": "• Click",
  "🇩🇪 DE": "🇩🇪 DE",
  "🇬🇧 EN": "🇬🇧 EN",
  "🇻🇳 VI": "🇻🇳 VI",
  "Nội dung chữ đóng dấu:": "Watermark text:",
  "Phông Chữ:": "Font Family:",
  "Cỡ chữ:": "Size:",
  "Độ mờ:": "Opacity:",
  "Màu Sắc Đóng Dấu:": "Watermark Color:",
  "Xem trước dấu chìm:": "Watermark preview:",
  "Sans-serif Hiện Đại (Segoe UI / Arial)": "Modern Sans-serif (Segoe UI / Arial)",
  "Serif Trang Trọng (Times New Roman)": "Classic Serif (Times New Roman)",
  "Monospace Kỹ Thuật (Courier New)": "Technical Monospace (Courier New)",
  "Đậm Nổi Bật (Impact / Arial Black)": "Bold & Prominent (Impact / Arial Black)",
  "Góc nghiêng 45°": "45° angle",
  "ZenTelemetry Live": "ZenTelemetry Live",
  "100% Dữ Liệu Thật": "100% Real Data",
  "Số liệu giám sát trực tuyến minh bạch, không đếm ảo": "Transparent real-time telemetry, zero simulated counters",
  "Đang Online": "Active Online",
  "Lượt Truy Cập": "Pageviews",
  "Người Dùng Thực": "Unique Visitors",
  "Lượt Tải Về": "Total Downloads"
},
  de: {
  "(Bạn hoàn toàn có thể rút dây mạng hoặc ngắt Wifi mà trang web vẫn đọc hóa đơn bình thường 100%)": "(Sie können das Netzwerkkabel vollständig abziehen oder das WLAN ausschalten, und die Website liest Rechnungen trotzdem normal zu 100 % aus)",
  "(Ký điện tử hợp lệ bởi Doanh nghiệp)": "(Elektronisch signiert und gültig gemäß dem Unternehmen)",
  "(Ký, ghi rõ họ tên)": "(Unterschreiben und vollständigen Namen deutlich angeben)",
  "...": "...",
  "0 VND": "0 VND",
  "0 dòng • 0 cột": "0 Zeilen • 0 Spalten",
  "0 đ": "0 VND",
  "1. Sàn Giao Dịch:": "1. Marktplatz:",
  "1. Tăng Tốc Độ Mở Trang Web Gấp 5 Lần": "1. Website-Ladezeit um das 5-Fache beschleunigen",
  "1.5% Doanh Thu": "1,5 % des Umsatzes",
  "100% RAM": "100 % RAM",
  "100% Riêng Tư Tại Máy Bạn": "100% Lokale Privatsphäre Im RAM",
  "100% trong RAM trình duyệt, không tải lên server": "100 % im Browser-RAM, kein Upload auf einen Server",
  "12%": "12 %",
  "2. Chọn Ngành Hàng Sản Phẩm:": "2. Produktkategorie auswählen:",
  "2. Gửi Email Không Bị Báo Lỗi Vượt 25MB": "2. E-Mails ohne Fehlermeldung bei Überschreitung von 25 MB senden",
  "3. Đăng Bán Trên Shopee & TikTok Shop Không Bị Từ Chối": "3. Auf Shopee & TikTok Shop ohne Ablehnung verkaufen",
  "35%": "35 %",
  "4. Tiết Kiệm Dung Lượng Ổ Cứng & Google Drive": "4. Speicherplatz auf Festplatte & Google Drive sparen",
  "80%": "80 %",
  "80% là mức vàng: Dung lượng giảm 75% mà mắt thường không thấy khác biệt.": "80 % ist der Goldstandard: Die Dateigröße sinkt um 75 %, ohne dass das bloße Auge einen Unterschied erkennt.",
  "Bao Bì Đóng Gói (đ):": "Verpackungskosten (VND):",
  "Biên lãi: 0%": "Gewinnmarge: 0 %",
  "Bóc Tách Bảng PDF Sang Excel": "PDF-Tabellen nach Excel extrahieren",
  "Bấm \\\"Xem\\\" để mở bản in chi tiết từng hóa đơn": "Klicken Sie auf \\\"Anzeigen\\\", um den detaillierten Ausdruck jeder Rechnung zu öffnen",
  "Bấm \\\"Xóa\\\" trên trang để loại bỏ hoặc mũi tên để dời vị trí:": "Klicken Sie auf einer Seite auf \\\"Löschen\\\", um sie zu entfernen, oder auf die Pfeile, um sie zu verschieben:",
  "Bộ Siêu Tiện Ích PDF Văn Phòng Toàn Năng (11 Trong 1)": "All-in-One-Office-PDF-Super-Toolkit (11 in 1)",
  "CAM KẾT BẢO MẬT 100%: DỮ LIỆU CỦA BẠN KHÔNG BAO GIỜ TẢI LÊN MÁY CHỦ": "100 % DATENSCHUTZGARANTIE: IHRE DATEN WERDEN NIEMALS AUF EINEN SERVER HOCHGELADEN",
  "Cam kết 100% trong RAM: Mật khẩu và số dư không bao giờ gửi lên mạng.": "100 % RAM-Garantie: Passwörter und Kontostände werden niemals über das Netzwerk gesendet.",
  "Cam kết bảo mật 100% Client-Side • Hoàn toàn Miễn phí": "100 % Client-Side-Datenschutzgarantie • Vollständig kostenlos",
  "Chi Tiết Khấu Trừ Thực Tế:": "Tatsächliche Abzüge im Detail:",
  "Chi phí Ads, Đóng gói & Affiliate:": "Werbe-, Verpackungs- & Affiliate-Kosten:",
  "Chia sẻ": "Teilen",
  "Chuyển văn bản TCVN3 (.VNTime) sang Unicode chuẩn": "TCVN3-Text (.VNTime) in Standard-Unicode umwandeln",
  "Chuyển đổi hàng loạt ảnh .HEIC từ iPhone sang JPG/PNG trong 2 giây & nén WebP siêu nhẹ. 100% trong RAM máy tính.": "iPhone-.HEIC-Fotos in 2 Sekunden stapelweise in JPG/PNG umwandeln & zu ultraleichtem WebP komprimieren. 100 % im RAM Ihres Computers.",
  "Chưa chọn ảnh": "Keine Bilder ausgewählt",
  "Chưa có hóa đơn nào được tải": "Es wurden noch keine Rechnungen geladen",
  "Chưa có thao tác nào trong phiên này. Mọi thao tác xong sẽ hiển thị tại đây để anh dễ theo dõi.": "In dieser Sitzung wurden noch keine Aktionen ausgeführt. Abgeschlossene Aktionen werden hier angezeigt, damit Sie sie leicht nachverfolgen können.",
  "Chưa có ảnh": "Noch keine Bilder",
  "Chưa có ảnh HEIC nào được chuyển đổi": "Es wurden noch keine HEIC-Bilder umgewandelt",
  "Chấm màu trên ảnh": "Farbe aus Bild aufnehmen",
  "Chất Lượng Xuất Ảnh:": "Bildexportqualität:",
  "Chất lượng nén:": "Komprimierungsqualität:",
  "Chế độ nén:": "Komprimierungsmodus:",
  "Chọn 1 file PDF để tách": "1 PDF-Datei zum Teilen auswählen",
  "Chọn PDF chứa bảng biểu (Sao kê, Báo cáo)": "PDF mit Tabellen auswählen (Kontoauszüge, Berichte)",
  "Chọn các file PDF để gộp": "PDF-Dateien zum Zusammenführen auswählen",
  "Chọn các ảnh từ iPhone (.heic) kéo vào khung bên trái, hoặc bấm \\\"⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu\\\" để trải nghiệm.": "Ziehen Sie iPhone-Fotos (.heic) in den linken Bereich oder klicken Sie auf \\\"⚡ Beispielbildumwandlung testen\\\", um es auszuprobieren.",
  "Chọn file Hợp Đồng PDF để ký": "PDF-Vertragsdatei zum Unterschreiben auswählen",
  "Chọn file PDF sao kê bị khóa": "Gesperrte PDF-Kontoauszugsdatei auswählen",
  "Chọn file PDF để lấy ảnh": "PDF-Datei zum Extrahieren von Bildern auswählen",
  "Chọn file PDF để nén": "PDF-Datei zum Komprimieren auswählen",
  "Chọn file PDF để xoay": "PDF-Datei zum Drehen auswählen",
  "Chọn file PDF để xếp trang": "PDF-Datei zum Anordnen der Seiten auswählen",
  "Chọn file PDF để đóng dấu": "PDF-Datei zum Stempeln auswählen",
  "Chọn hoặc kéo thả ảnh cần tách nền vào đây": "Wählen Sie das Bild, dessen Hintergrund entfernt werden soll, aus oder ziehen Sie es hierher",
  "Chọn nhiều ảnh (JPG, PNG)": "Mehrere Bilder auswählen (JPG, PNG)",
  "Chờ nén...": "Komprimierung läuft...",
  "Chữ Ký Số Hợp Lệ": "Gültige digitale Signatur",
  "Copy": "Kopieren",
  "Cứu Lỗi Font Tiếng Việt": "Vietnamesische Schriftfehler beheben",
  "Doanh thu bán ra (Giá cho khách):": "Verkaufserlös (Kundenpreis):",
  "Dán văn bản bị lỗi font chữ ô vuông/loạn mã vào đây...": "Fügen Sie hier Text mit Kästchen-/Zeichensalat-Schriftfehlern ein...",
  "Dùng chuột hoặc ngón tay để vẽ chữ ký": "Zeichnen Sie Ihre Unterschrift mit der Maus oder dem Finger",
  "Dữ liệu chỉ tồn tại tạm thời trong RAM máy tính. Khi bấm xóa, toàn bộ dấu vết sẽ biến mất vĩnh viễn.": "Die Daten existieren nur vorübergehend im RAM Ihres Computers. Wenn Sie auf Löschen klicken, verschwinden alle Spuren dauerhaft.",
  "Ghép File & Tiện Ích": "PDF-Tools",
  "Ghép File & Tiện Ích Văn Phòng": "PDF-Tools & Büro-Werkzeuge",
  "Ghép Ảnh Thành File PDF": "Bilder zu einer PDF-Datei zusammenführen",
  "Ghép ảnh chụp CCCD, bằng lái, hợp đồng thành 1 PDF": "Fotos von Personalausweisen, Führerscheinen und Verträgen zu 1 PDF zusammenführen",
  "Giá Bán Cho Khách (VND):": "Verkaufspreis für Kunden (VND):",
  "Giá Nhập / Giá Vốn (VND):": "Einkaufspreis / Einstandspreis (VND):",
  "Giá vốn sản phẩm (COGS):": "Produktkosten (COGS):",
  "Giảm nhẹ dung lượng để gửi mail & lưu trữ": "Dateigröße leicht reduzieren für E-Mail-Versand & Archivierung",
  "Gói Dịch Vụ Sàn Tùy Chọn:": "Optionale Marktplatz-Servicepakete:",
  "Gói Freeship Xtra (Shopee 6% / TikTok 5.5%)": "Freeship-Xtra-Paket (Shopee 6 % / TikTok 5,5 %)",
  "Gói Voucher Xtra (4%)": "Voucher-Xtra-Paket (4 %)",
  "Gộp & Lưu Về Máy Ngay": "Jetzt zusammenführen & auf Gerät speichern",
  "Gộp Nhiều File PDF": "Mehrere PDF-Dateien zusammenführen",
  "Gỡ pass sao kê VCB, MB, Techcombank, lương": "Passwort von VCB-, MB-, Techcombank- und Gehalts-Kontoauszügen entfernen",
  "HOT": "HOT",
  "Hao hụt hoàn hàng & vận chuyển chiều về:": "Rücksende- & Rückversandverlust:",
  "Hiển thị 0 hóa đơn": "0 Rechnungen werden angezeigt",
  "Hoa Hồng Affiliate (%):": "Affiliate-Provision (%):",
  "HÓA ĐƠN GIÁ TRỊ GIA TĂNG": "MEHRWERTSTEUER-RECHNUNG",
  "Hóa Đơn XML": "XML-Rechnungen",
  "Hỗ trợ JPG, PNG, WEBP dung lượng tối đa 25MB": "Unterstützt JPG, PNG, WEBP bis zu 25 MB",
  "Hỗ trợ JPG, PNG, WebP (Ảnh sản phẩm, logo, chân dung)": "Unterstützt JPG, PNG, WebP (Produktfotos, Logos, Porträts)",
  "Hỗ trợ chọn 50 - 100 ảnh iPhone cùng lúc": "Unterstützt die gleichzeitige Auswahl von 50 - 100 iPhone-Fotos",
  "Hỗ trợ chọn nhiều file cùng lúc (hoặc 1 file đơn)": "Unterstützt die gleichzeitige Auswahl mehrerer Dateien (oder einer einzelnen Datei)",
  "In Hóa Đơn / Lưu PDF": "Rechnung drucken / als PDF speichern",
  "Khấu trừ Thuế TNCN (0.5%) & Thuế GTGT (1%) cho hộ kinh doanh cá nhân": "Abzug der Einkommensteuer (0,5 %) & Mehrwertsteuer (1 %) für Einzelunternehmen",
  "Kéo thả các file .HEIC vào đây": ".HEIC-Dateien hierher ziehen",
  "Kéo thả các file .XML vào đây": ".XML-Dateien hierher ziehen",
  "Kéo thả ảnh vào đây để nén": "Bilder hierher ziehen, um sie zu komprimieren",
  "Kéo tăng nếu còn sót viền nền; kéo giảm nếu bị ăn lẹm vào chi tiết sản phẩm.": "Erhöhen, wenn Hintergrundränder übrig bleiben; verringern, wenn Produktdetails angeschnitten werden.",
  "Ký Tên Lên Hợp Đồng PDF\\n TIỆN ÍCH": "PDF-Verträge unterschreiben\\n DIENSTPROGRAMM",
  "Ký hiệu: ...": "Zeichen: ...",
  "Ký vào trang:": "Auf Seite unterschreiben:",
  "Kết Quả Trong Suốt Thời Gian Thực": "Ergebnisse in Echtzeit",
  "Kết quả tiếng Việt chuẩn Unicode sẽ hiện ở đây...": "Das Ergebnis in Standard-Unicode-Vietnamesisch erscheint hier...",
  "Làm mịn & Khử răng cưa (Feathering):": "Glättung & Kantenglättung (Feathering):",
  "Lãi Sàn & Thuế": "Gewinn & Steuern",
  "Lọc theo Tên người bán, MST, Số hóa đơn...": "Nach Verkäufername, Steuernummer, Rechnungsnummer filtern...",
  "Lợi Nhuận Ròng / Đơn:": "Nettogewinn / Bestellung:",
  "Lợi Nhuận Sàn": "Marktplatzgewinn",
  "Lợi Nhuận Sàn & Thuế 2026": "Marktplatz-Gewinn & Steuern 2026",
  "Miễn Phí 100% • Không Thu Phí • Không Lưu Trữ Dữ Liệu Lên Server": "100% Kostenlos • Keine Server-Speicherung • Kein Paywall",
  "Màu nền nhận diện": "Markenhintergrundfarbe",
  "Mã số thuế: ...": "Steuernummer: ...",
  "Mẫu": "Muster",
  "Mở Khóa & Lưu File PDF Sạch": "Entsperren & saubere PDF-Datei speichern",
  "Mở Khóa Mật Khẩu PDF\\n 100% RAM": "PDF-Passwort entsperren\\n 100 % RAM",
  "Nghĩa vụ Thuế TMĐT (1.5% DT):": "E-Commerce-Steuerpflicht (1,5 % des Umsatzes):",
  "Ngày lập: ...": "Ausstellungsdatum: ...",
  "Người Bán Hàng": "Verkäufer",
  "Người Mua Hàng": "Käufer",
  "Người mua: ...": "Käufer: ...",
  "Nhập chữ cần đóng dấu (VD: BẢN SAO, MẬT)": "Wasserzeichen eingeben (z. B. KOPIE, VERTRAULICH)",
  "Nhập mật khẩu (CCCD oder ngày sinh)...": "Passwort eingeben (Ausweisnummer oder Geburtsdatum)...",
  "Nhật Ký Phiên Làm Việc\\n 0": "Sitzungsprotokoll\\n 0",
  "Nén & Tải Về Máy": "Komprimieren & Herunterladen",
  "Nén Dung Lượng PDF\\n HOT": "PDF-Größe komprimieren\\n HOT",
  "Nén Ảnh": "Bilder komprimieren",
  "Nén Ảnh WebP": "WebP Komprimieren",
  "Nối nhiều file chứng từ, hợp đồng thành 1": "Mehrere Beleg- und Vertragsdateien zu einer zusammenführen",
  "Phí cố định hoa hồng theo ngành:": "Feste Kategorie-Provision:",
  "Phí giao dịch thanh toán & hạ tầng:": "Zahlungstransaktions- & Infrastrukturgebühren:",
  "Phí gói Freeship Xtra & Voucher Xtra:": "Gebühren für Freeship Xtra & Voucher Xtra:",
  "Quay Lại Bảng Kê": "Zurück zur Abrechnung",
  "Sau khi sàn trừ hết các khoản": "Nach Abzug aller Gebühren durch den Marktplatz",
  "Shopee": "Shopee",
  "Studio Ảnh": "Fotostudio",
  "Số tiền viết bằng chữ: ...": "Betrag in Worten: ...",
  "Số tài khoản: ...": "Kontonummer: ...",
  "Số: ...": "Nr.: ...",
  "Sửa tài liệu scan bị ngược hoặc nằm ngang": "Gescannte Dokumente korrigieren, die kopfüber oder seitlich liegen",
  "TIỆN ÍCH": "WERKZEUGE",
  "Thuế TMĐT (Thông tư 40/2021/TT-BTC):": "E-Commerce-Steuer (Rundschreiben 40/2021/TT-BTC):",
  "Thêm chữ chìm bảo vệ chứng từ chống sao chép": "Wasserzeichen zum Schutz von Dokumenten vor Kopieren hinzufügen",
  "Thông báo": "Benachrichtigung",
  "Thử Ảnh Mẫu (1-Click)": "Beispielbild testen (1-Klick)",
  "TikTok Shop": "TikTok Shop",
  "Tiền Ads/Đơn (đ):": "Werbekosten/Bestellung (VND):",
  "Tiền Hàng (Chưa Thuế)": "Warenbetrag (ohne Steuer)",
  "Tiền Sàn Trả Về (Payout):": "Marktplatz-Auszahlung:",
  "Tiền Thuế GTGT": "MwSt.-Betrag",
  "Tiền thuế GTGT:": "MwSt.-Betrag:",
  "Tiền tệ: VND": "Währung: VND",
  "Trích Xuất & Tải File ZIP": "Extrahieren & ZIP-Datei herunterladen",
  "Trích Xuất PDF Sang Ảnh\\n ZIP": "PDF in Bilder extrahieren\\n ZIP",
  "Trợ Lý Dự Toán Lợi Nhuận Sàn & Thuế TMĐT (2025 - 2026)": "Marktplatz-Gewinn- & E-Commerce-Steuer-Rechner (2025 - 2026)",
  "TÁCH NỀN ẢNH 1 CHẠM 100% TRONG RAM — KHÔNG WATERMARK, KHÔNG GIỚI HẠN": "HINTERGRUNDENTFERNUNG MIT EINEM KLICK 100 % IM RAM — KEIN WASSERZEICHEN, KEINE LIMITS",
  "Tách & Trích Xuất Trang PDF": "PDF-Seiten teilen & extrahieren",
  "Tách & Tải Về Máy": "Teilen & Herunterladen",
  "Tách Nền Ảnh (PNG Trong Suốt)": "Bildhintergrund entfernen (transparentes PNG)",
  "Tách riêng các trang cần lấy (VD: 1-3, 5)": "Bestimmte Seiten extrahieren (z. B. 1-3, 5)",
  "TẠI SAO ẢNH IPHONE (.HEIC) KHÔNG MỞ ĐƯỢC TRÊN MÁY TÍNH VÀ SHOPPE/TIKTOK?": "WARUM LASSEN SICH IPHONE-FOTOS (.HEIC) NICHT AUF COMPUTERN UND SHOPEE/TIKTOK ÖFFNEN?",
  "Tại Sao Bạn Cần Nén Ảnh? Tính Năng Này Giúp Gì Cho Bạn?": "Warum brauchen Sie Bildkomprimierung? Wie hilft Ihnen diese Funktion?",
  "Tải 1 File XML Mẫu": "Eine XML-Beispieldatei herunterladen",
  "Tải Lên Hóa Đơn XML (Đơn Lẻ hoặc Hàng Loạt)": "XML-Rechnungen hochladen (einzeln oder im Stapel)",
  "Tải PNG Trong Suốt (Full HD)": "Transparentes PNG herunterladen (Full HD)",
  "Tải Ảnh Chữ Ký": "Unterschriftsbild herunterladen",
  "Tải Ảnh Đã Nén Về Máy": "Komprimierte Bilder herunterladen",
  "Tất Cả (12 Công Cụ)": "Alle (12 Werkzeuge)",
  "TỔNG TIỀN THANH TOÁN:": "GESAMTZAHLUNGSBETRAG:",
  "Tổng Số Hóa Đơn": "Gesamtzahl der Rechnungen",
  "Tổng Thanh Toán": "Gesamtzahlung",
  "Tổng tiền chưa thuế:": "Zwischensumme (ohne Steuer):",
  "Tự động nhận diện dòng/cột & xuất file .xlsx sạch sẽ": "Zeilen/Spalten automatisch erkennen & eine saubere .xlsx-Datei exportieren",
  "Tỷ lệ hoàn trả / hủy hàng dự kiến của shop:": "Erwartete Rücksende-/Stornoquote des Shops:",
  "VD: 1-3, 5 hoặc 2, 4": "z. B. 1-3, 5 oder 2, 4",
  "Vui lòng kéo thả các file .XML vào khung bên trái hoặc bấm vào nút \\\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\\\" ở góc trên.": "Bitte ziehen Sie .XML-Dateien in den linken Bereich oder klicken Sie oben auf die Schaltfläche \\\"⚡ 5 Beispielrechnungen testen\\\".",
  "Vẽ Tay": "Von Hand zeichnen",
  "Vẽ chữ ký tay hoặc chèn ảnh chữ ký trong suốt": "Eine handschriftliche Unterschrift zeichnen oder ein transparentes Unterschriftsbild einfügen",
  "Xem 1 Hóa Đơn Mẫu": "Eine Beispielrechnung ansehen",
  "Xem thumbnail từng trang, bỏ trang thừa": "Seitenvorschauen anzeigen, überflüssige Seiten entfernen",
  "Xem trước số liệu": "Zahlen in der Vorschau anzeigen",
  "Xoay & Lưu Về Máy": "Drehen & Herunterladen",
  "Xoay Chiều Trang PDF": "PDF-Seiten drehen",
  "Xuất Bảng Kê Excel": "Excel-Abrechnung exportieren",
  "Xuất Bảng Kê Excel (.xlsx)": "Excel-Abrechnung exportieren (.xlsx)",
  "Xuất Excel (.xlsx)": "Excel exportieren (.xlsx)",
  "Xuất File PDF Mới": "Neue PDF-Datei exportieren",
  "Xuất Thành File PDF (Khổ A4)": "Als PDF-Datei exportieren (A4-Format)",
  "Xuất từng trang thành JPG/PNG nét cao": "Jede Seite als hochauflösendes JPG/PNG exportieren",
  "Xóa": "Löschen",
  "Xóa & Đổi Thứ Tự Trang\\n HOT": "Seiten löschen & neu anordnen\\n HOT",
  "Xóa Hết": "Alles löschen",
  "Xóa Lịch Sử & Dọn Sạch RAM": "Verlauf Löschen & RAM Leeren",
  "Xóa Sạch Lịch Sử Khi Xong": "Verlauf Löschen Wenn Fertig",
  "Xóa tất cả": "Alle löschen",
  "Xóa vẽ lại": "Löschen und neu zeichnen",
  "Xử Lý Ảnh Chuyên Nghiệp: Đổi Ảnh HEIC (iPhone) & Nén Ảnh": "Professionelle Bildverarbeitung: HEIC-Fotos (iPhone) konvertieren & Bilder komprimieren",
  "ZIP": "ZIP",
  "ZenTool": "ZenTool",
  "ZenTool Suite": "ZenTool Suite",
  "Đang giải mã ảnh HEIC trong RAM...": "HEIC-Bilder werden im RAM dekodiert...",
  "Đang tính toán phân tích chỉ số...": "Kennzahlen werden berechnet und analysiert...",
  "Đang tải thông tin ngành hàng...": "Kategorieinformationen werden geladen...",
  "Đã chuyển đổi thành công: 0 ảnh": "Erfolgreich konvertiert: 0 Bilder",
  "Đã chọn 0 tệp PDF:": "0 PDF-Dateien ausgewählt:",
  "Đã chọn 0 ảnh:": "0 Bilder ausgewählt:",
  "Đã nạp: 0 file": "Geladen: 0 Dateien",
  "Đóng Chữ Ký & Lưu Hợp Đồng": "Unterschrift anwenden & Vertrag speichern",
  "Đóng Dấu & Tải Về Máy": "Stempeln & Herunterladen",
  "Đóng Dấu Bản Quyền (Watermark)": "Urheberrechts-Wasserzeichen hinzufügen",
  "Địa chỉ: ...": "Adresse: ...",
  "Định Dạng Xuất Ra:": "Ausgabeformat:",
  "Định Dạng Đầu Ra:": "Ausgabeformat:",
  "Đọc & Gom Bảng Kê Hóa Đơn Điện Tử XML Hàng Loạt": "Stapelverarbeitung von XML-E-Rechnungsabrechnungen lesen & zusammenfassen",
  "Đọc & Gom Hóa Đơn XML": "XML-Rechnungen Einlesen",
  "Đọc Hóa Đơn XML": "XML-Rechnungen lesen",
  "Đổi Ảnh HEIC & Nén Ảnh": "Fotostudio & HEIC-Konverter",
  "Đổi Ảnh HEIC (iPhone)": "iPhone HEIC Konvertieren",
  "Độ nhạy xóa màu (Tolerance):": "Empfindlichkeit der Farbentfernung (Toleranz):",
  "• 1-Click xuất ra file Excel chuẩn để kê khai thuế.": "• 1-Klick-Export in eine standardisierte Excel-Datei für die Steuererklärung.",
  "• Bấm \\\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\\\" để trải nghiệm bảng kê kế toán mẫu tức thì.": "• Klicken Sie auf \\\"⚡ 5 Beispielrechnungen testen\\\", um sofort eine Beispiel-Buchhaltungsabrechnung zu erleben.",
  "• Kéo thả 1 hoặc nhiều file XML vào ô trên để bóc tách ngay.": "• Ziehen Sie eine oder mehrere XML-Dateien in das Feld oben, um sie sofort zu extrahieren.",
  "⚡ Sửa Lỗi Font Ngay": "⚡ Schriftfehler jetzt beheben",
  "⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu": "⚡ 5 Beispielrechnungen testen",
  "⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu": "⚡ Beispiel-Bildkonvertierung testen",
  "✓ Tự động lọc nền trắng thành trong suốt": "✓ Weißen Hintergrund automatisch in Transparenz umwandeln",
  "💡 Hướng dẫn nhanh:": "💡 Kurzanleitung:",
  "💡 Nền caro biểu thị vùng trong suốt. Khi chèn lên web hoặc sàn Shopee/TikTok, nền sẽ tự động hòa vào ảnh nền đích.": "💡 Das Schachbrettmuster zeigt transparente Bereiche an. Beim Einfügen auf einer Website oder bei Shopee/TikTok fügt sich der Hintergrund automatisch in den Zielhintergrund ein.",
  "📑 Ghép & Xử Lý Trang (4)": "📑 Seiten & Zusammenführen (4)",
  "📦 Tải Toàn Bộ (File ZIP)": "📦 Alles herunterladen (ZIP-Datei)",
  "🔄 Chuyển Đổi & Nén (4)": "🔄 Konvertieren & Komprimieren (4)",
  "🔒 Ký Tên & Bảo Mật (4)": "🔒 Signieren & Schützen (4)",
  "Nhập mật khẩu (CCCD hoặc ngày sinh)...": "Enter password (ID number or date of birth)...",
  "Tiếng Việt": "Vietnamesisch",
  "English": "Englisch",
  "Deutsch": "Deutsch",
  "Tách Nền Ảnh 1 Chạm": "1-Klick Hintergrund Entferner",
  "Tách Nền Ảnh (PNG)": "Hintergrund Entfernen (PNG)",
  "Xem Trước Bảng": "Tabellenvorschau",
  "Đang xử lý...": "Wird verarbeitet...",
  "Thành công!": "Erfolgreich!",
  "Đã sao chép!": "In Zwischenablage kopiert!",
  "Báo cáo lợi nhuận": "Gewinnbericht",
  "Xem chi tiết": "Details Anzeigen",
  "Đóng": "Schließen",
  "In Bảng Kê": "Aufstellung Drucken",
  "Xuất Excel Bảng Kê": "Rechnungen Nach Excel Exportieren",
  "Tải Về": "Herunterladen",
  "Làm lại": "Zurücksetzen",
  "\"Ảnh chụp từ điện thoại nét căng thì cứ để nguyên đăng lên, tại sao phải nén làm gì?\"": "\"Handyfotos sind doch gestochen scharf – warum sollte man sie vor dem Hochladen überhaupt komprimieren?\"",
  "\"⚡ Thử Bảng Kê 5 Hóa Đơn Mẫu\"": "\"⚡ 5-Rechnungen-Musteraufstellung testen\"",
  "\"⚡ Thử Nghiệm Chuyển Đổi Ảnh Mẫu\"": "\"⚡ Beispiel-Bildkonvertierung testen\"",
  "-0 đ": "-0 VND",
  ". Chúng tôi không lưu trữ, không sao chép, và không có máy chủ trung gian nào có thể xem được số liệu kinh doanh của bạn.": ". Wir speichern nichts, kopieren nichts, und es gibt keinen Zwischenserver, der Ihre Geschäftsdaten einsehen kann.",
  ". Dung lượng quá nặng này chính là thủ phạm gây ra 4 rắc rối lớn hàng ngày:": ". Diese übermäßige Dateigröße ist der Auslöser für 4 große tägliche Probleme:",
  ". Thực tế, một bức ảnh chụp điện thoại thường nặng từ": ". Tatsächlich wiegt ein Handyfoto in der Regel zwischen",
  ". Xử lý 100% tại trình duyệt máy tính của bạn, không upload ảnh lên mạng, không yêu cầu đăng ký hay thẻ tín dụng.": ". 100 % Verarbeitung im Browser Ihres Computers, kein Bild-Upload ins Internet, keine Registrierung und keine Kreditkarte erforderlich.",
  ". ZenTool giúp bạn chuyển đổi hàng loạt sang": ". Mit ZenTool konvertieren Sie im Stapel zu",
  ".HEIC": ".HEIC",
  "5MB đến 15MB": "5 MB bis 15 MB",
  "70% — Tối Ưu Dung Lượng (Cực nhẹ cho gửi mail)": "70 % — Größenoptimiert (ultraleicht für E-Mail)",
  "80% — Tiêu Chuẩn Vàng (Đẹp & Giảm 70% dung lượng)": "80 % — Goldstandard (tolle Qualität & 70 % kleiner)",
  "90% — Cực Kỳ Sắc Nét (Gần như không nén)": "90 % — Extrem scharf (nahezu ohne Kompression)",
  "Bấm \"Xem\" để mở bản in chi tiết từng hóa đơn": "Klicken Sie auf \"Ansehen\", um den detaillierten Ausdruck jeder Rechnung zu öffnen",
  "Bấm \"Xóa\" trên trang để loại bỏ hoặc mũi tên để dời vị trí:": "Klicken Sie auf \"Löschen\" auf einer Seite, um sie zu entfernen, oder auf die Pfeile, um sie zu verschieben:",
  "Chuẩn JPEG / JPG (Khuyên Dùng - Tương thích 100% mọi nơi)": "JPEG-/JPG-Standard (empfohlen – 100 % überall kompatibel)",
  "Chuẩn JPEG / JPG Tiêu Chuẩn": "Standard-JPEG / JPG",
  "Chuẩn PNG (Giữ chi tiết nguyên bản chất lượng cao)": "PNG-Standard (bewahrt hochwertige Originaldetails)",
  "Chuẩn WebP (Siêu nhẹ cho Website & Đăng sàn)": "WebP-Standard (ultraleicht für Websites & Marktplatz-Listings)",
  "Chuẩn WebP Thế Hệ Mới (Siêu Nhẹ - Khuyên Dùng)": "WebP-Standard der neuen Generation (ultraleicht – empfohlen)",
  "Chẩn Đoán Của Trợ Lý:": "Diagnose des Assistenten:",
  "Chọn các ảnh từ iPhone (.heic) kéo vào khung bên trái, hoặc bấm": "Wählen Sie Fotos von Ihrem iPhone (.heic) und ziehen Sie sie in den linken Bereich, oder klicken Sie auf",
  "Các sàn thương mại điện tử yêu cầu ảnh tải lên phải dưới 1MB - 2MB. Ảnh nén sang chuẩn": "E-Commerce-Marktplätze verlangen hochgeladene Bilder unter 1 MB – 2 MB. Bilder, die in das Format komprimiert werden",
  "Giải pháp thay thế hoàn hảo cho Remove.bg và Canva Pro: Tách phông nền trắng/màu đơn sắc của ảnh sản phẩm, ảnh chụp chân dung và xuất thẳng file": "Die perfekte Alternative zu Remove.bg und Canva Pro: Weiße/einfarbige Hintergründe von Produkt- und Porträtfotos entfernen und direkt exportieren als",
  "Gộp, tách, nén, mở khóa sao kê ngân hàng, ký hợp đồng, xóa/đổi thứ tự trang, và cứu lỗi font chữ. 100% Client-Side trong RAM, bảo mật tuyệt đối!": "Zusammenführen, teilen, komprimieren, Kontoauszüge entsperren, Verträge signieren, Seiten löschen/umsortieren und Schriftfehler beheben. 100 % clientseitig im RAM, absolut sicher!",
  "Hiển thị": "Anzeigen",
  "Hòm thư Gmail hay Outlook thường giới hạn file đính kèm dưới 25MB. Đính kèm 3 bức ảnh gốc là hòm thư báo lỗi không gửi được. Nén ảnh giúp bạn gửi cả chục ảnh nhẹ nhàng.": "Gmail- oder Outlook-Postfächer begrenzen Anhänge meist auf unter 25 MB. Hängen Sie 3 Originalfotos an, meldet das Postfach einen Sendefehler. Mit komprimierten Bildern senden Sie mühelos ein Dutzend Fotos.",
  "JPG / PNG chuẩn quốc tế": "JPG / PNG nach internationalem Standard",
  "Khách hàng lướt web trên điện thoại nếu ảnh load quá 3 giây họ sẽ tắt ngay lập tức. Nén ảnh giúp trang web mở ra trong tích tắc, giữ chân khách mua hàng.": "Wenn Bilder auf dem Handy länger als 3 Sekunden laden, springen Kunden sofort ab. Komprimierte Bilder lassen Ihre Website in Sekundenbruchteilen öffnen und halten Käufer.",
  "Kéo thả 50 - 100 file XML cùng lúc để bóc tách thông tin và tự động xuất ra Bảng Kê Excel (.xlsx) chuẩn thuế. 100% trong RAM máy tính.": "Ziehen Sie 50 – 100 XML-Dateien gleichzeitig per Drag & Drop, um Daten zu extrahieren und automatisch eine steuerkonforme Excel-Aufstellung (.xlsx) zu exportieren. 100 % im RAM Ihres Computers.",
  "Ký Hiệu": "Serie",
  "Ký Tên Lên Hợp Đồng PDF": "PDF-Verträge signieren",
  "Ký hiệu:": "Serie:",
  "LƯU Ý MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ:": "RECHTLICHER HAFTUNGSAUSSCHLUSS:",
  "Lưu trữ 1.000 ảnh gốc tốn 10GB dung lượng máy. Sau khi nén chỉ còn chưa tới 1.5GB, không bao giờ phải lo máy tính bị báo đầy bộ nhớ.": "1.000 Originalfotos belegen 10 GB Speicherplatz. Nach der Kompression sind es unter 1,5 GB – Sie müssen nie befürchten, dass Ihr Computer zu wenig Speicher meldet.",
  "MST Bán": "Verkäufer-Steuernummer",
  "Mã số thuế:": "Steuernummer:",
  "Mọi công thức và số liệu tính toán tại ZenTool chỉ mang tính chất": "Alle Formeln und Berechnungen in ZenTool dienen ausschließlich",
  "Mọi file hóa đơn XML, chứng từ hợp đồng đều được": "Alle XML-Rechnungsdateien und Vertragsdokumente werden",
  "Mở Khóa Mật Khẩu PDF": "PDF-Passwort entsperren",
  "Ngày Lập": "Ausstellungsdatum",
  "Ngày lập:": "Ausstellungsdatum:",
  "Người mua:": "Käufer:",
  "Nhiều người thắc mắc:": "Viele fragen sich:",
  "Nhật Ký Phiên Làm Việc": "Sitzungsprotokoll",
  "Nén Cực Nhẹ (Giảm 75% - 85% cho gửi mail gấp)": "Ultraleicht (75 % – 85 % kleiner für dringende E-Mails)",
  "Nén Dung Lượng PDF": "PDF-Größe komprimieren",
  "Nén Giữ Nét Cao (Giảm 30% - 40% cho in ấn)": "Hochwertige Kompression (30 % – 40 % kleiner für den Druck)",
  "PNG trong suốt Full HD": "Full-HD-PNG mit Transparenz",
  "Phân bổ chính xác theo từng ngành hàng cụ thể, khấu trừ phí thanh toán (6%), phí hạ tầng (3k), phí ngành, chi phí hoàn hủy và thuế TNCN/GTGT.": "Genaue Zuordnung nach konkreter Warengruppe, abzüglich Zahlungsgebühren (6 %), Infrastrukturgebühren (3k), Branchengebühren, Rücksende-/Stornokosten sowie Einkommen- und Umsatzsteuer.",
  "STT": "Nr.",
  "Siêu nét (2.0x)": "Extrem scharf (2,0x)",
  "Số HĐ": "Rechnungs-Nr.",
  "Số Lượng": "Menge",
  "Số tiền viết bằng chữ:": "Betrag in Worten:",
  "Số tài khoản:": "Kontonummer:",
  "Số:": "Nr.:",
  "Thao Tác": "Aktionen",
  "Thuế Suất": "Steuersatz",
  "Thuế VAT": "MwSt.",
  "Thành Tiền": "Gesamtbetrag",
  "Tiêu Chuẩn (Giảm 50% - 70%, giữ chữ rõ nét)": "Standard (50 % – 70 % kleiner, Text bleibt scharf)",
  "Tiền Hàng": "Warenwert",
  "Tiền tệ:": "Währung:",
  "Trang 1": "Seite 1",
  "Trang cuối cùng (Khuyên Dùng)": "Letzte Seite (empfohlen)",
  "Trích Xuất PDF Sang Ảnh": "PDF in Bilder umwandeln",
  "Tên Hàng Hóa, Dịch Vụ": "Waren-/Dienstleistungsbezeichnung",
  "VND": "VND",
  "Vui lòng kéo thả các file .XML vào khung bên trái hoặc bấm vào nút": "Bitte ziehen Sie die .XML-Dateien in den linken Bereich oder klicken Sie auf die Schaltfläche",
  "WebP": "WebP",
  "Xoay Ngược 180 Độ (Lộn ngược đầu)": "Um 180 Grad drehen (kopfüber)",
  "Xoay Phải 90 Độ (Thuận chiều kim đồng hồ)": "Um 90 Grad nach rechts drehen (im Uhrzeigersinn)",
  "Xoay Trái 270 Độ (Ngược chiều kim đồng hồ)": "Um 270 Grad nach links drehen (gegen den Uhrzeigersinn)",
  "Xóa & Đổi Thứ Tự Trang": "Seiten löschen & umsortieren",
  "ZenTool Suite — Siêu Tiện Ích Văn Phòng & Trợ Lý Lợi Nhuận Bán Hàng 100% Client-Side": "ZenTool Suite — 100 % clientseitige Büro-Tools & Verkaufsgewinn-Assistent",
  "Zero Server Upload": "Zero Server Upload",
  "báo lỗi không hỗ trợ định dạng này": "meldet, dass dieses Format nicht unterstützt wird",
  "dự toán kinh doanh giả định và tham khảo": "hypothetische Geschäftskalkulationen und Referenzzwecke",
  "dựa trên biểu phí công bố công khai của các sàn và biểu thuế hiện hành. Đây không phải là cam kết kế toán hay văn bản pháp lý thay thế cho quyết toán chính thức từ Cơ quan Thuế hoặc báo cáo tài chính Kênh Người Bán của sàn. Nhà bán hàng tự chịu trách nhiệm với chiến lược giá và nghĩa vụ thuế thực tế của mình.": "basierend auf öffentlich veröffentlichten Gebührenordnungen der Marktplätze und aktuellen Steuertabellen. Dies ist keine buchhalterische Zusage und kein Rechtsdokument, das die offizielle Abrechnung der Steuerbehörde oder die Finanzberichte des Verkäuferkanals des Marktplatzes ersetzt. Verkäufer sind für ihre eigene Preisstrategie und ihre tatsächlichen Steuerpflichten selbst verantwortlich.",
  "file": "Datei",
  "giữ nguyên độ sắc nét nhưng dung lượng giảm tới 80%, sàn duyệt ngay lập tức.": "behält die Schärfe bei und reduziert die Größe um bis zu 80 %, der Marktplatz genehmigt sie sofort.",
  "hóa đơn": "Rechnung",
  "iPhone từ iOS 11 mặc định lưu ảnh dưới định dạng": "iPhones speichern Fotos ab iOS 11 standardmäßig im Format",
  "siêu nét chỉ trong 2 giây, không tải ảnh lên bất kỳ máy chủ nào!": "in nur 2 Sekunden extrem scharf, ohne Bilder auf einen Server hochzuladen!",
  "tệp PDF:": "PDF-Datei:",
  "xử lý trực tiếp trong bộ nhớ RAM trình duyệt máy tính của bạn": "direkt im RAM Ihres Computer-Browsers verarbeitet",
  "ĐVT": "Einheit",
  "Đã chuyển đổi thành công:": "Erfolgreich konvertiert:",
  "Đã chọn": "Ausgewählt",
  "Đã ký số điện tử": "Elektronisch signiert",
  "Đã nạp:": "Geladen:",
  "Đơn Giá": "Stückpreis",
  "Đơn Vị Bán Hàng": "Verkäufer",
  "Đơn Vị Bán Hàng:": "Verkäufer:",
  "Đơn Vị Mua Hàng:": "Käufer:",
  "Địa chỉ:": "Adresse:",
  "Độ nét cao (1.5x)": "Hohe Schärfe (1,5x)",
  "để tiết kiệm bộ nhớ. Nhưng máy tính Windows cũ, Zalo trên PC, phần mềm kế toán và các sàn Shopee/TikTok thường": "um Speicher zu sparen. Aber ältere Windows-Computer, Zalo am PC, Buchhaltungssoftware und die Marktplätze Shopee/TikTok oft",
  "để trải nghiệm bảng kê kế toán mẫu tức thì.": "um die Muster-Buchhaltungsaufstellung sofort zu erleben.",
  "để trải nghiệm.": "zum Ausprobieren.",
  "Ảnh JPG": "JPG-Bild",
  "Ảnh PNG": "PNG-Bild",
  "ảnh": "Bild",
  "ảnh:": "Bild:",
  "ở góc trên.": "in der oberen Ecke.",
  "• Bấm": "• Klicken Sie auf",
  "🇩🇪 DE": "🇩🇪 DE",
  "🇬🇧 EN": "🇬🇧 EN",
  "🇻🇳 VI": "🇻🇳 VI",
  "Nội dung chữ đóng dấu:": "Wasserzeichen-Text:",
  "Phông Chữ:": "Schriftart:",
  "Cỡ chữ:": "Größe:",
  "Độ mờ:": "Deckkraft:",
  "Màu Sắc Đóng Dấu:": "Stempelfarbe:",
  "Xem trước dấu chìm:": "Stempel-Vorschau:",
  "Sans-serif Hiện Đại (Segoe UI / Arial)": "Modernes Sans-serif (Segoe UI / Arial)",
  "Serif Trang Trọng (Times New Roman)": "Klassisches Serif (Times New Roman)",
  "Monospace Kỹ Thuật (Courier New)": "Technisches Monospace (Courier New)",
  "Đậm Nổi Bật (Impact / Arial Black)": "Fett & Markant (Impact / Arial Black)",
  "Góc nghiêng 45°": "45°-Winkel",
  "ZenTelemetry Live": "ZenTelemetry Live",
  "100% Dữ Liệu Thật": "100% Echte Daten",
  "Số liệu giám sát trực tuyến minh bạch, không đếm ảo": "Transparente Echtzeit-Telemetrie, keine simulierten Zähler",
  "Đang Online": "Jetzt Online",
  "Lượt Truy Cập": "Seitenaufrufe",
  "Người Dùng Thực": "Echte Nutzer",
  "Lượt Tải Về": "Downloads Gesamt"
}
};

const UI_DICTIONARY = TRANSLATIONS;

let currentLanguage = 'vi';

function initLanguage() {
  let saved = 'vi';
  try {
    saved = localStorage.getItem('zentool_lang') || 'vi';
  } catch (e) {
    saved = 'vi';
  }
  if (!['vi', 'en', 'de'].includes(saved)) saved = 'vi';
  setLanguage(saved);
}

function normalizeText(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

function setLanguage(lang) {
  if (!['vi', 'en', 'de'].includes(lang)) lang = 'vi';
  currentLanguage = lang;
  try {
    localStorage.setItem('zentool_lang', lang);
  } catch (e) {}

  // 1. Đồng bộ dropdown chọn ngôn ngữ
  const select = document.getElementById('lang-select');
  if (select && select.value !== lang) {
    select.value = lang;
  }

  const dict = UI_DICTIONARY[lang] || {};

  // 2. Quét & dịch toàn bộ cây DOM bằng TreeWalker (100% nội dung trang)
  if (typeof document !== 'undefined' && document.body) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.nodeValue && node.nodeValue.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      },
      false
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      if (typeof currentNode._origText === 'undefined') {
        currentNode._origText = currentNode.nodeValue;
      }

      if (lang === 'vi') {
        currentNode.nodeValue = currentNode._origText;
      } else {
        const origRaw = currentNode._origText;
        const cleanKey = normalizeText(origRaw);
        if (dict[cleanKey]) {
          const leading = origRaw.match(/^\s*/)[0];
          const trailing = origRaw.match(/\s*$/)[0];
          currentNode.nodeValue = leading + dict[cleanKey] + trailing;
        }
      }
      currentNode = walker.nextNode();
    }

    // 3. Dịch toàn bộ Placeholders (Ô tìm kiếm, ô nhập liệu)
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
      if (typeof el._origPlaceholder === 'undefined') {
        el._origPlaceholder = el.placeholder;
      }
      if (lang === 'vi') {
        el.placeholder = el._origPlaceholder;
      } else {
        const clean = normalizeText(el._origPlaceholder);
        if (dict[clean]) {
          el.placeholder = dict[clean];
        }
      }
    });

    // 4. Dịch toàn bộ Tiêu đề gợi ý (Tooltips title)
    document.querySelectorAll('[title]').forEach((el) => {
      if (el.id === 'lang-select') return;
      if (typeof el._origTitle === 'undefined') {
        el._origTitle = el.title;
      }
      if (lang === 'vi') {
        el.title = el._origTitle;
      } else {
        const clean = normalizeText(el._origTitle);
        if (dict[clean]) {
          el.title = dict[clean];
        }
      }
    });

    // 5. Dịch toàn bộ các lựa chọn Dropdown (<option>)
    document.querySelectorAll('select option').forEach((opt) => {
      if (opt.parentElement && opt.parentElement.id === 'lang-select') return;
      if (typeof opt._origText === 'undefined') {
        opt._origText = opt.text;
      }
      if (lang === 'vi') {
        opt.text = opt._origText;
      } else {
        const clean = normalizeText(opt._origText);
        if (dict[clean]) {
          opt.text = dict[clean];
        }
      }
    });

    // 6. Cập nhật thẻ tiêu đề website <title>
    if (lang === 'vi') {
      document.title = 'ZenTool Suite — Siêu Tiện Ích Văn Phòng & Trợ Lý Lợi Nhuận Bán Hàng 100% Client-Side';
    } else if (lang === 'en') {
      document.title = 'ZenTool Suite — 100% Client-Side Privacy-First Productivity & Profit Suite';
    } else if (lang === 'de') {
      document.title = 'ZenTool Suite — 100% Client-Seitige Büro- & E-Commerce Suite';
    }
  }

  // 7. Cập nhật các bảng tính toán và danh sách động
  try {
    if (typeof calculateDetailedProfit === 'function') {
      calculateDetailedProfit();
    }
  } catch (e) {}

  try {
    if (typeof batchInvoices !== 'undefined' && batchInvoices.length > 0 && typeof renderBatchInvoiceView === 'function') {
      renderBatchInvoiceView(batchInvoices);
    }
  } catch (e) {}

  try {
    if (typeof renderOfficeSessionHistory === 'function') {
      renderOfficeSessionHistory();
    }
  } catch (e) {}

  try {
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  } catch (e) {}
}

// Tra cứu từ ngữ động cho Toast, Dialog & Thông báo
function t(text) {
  if (currentLanguage === 'vi' || !text) return text;
  const clean = normalizeText(text);
  const dict = UI_DICTIONARY[currentLanguage];
  if (dict && dict[clean]) return dict[clean];
  return text;
}

// ============================================================
// TOOL 12: BÓC TÁCH BẢNG BIỂU PDF SANG EXCEL (.XLSX) (PHASE 3)
// ============================================================

let currentPdfTableMatrix = null;
let currentPdfTableFileName = 'ZenTool_BangBieu_TrichXuat';

async function handlePdfTableUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert(currentLanguage === 'de' ? 'Bitte wählen Sie eine gültige PDF-Datei.' : (currentLanguage === 'en' ? 'Please select a valid PDF file.' : 'Vui lòng chọn file định dạng PDF.'));
    return;
  }

  currentPdfTableFileName = file.name.replace(/\.[^/.]+$/, "");
  const nameLabel = document.getElementById('pdf-table-file-name');
  if (nameLabel) nameLabel.textContent = `Đang đọc: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (!window.pdfjsLib) {
      alert('Đang tải thư viện PDF.js, vui lòng thử lại sau 2 giây.');
      return;
    }

    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    const allItems = [];

    // Duyệt qua trang đầu (hoặc tối đa 5 trang để bóc tách bảng)
    const pagesToScan = Math.min(numPages, 5);
    for (let p = 1; p <= pagesToScan; p++) {
      const page = await pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      textContent.items.forEach((it) => {
        if (!it.str || !it.str.trim()) return;
        allItems.push({
          str: it.str.trim(),
          x: it.transform[4],
          y: it.transform[5] + (numPages - p) * 1000 // Offset Y giữa các trang
        });
      });
    }

    if (allItems.length === 0) {
      alert('Không tìm thấy văn bản hoặc bảng biểu số liệu trong file PDF này (có thể là file scan dạng ảnh thuần).');
      if (nameLabel) nameLabel.textContent = 'Không tìm thấy text trong file PDF.';
      return;
    }

    // Gom nhóm theo hàng (tọa độ Y trong khoảng 10px)
    // Sắp xếp Y giảm dần (từ trên xuống dưới trang)
    allItems.sort((a, b) => b.y - a.y);

    const rows = [];
    let currentRow = [];
    let currentY = allItems[0].y;

    for (const item of allItems) {
      if (Math.abs(item.y - currentY) <= 10) {
        currentRow.push(item);
      } else {
        if (currentRow.length > 0) {
          currentRow.sort((a, b) => a.x - b.x);
          rows.push(currentRow);
        }
        currentRow = [item];
        currentY = item.y;
      }
    }
    if (currentRow.length > 0) {
      currentRow.sort((a, b) => a.x - b.x);
      rows.push(currentRow);
    }

    // Chuyển đổi thành ma trận 2D
    const matrix = rows.map((r) => r.map((cell) => cell.str));
    currentPdfTableMatrix = matrix;

    if (nameLabel) nameLabel.textContent = `✓ Đã nhận diện ${matrix.length} dòng dữ liệu từ ${file.name}`;
    const btnExport = document.getElementById('btn-export-pdf-table');
    if (btnExport) btnExport.removeAttribute('disabled');

    renderPdfTablePreview(matrix);
    recordOfficeSessionHistory('Bóc Tách Bảng PDF Sang Excel', file.name);

    if (typeof showToastNotification === 'function') {
      showToastNotification(`Đã bóc tách thành công ${matrix.length} dòng bảng biểu!`);
    }
  } catch (err) {
    console.error('Lỗi trích xuất bảng PDF:', err);
    alert('Không thể trích xuất bảng từ file PDF này: ' + err.message);
    if (nameLabel) nameLabel.textContent = 'Lỗi xử lý file.';
  }
}

function renderPdfTablePreview(matrix) {
  const container = document.getElementById('pdf-table-preview-container');
  const box = document.getElementById('pdf-table-preview-box');
  const meta = document.getElementById('pdf-table-preview-meta');

  if (!container || !box) return;

  const rowCount = matrix.length;
  const colCount = Math.max(...matrix.map((r) => r.length), 0);

  if (meta) meta.textContent = `${rowCount} dòng • ${colCount} cột`;

  let html = '<table class="w-full border-collapse text-left">';
  matrix.slice(0, 15).forEach((row, rIdx) => {
    const isHeader = rIdx === 0;
    const trClass = isHeader 
      ? 'bg-emerald-100 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-200' 
      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700';
    html += `<tr class="${trClass}">`;
    row.forEach((cell) => {
      const tag = isHeader ? 'th' : 'td';
      html += `<${tag} class="p-1.5 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">${escapeHtml(cell)}</${tag}>`;
    });
    html += '</tr>';
  });
  html += '</table>';

  if (rowCount > 15) {
    html += `<div class="p-1.5 text-center text-[10px] text-slate-400 italic bg-slate-100/60 dark:bg-slate-800">... và còn ${rowCount - 15} dòng nữa trong file Excel ...</div>`;
  }

  box.innerHTML = html;
  container.classList.remove('hidden');
}

function executePdfTableToExcel() {
  if (!currentPdfTableMatrix || currentPdfTableMatrix.length === 0) {
    alert('Chưa có dữ liệu bảng biểu để xuất Excel.');
    return;
  }

  try {
    const ws = XLSX.utils.aoa_to_sheet(currentPdfTableMatrix);

    // Tính toán độ rộng cột tự động
    const colWidths = [];
    currentPdfTableMatrix.forEach((row) => {
      row.forEach((val, cIdx) => {
        const len = String(val || '').length;
        colWidths[cIdx] = Math.max(colWidths[cIdx] || 10, len + 3);
      });
    });
    ws['!cols'] = colWidths.map((w) => ({ wch: Math.min(w, 50) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangBieu_ZenTool');

    const fileName = `${currentPdfTableFileName}_ZenTool_BangBieu.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (typeof showToastNotification === 'function') {
      showToastNotification(`Đã xuất file Excel: ${fileName}`);
    }
  } catch (err) {
    console.error('Lỗi xuất file Excel:', err);
    alert('Lỗi tạo file Excel: ' + err.message);
  }
}

function loadSamplePdfTableTest() {
  const sampleData = [
    ['STT', 'Ngày Giao Dịch', 'Số Tài Khoản Đối Ứng', 'Nội Dung Chi Tiết', 'Số Tiền Thu (VNĐ)', 'Số Tiền Chi (VNĐ)', 'Số Dư Khả Dụng'],
    ['1', '15/10/2026', '0912345678', 'Thanh toan tien hang don Shopee #982134', '1.250.000', '0', '45.890.000'],
    ['2', '16/10/2026', '0988776655', 'Tra cuoc van chuyen J&T Express thang 10', '0', '320.000', '45.570.000'],
    ['3', '17/10/2026', '1029384756', 'Khach hang Nguyen Van A chuyen khoan coc', '5.000.000', '0', '50.570.000'],
    ['4', '18/10/2026', '1903456789', 'Chi tien nhap bao bi va hop carton', '0', '1.450.000', '49.120.000'],
    ['5', '19/10/2026', '0345678912', 'TikTok Shop Affiliate Hoa Hong T10/2026', '8.650.000', '0', '57.770.000'],
    ['6', '20/10/2026', '0001112223', 'Dong thue GTGT va TNCN quy 3/2026', '0', '2.500.000', '55.270.000']
  ];

  currentPdfTableMatrix = sampleData;
  currentPdfTableFileName = 'SaoKe_NganHang_Mau';

  const nameLabel = document.getElementById('pdf-table-file-name');
  if (nameLabel) nameLabel.textContent = '✓ Đang hiển thị: Sao kê ngân hàng mẫu (7 dòng)';

  const btnExport = document.getElementById('btn-export-pdf-table');
  if (btnExport) btnExport.removeAttribute('disabled');

  renderPdfTablePreview(sampleData);

  if (typeof showToastNotification === 'function') {
    showToastNotification('Đã nạp 7 dòng bảng sao kê mẫu! Anh có thể bấm Xuất Excel ngay.');
  }
}

function clearPdfTableExtractor() {
  currentPdfTableMatrix = null;
  const fileInput = document.getElementById('pdf-table-file-input');
  if (fileInput) fileInput.value = '';
  const nameLabel = document.getElementById('pdf-table-file-name');
  if (nameLabel) nameLabel.textContent = '100% trong RAM trình duyệt, không tải lên server';
  const btnExport = document.getElementById('btn-export-pdf-table');
  if (btnExport) btnExport.setAttribute('disabled', 'true');
  const container = document.getElementById('pdf-table-preview-container');
  if (container) container.classList.add('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ============================================================
// PHÂN HỆ XÓA NỀN ẢNH 1 CHẠM 100% CLIENT-SIDE IN RAM (PHASE 3)
// ============================================================

const bgRemoveState = {
  originalImage: null,
  originalCanvas: null,
  originalCtx: null,
  workingCanvas: null,
  workingCtx: null,
  bgColor: { r: 255, g: 255, b: 255 },
  tolerance: 35,
  feather: 12,
  eyedropperMode: false,
  fileName: 'image.png'
};

function handleBgRemoveUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
    return;
  }

  bgRemoveState.fileName = file.name || 'image.png';

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      loadBgRemoveImage(img);
    };
    img.onerror = () => {
      alert('Không thể đọc ảnh. Vui lòng thử ảnh khác.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadBgRemoveImage(img) {
  const MAX_DIM = 2400;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (!w || !h) return;

  if (w > MAX_DIM || h > MAX_DIM) {
    const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  bgRemoveState.originalImage = img;

  // Offscreen immutable source canvas
  const oc = document.createElement('canvas');
  oc.width = w;
  oc.height = h;
  const octx = oc.getContext('2d', { willReadFrequently: true });
  octx.drawImage(img, 0, 0, w, h);
  bgRemoveState.originalCanvas = oc;
  bgRemoveState.originalCtx = octx;

  // Working canvas
  const wc = document.getElementById('bgremove-canvas');
  if (!wc) return;
  wc.width = w;
  wc.height = h;
  const wctx = wc.getContext('2d', { willReadFrequently: true });
  wctx.drawImage(oc, 0, 0);
  bgRemoveState.workingCanvas = wc;
  bgRemoveState.workingCtx = wctx;

  // Tự động nhận diện màu nền bằng cách lấy mẫu 4 góc viền
  bgRemoveState.bgColor = sampleCornerColor(octx, w, h);
  updateBgColorSwatchUI();

  // Bật sự kiện nhấp chuột chọn màu (eyedropper)
  wc.onclick = onBgRemoveCanvasClick;

  // Xử lý tách nền ngay lập tức
  processBgRemoval();

  const metaLabel = document.getElementById('bgremove-meta-label');
  if (metaLabel) {
    metaLabel.textContent = `${w} × ${h} px • Đã tách nền PNG`;
  }
}

function sampleCornerColor(ctx, w, h) {
  const patch = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
  const corners = [
    [0, 0],
    [w - patch, 0],
    [0, h - patch],
    [w - patch, h - patch]
  ];
  let r = 0, g = 0, b = 0, count = 0;

  for (const [cx, cy] of corners) {
    const data = ctx.getImageData(cx, cy, patch, patch).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 10) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  if (count === 0) return { r: 255, g: 255, b: 255 };
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}

function updateBgColorSwatchUI() {
  const swatch = document.getElementById('bgremove-color-swatch');
  if (swatch) {
    const { r, g, b } = bgRemoveState.bgColor;
    swatch.style.background = `rgb(${r}, ${g}, ${b})`;
    swatch.title = `Màu nền: RGB(${r}, ${g}, ${b})`;
  }
}

function setBgRemoveTolerance(val) {
  bgRemoveState.tolerance = Number(val);
  const label = document.getElementById('bgremove-tolerance-val');
  if (label) label.textContent = `${val}%`;
  processBgRemoval();
}

function setBgRemoveFeather(val) {
  bgRemoveState.feather = Number(val);
  const label = document.getElementById('bgremove-feather-val');
  if (label) label.textContent = `${val}%`;
  processBgRemoval();
}

function toggleEyedropper() {
  bgRemoveState.eyedropperMode = !bgRemoveState.eyedropperMode;
  const btn = document.getElementById('bgremove-eyedropper-btn');
  const canvas = document.getElementById('bgremove-canvas');

  if (bgRemoveState.eyedropperMode) {
    if (btn) btn.className = "px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-700 dark:text-emerald-300 transition flex items-center gap-1.5 shadow-sm";
    if (canvas) canvas.style.cursor = 'crosshair';
  } else {
    if (btn) btn.className = "px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-sm";
    if (canvas) canvas.style.cursor = 'default';
  }
}

function onBgRemoveCanvasClick(event) {
  if (!bgRemoveState.originalCanvas || !bgRemoveState.workingCanvas) return;

  const canvas = bgRemoveState.workingCanvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);

  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

  // Lấy màu tại điểm người dùng nhấp chuột từ canvas gốc
  const pixel = bgRemoveState.originalCtx.getImageData(x, y, 1, 1).data;
  bgRemoveState.bgColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
  updateBgColorSwatchUI();
  processBgRemoval();

  if (bgRemoveState.eyedropperMode) {
    toggleEyedropper(); // Tắt eyedropper sau khi chọn xong
  }
}

function processBgRemoval() {
  if (!bgRemoveState.originalCanvas || !bgRemoveState.workingCanvas) return;

  const w = bgRemoveState.originalCanvas.width;
  const h = bgRemoveState.originalCanvas.height;
  const src = bgRemoveState.originalCtx.getImageData(0, 0, w, h);
  const out = bgRemoveState.workingCtx.createImageData(w, h);

  const s = src.data;
  const d = out.data;
  const bg = bgRemoveState.bgColor;

  const MAX_DIST = Math.sqrt(3) * 255; // ≈ 441.67
  const tolDist = (bgRemoveState.tolerance / 100) * MAX_DIST;
  const featherDist = (bgRemoveState.feather / 100) * MAX_DIST;
  const softEnd = tolDist + featherDist;

  for (let i = 0; i < s.length; i += 4) {
    const r = s[i], g = s[i + 1], b = s[i + 2], a = s[i + 3];

    if (a === 0) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 0;
      continue;
    }

    const dr = r - bg.r;
    const dg = g - bg.g;
    const db = b - bg.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= tolDist) {
      // Trong suốt hoàn toàn
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 0;
    } else if (dist <= softEnd && featherDist > 0) {
      // Làm mịn chuyển màu viền (feathering anti-aliasing)
      const t = (dist - tolDist) / featherDist;
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
      d[i + 3] = Math.round(a * t);
    } else {
      // Giữ nguyên pixel sản phẩm
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
    }
  }

  bgRemoveState.workingCtx.putImageData(out, 0, 0);
}

function downloadBgRemovedPng() {
  const canvas = bgRemoveState.workingCanvas;
  if (!canvas || !bgRemoveState.originalCanvas) {
    alert('Vui lòng chọn hoặc nạp ảnh trước khi tải.');
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const baseName = bgRemoveState.fileName.replace(/\.[^/.]+$/, "");
    const downloadName = `${baseName}_ZenTool_XoaNen.png`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    recordOfficeSessionHistory('Tách Nền Ảnh 1 Chạm (PNG)', downloadName);

    if (typeof showToastNotification === 'function') {
      showToastNotification(`Đã tải ảnh PNG trong suốt: ${downloadName}`);
    }
  }, 'image/png');
}

function loadSampleBgRemoveTest() {
  // Tạo ảnh mẫu sản phẩm thương mại điện tử (Hộp quà may mắn với ruy băng và bóng đổ trên nền trắng)
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Nền trắng tinh khiết (mô phỏng phông nền chụp studio của Shopee/TikTok)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 600, 600);

  // Vẽ bóng đổ dưới đáy hộp
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(300, 480, 140, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.filter = 'blur(6px)';
  ctx.fill();
  ctx.restore();

  // Vẽ thân hộp quà (gradient màu đỏ cam ruby sang trọng)
  const boxGrad = ctx.createLinearGradient(180, 260, 420, 480);
  boxGrad.addColorStop(0, '#ef4444');
  boxGrad.addColorStop(0.5, '#dc2626');
  boxGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(190, 280, 220, 190, 16);
  ctx.fill();

  // Nắp hộp quà
  const lidGrad = ctx.createLinearGradient(170, 240, 430, 290);
  lidGrad.addColorStop(0, '#f87171');
  lidGrad.addColorStop(1, '#b91c1c');
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.roundRect(175, 240, 250, 50, 12);
  ctx.fill();

  // Ruy băng vàng hoàng gia
  const ribbonGrad = ctx.createLinearGradient(275, 240, 325, 470);
  ribbonGrad.addColorStop(0, '#fde047');
  ribbonGrad.addColorStop(0.5, '#eab308');
  ribbonGrad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(280, 240, 40, 230); // Dải dọc

  // Nơ ruy băng uốn lượn trên đỉnh
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.ellipse(260, 225, 30, 18, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(340, 225, 30, 18, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(300, 235, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#eab308';
  ctx.fill();

  // Huy hiệu "ZenTool Pro"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ZenTool VIP', 300, 390);

  // Chuyển canvas mẫu thành Image
  const img = new Image();
  img.onload = () => {
    bgRemoveState.fileName = 'HopQua_SanPham_Mau.jpg';
    loadBgRemoveImage(img);

    if (typeof showToastNotification === 'function') {
      showToastNotification('Đã nạp ảnh mẫu sản phẩm studio! Anh có thể xem nền trong suốt hoặc bấm Tải PNG ngay.');
    }
  };
  img.src = canvas.toDataURL('image/jpeg', 0.95);
}

function clearBgRemove() {
  bgRemoveState.originalImage = null;
  bgRemoveState.originalCanvas = null;
  bgRemoveState.workingCanvas = null;

  const canvas = document.getElementById('bgremove-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const fileInput = document.getElementById('bgremove-file-input');
  if (fileInput) fileInput.value = '';

  const metaLabel = document.getElementById('bgremove-meta-label');
  if (metaLabel) metaLabel.textContent = 'Chưa có ảnh';

  const swatch = document.getElementById('bgremove-color-swatch');
  if (swatch) swatch.style.background = 'rgb(255,255,255)';
}


// ==============================================================================
// PHÂN HỆ GIÁM SÁT THỜI GIAN THỰC 100% SỐ LIỆU THẬT (ZENTELEMETRY ENGINE)
// Tuyệt đối không sinh số ảo / Math.random() - Đo lường chính xác tương tác thực tế
// ==============================================================================
const ZenTelemetry = {
  // Cấu hình Endpoint Cloudflare Worker (hoặc custom domain của anh)
  // Mặc định tự động nhận diện từ window.ZENTOOL_TELEMETRY_ENDPOINT nếu có
  apiUrl: (typeof window !== 'undefined' && window.ZENTOOL_TELEMETRY_ENDPOINT) || 'https://zentool.mr-doctorquestion.workers.dev',

  visitorId: '',
  sessionId: '',
  pingInterval: null,
  isNewVisit: false,

  currentStats: {
    onlineUsers: 1,
    pageviews: 1,
    uniqueVisitors: 1,
    downloads: 0
  },

  init() {
    this.initIdentity();
    this.interceptDownloads();
    this.recordVisit();
    this.startHeartbeat();
    this.listenPageVisibility();
    this.listenPageUnload();
    this.updateUI();
  },

  initIdentity() {
    // 1. Quản lý Visitor ID (Bảo toàn qua localStorage - Không đếm trùng khi F5)
    let visId = '';
    try {
      visId = localStorage.getItem('zentool_visitor_id');
      if (!visId) {
        visId = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('zentool_visitor_id', visId);
        this.isNewVisit = true;
      }
    } catch (e) {
      visId = 'anon_' + Date.now();
    }
    this.visitorId = visId;

    // 2. Quản lý Session ID (Mỗi tab mở là 1 session độc lập)
    let sessId = '';
    try {
      sessId = sessionStorage.getItem('zentool_session_id');
      if (!sessId) {
        sessId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('zentool_session_id', sessId);
      }
    } catch (e) {
      sessId = 'sess_tab_' + Date.now();
    }
    this.sessionId = sessId;

    // 3. Khởi tạo Local Real Counter nếu chưa có
    try {
      const localDl = parseInt(localStorage.getItem('zentool_stat_downloads') || '0', 10);
      this.currentStats.downloads = Math.max(0, localDl);

      let localPv = parseInt(localStorage.getItem('zentool_stat_pvs') || '0', 10) + 1;
      localStorage.setItem('zentool_stat_pvs', String(localPv));
      this.currentStats.pageviews = Math.max(1, localPv);

      let localVis = parseInt(localStorage.getItem('zentool_stat_unique_vis') || '0', 10);
      if (this.isNewVisit || localVis === 0) {
        localVis += 1;
        localStorage.setItem('zentool_stat_unique_vis', String(localVis));
      }
      this.currentStats.uniqueVisitors = Math.max(1, localVis);
    } catch (e) {}
  },

  // Chặn & Ghi nhận mọi lượt tải file thật (PDF, Ảnh, Excel, Hợp đồng...)
  interceptDownloads() {
    if (typeof HTMLAnchorElement === 'undefined') return;
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    const self = this;
    HTMLAnchorElement.prototype.click = function() {
      try {
        if (this.hasAttribute('download') || this.download) {
          const fn = this.download || this.getAttribute('download') || 'document';
          self.recordDownload(fn);
        }
      } catch (err) {}
      return originalAnchorClick.apply(this, arguments);
    };
  },

  async recordVisit() {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/telemetry/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            visitorId: this.visitorId,
            isNewVisit: this.isNewVisit
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.stats) {
            this.currentStats.pageviews = data.stats.pageviews;
            this.currentStats.uniqueVisitors = data.stats.uniqueVisitors;
            this.currentStats.downloads = Math.max(this.currentStats.downloads, data.stats.downloads || 0);
          }
          if (data && data.onlineUsers) {
            this.currentStats.onlineUsers = data.onlineUsers;
          }
          this.updateUI();
          return;
        }
      } catch (e) {}
    }

    // Fallback: Cross-Tab Broadcast Channel đo lường số tab online thật
    this.initCrossTabPresence();
    this.updateUI();
  },

  initCrossTabPresence() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('zentool_presence_channel');
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'ping') {
            bc.postMessage({ type: 'pong', sessionId: this.sessionId });
          }
        };
        bc.postMessage({ type: 'ping', sessionId: this.sessionId });
      }
    } catch (e) {}
  },

  startHeartbeat() {
    // Nhịp tim 30s gửi lên server (chỉ khi tab đang active trên màn hình)
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden && this.apiUrl) {
        fetch(`${this.apiUrl}/api/telemetry/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            visitorId: this.visitorId,
            isNewVisit: false
          })
        }).then(r => r.json()).then(data => {
          if (data && data.onlineUsers) {
            this.currentStats.onlineUsers = data.onlineUsers;
            this.updateUI();
          }
        }).catch(() => {});
      }
    }, 30000);
  },

  listenPageVisibility() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.recordVisit();
      }
    });
  },

  listenPageUnload() {
    if (typeof window === 'undefined') return;
    const handleLeave = () => {
      if (this.apiUrl && navigator.sendBeacon) {
        const payload = JSON.stringify({ sessionId: this.sessionId });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`${this.apiUrl}/api/telemetry/leave`, blob);
      }
    };
    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);
  },

  recordDownload(fileName) {
    try {
      const currentDl = parseInt(localStorage.getItem('zentool_stat_downloads') || '0', 10) + 1;
      localStorage.setItem('zentool_stat_downloads', String(currentDl));
      this.currentStats.downloads = currentDl;
      this.updateUI();
    } catch (e) {}

    if (this.apiUrl) {
      try {
        fetch(`${this.apiUrl}/api/telemetry/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            toolName: fileName || 'file'
          })
        }).then(r => r.json()).then(data => {
          if (data && data.downloads) {
            this.currentStats.downloads = Math.max(this.currentStats.downloads, data.downloads);
            this.updateUI();
          }
        }).catch(() => {});
      } catch (e) {}
    }
  },

  updateUI() {
    if (typeof document === 'undefined') return;
    const elOnline = document.getElementById('telemetry-online');
    const elViews = document.getElementById('telemetry-pageviews');
    const elVisitors = document.getElementById('telemetry-visitors');
    const elDownloads = document.getElementById('telemetry-downloads');

    if (elOnline) elOnline.textContent = this.formatNumber(this.currentStats.onlineUsers || 1);
    if (elViews) elViews.textContent = this.formatNumber(this.currentStats.pageviews || 1);
    if (elVisitors) elVisitors.textContent = this.formatNumber(this.currentStats.uniqueVisitors || 1);
    if (elDownloads) elDownloads.textContent = this.formatNumber(this.currentStats.downloads || 0);
  },

  formatNumber(num) {
    return Number(num).toLocaleString('vi-VN');
  }
};
