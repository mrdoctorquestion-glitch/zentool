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
  initTheme();
  initCategorySelect();
  calculateDetailedProfit();
  initCompressSample();
});

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

  // Reset toàn bộ file đang chọn trên cả 6 công cụ
  clearAllPdfMerge();
  clearSplitPdf();
  clearRotatePdf();
  clearWatermarkPdf();
  clearAllImagesForPdf();
  clearFontConverter();

  showToast('🧹 Đã xóa sạch lịch sử phiên làm việc và giải phóng toàn bộ bộ nhớ RAM!');
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

    for (const file of selectedImagesForPdf) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      if (file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else {
        image = await pdfDoc.embedPng(arrayBuffer);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anh_Sang_PDF_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    logOfficeAction('Ảnh sang PDF', `Đã chuyển đổi thành công ${selectedImagesForPdf.length} hình ảnh sang file PDF`);
    showToast(`🎉 Chuyển ${selectedImagesForPdf.length} ảnh sang PDF thành công! Đã lưu về máy.`);
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

// 5. Đóng Dấu Bản Quyền / Watermark PDF (Kế thừa từ CIT-PDF, hỗ trợ xóa file chọn nhầm)
let selectedPdfForWatermark = null;
function handlePdfForWatermark(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedPdfForWatermark = file;
  document.getElementById('wm-file-name').textContent = file.name;
  document.getElementById('wm-controls').classList.remove('hidden');
  event.target.value = '';
}

function clearWatermarkPdf() {
  selectedPdfForWatermark = null;
  const controls = document.getElementById('wm-controls');
  if (controls) controls.classList.add('hidden');
  const input = document.getElementById('pdf-wm-input');
  if (input) input.value = '';
}

// Tạo ảnh Watermark chữ chìm hỗ trợ 100% tiếng Việt có dấu (Unicode) bằng Canvas
function createWatermarkPng(text) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const size = 1000;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-45 * Math.PI / 180); // Xoay chéo 45 độ từ góc dưới trái lên góc trên phải

      let fontSize = 92;
      ctx.font = `900 ${fontSize}px "Segoe UI", Arial, "Helvetica Neue", sans-serif`;
      const metrics = ctx.measureText(text);
      if (metrics.width > 800) {
        fontSize = Math.max(26, Math.floor(fontSize * (800 / metrics.width)));
        ctx.font = `900 ${fontSize}px "Segoe UI", Arial, "Helvetica Neue", sans-serif`;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Màu chữ mờ xám chống sao chép tài liệu
      ctx.fillStyle = 'rgba(170, 170, 170, 0.38)';
      ctx.fillText(text, 0, 0);

      // Viền nét mảnh nhẹ tạo độ tương phản trên các trang tài liệu có nền
      ctx.strokeStyle = 'rgba(130, 130, 130, 0.25)';
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
    alert('Vui lòng chọn file PDF để đóng dấu.');
    return;
  }
  const isReady = await ensurePdfLib();
  if (!isReady) {
    alert('Thư viện PDF-Lib chưa sẵn sàng. Anh vui lòng tải lại trang (F5).');
    return;
  }
  const text = document.getElementById('wm-text-input').value.trim() || 'BẢN SAO NỘI BỘ';
  try {
    const arrayBuffer = await selectedPdfForWatermark.arrayBuffer();
    const doc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = doc.getPages();
    
    // Tạo ảnh watermark PNG hỗ trợ trọn vẹn tiếng Việt có dấu
    const pngBuffer = await createWatermarkPng(text);
    const watermarkImage = await doc.embedPng(pngBuffer);
    
    pages.forEach(p => {
      const { width, height } = p.getSize();
      const wmDim = Math.min(width, height) * 0.85;
      p.drawImage(watermarkImage, {
        x: (width - wmDim) / 2,
        y: (height - wmDim) / 2,
        width: wmDim,
        height: wmDim,
        opacity: 0.85,
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
    
    logOfficeAction('Watermark', `Đã chèn watermark tiếng Việt "${text}" vào tệp "${selectedPdfForWatermark.name}"`);
    showToast(`🎉 Đã đóng dấu watermark "${text}" thành công!`);
  } catch (err) {
    console.error(err);
    alert('Lỗi đóng dấu: ' + err.message);
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
  document.getElementById('kpi-net-margin').textContent = `Biên lãi ròng: ${netMargin.toFixed(1)}%`;
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
  const btnHeic = document.getElementById('media-subtab-heic');
  const btnCompress = document.getElementById('media-subtab-compress');

  if (subTab === 'heic') {
    if (heicView) heicView.classList.remove('hidden');
    if (compressView) compressView.classList.add('hidden');
    if (btnHeic) {
      btnHeic.className = "px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm";
    }
    if (btnCompress) {
      btnCompress.className = "px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900";
    }
  } else {
    if (heicView) heicView.classList.add('hidden');
    if (compressView) compressView.classList.remove('hidden');
    if (btnCompress) {
      btnCompress.className = "px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm";
    }
    if (btnHeic) {
      btnHeic.className = "px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900";
    }
  }
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
