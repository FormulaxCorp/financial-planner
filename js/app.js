/* ============================================
   Our Financial Planner - App Controller
   ============================================ */

(function() {
  'use strict';

  // ===== AUTH (Supabase Auth) =====
    function setupAuth() {
      const loginScreen = document.getElementById('login-screen');
      const loginBtn = document.getElementById('loginBtn');
      const loginEmail = document.getElementById('loginEmail');
      const loginPassword = document.getElementById('loginPassword');
      const loginError = document.getElementById('loginError');

      // Initialize auth and check session
      Auth.init().then(function(user) {
        if (user) {
          loginScreen.classList.add('hidden');
          loadAppData();
        } else {
          loginScreen.classList.remove('hidden');
        }
      });

      // Login button click
      loginBtn.addEventListener('click', async () => {
        const email = loginEmail.value;
        const password = loginPassword.value;

        if (!email || !password) {
          loginError.textContent = 'Email dan password harus diisi!';
          return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Loading...';
        loginError.textContent = '';

        const result = await Auth.login(email, password);
      
        if (result.success) {
          loginScreen.classList.add('hidden');
          loadAppData();
        } else {
          loginError.textContent = result.message;
        }

        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk';
      });

      // Enter key to submit
      loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
      });

      // Logout button
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await Auth.logout();
          loginScreen.classList.remove('hidden');
          loginEmail.value = '';
          loginPassword.value = '';
          loginError.textContent = '';
        });
      }
    }

    // Load app data after auth
    async function loadAppData() {
      try {
        if (typeof SupabaseData !== 'undefined') {
          await SupabaseData.loadAllData();
        }
        if (typeof renderAll === 'function') {
          renderAll();
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }

    // Run auth setup
    setupAuth();

    // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const Dom = {
    splash: '#splash-screen',
    app: '#app',
    sidebar: '#sidebar',
    overlay: '#overlay',
    menuBtn: '#menuBtn',
    sidebarClose: '#sidebarClose',
    navLinks: '.sidebar-menu a',
    bottomNav: '#bottomNav',
    bottomLinks: '#bottomNav a',
    pages: '.page',
    refreshBtn: '#refreshBtn',

    // Dashboard
    totalKas: '#totalKas',
    totalIncome: '#totalIncome',
    totalExpense: '#totalExpense',
    totalSisa: '#totalSisa',
    fundsGrid: '#fundsGrid',
    dashboardBudgetBody: '#dashboardBudgetBody',

    // Transactions
    transBody: '#transBody',
    transSearch: '#transSearch',
    transFilterJenis: '#transFilterJenis',
    transFilterKategori: '#transFilterKategori',
    transFooter: '#transFooter',
    addTransBtn: '#addTransBtn',

    // Budget
    budgetIncomeBody: '#budgetIncomeBody',
    budgetExpenseBody: '#budgetExpenseBody',

    // Report
    reportSummary: '#reportSummary',
    reportOverBudgetBody: '#reportOverBudgetBody',

    // Funds
    fundsBody: '#fundsBody',

    // Guide
    guideFormat: '#guideFormat',
    guideIncomeKategori: '#guideIncomeKategori',
    guideExpenseKategori: '#guideExpenseKategori',

    // Modal transaksi
    transModal: '#transModal',
    modalTitle: '#modalTitle',
    modalClose: '#modalClose',
    modalCancel: '#modalCancel',
    modalSave: '#modalSave',
    formTanggal: '#formTanggal',
    formJenis: '#formJenis',
    formKategori: '#formKategori',
    formKeterangan: '#formKeterangan',
    formNominal: '#formNominal',
    formPosAsal: '#formPosAsal',
    formPosTujuan: '#formPosTujuan',
    formPosTujuanGroup: '#formPosTujuanGroup',
    formInput: '#formInput',
    formOleh: '#formOleh',

    // Modal kategori
    catModal: '#catModal',
    catModalTitle: '#catModalTitle',
    catModalClose: '#catModalClose',
    catModalCancel: '#catModalCancel',
    catModalSave: '#catModalSave',
    catType: '#catType',
    catName: '#catName',
    catPic: '#catPic',
    catPicGroup: '#catPicGroup',
    catPrio: '#catPrio',
    catPrioGroup: '#catPrioGroup',

    // Modal pos uang
    fundModal: '#fundModal',
    fundModalTitle: '#fundModalTitle',
    fundModalClose: '#fundModalClose',
    fundModalCancel: '#fundModalCancel',
    fundModalSave: '#fundModalSave',
    fundId: '#fundId',
    fundName: '#fundName',
    fundDesc: '#fundDesc',
    fundTarget: '#fundTarget',

    addCatBtn: '#addCatBtn',
    addFundBtn: '#addFundBtn',

    // Transfer
    transferModal: '#transferModal',
    transferBtn: '#transferBtn',
    transferTanggal: '#transferTanggal',
    transferDari: '#transferDari',
    transferKe: '#transferKe',
    transferNominal: '#transferNominal',
    transferKeterangan: '#transferKeterangan',
    transferOleh: '#transferOleh',
    transferSaldoDari: '#transferSaldoDari',
    transferSaldoKe: '#transferSaldoKe',

    // Stock
    stockModal: '#stockModal',
    stockModalTitle: '#stockModalTitle',
    stockModalClose: '#stockModalClose',
    stockModalCancel: '#stockModalCancel',
    stockModalSave: '#stockModalSave',
    stockName: '#stockName',
    stockKebutuhan: '#stockKebutuhan',
    stockSisa: '#stockSisa',
    stockSatuan: '#stockSatuan',
    stockCatatan: '#stockCatatan',
    stockKategori: '#stockKategori',
    stockFilterKategori: '#stockFilterKategori',
    addStockBtn: '#addStockBtn',
    stockBody: '#stockBody',
    stockSummary: '#stockSummary',
    stockFooter: '#stockFooter',

    // Shopping
    shoppingStats: '#shoppingStats',
    shoppingList: '#shoppingList',
    shoppingInput: '#shoppingInput',
    shoppingCatatan: '#shoppingCatatan',
    addShoppingBtn: '#addShoppingBtn',
    resetShoppingBtn: '#resetShoppingBtn',
    shoppingFooter: '#shoppingFooter',
  };

  // ===== STATE =====
  let editId = null;

  // ===== INIT =====
  function init() {
    setTimeout(() => {
      const splash = $(Dom.splash);
      const app = $(Dom.app);
      if (splash) splash.classList.add('hidden');
      if (app) app.classList.add('visible');
    }, 800);

    setupNavigation();
    setupEventListeners();
    setupForm();
    renderAll();
    registerSW();
  }

  function registerSW() {
    // Service worker removed - no longer needed
  }

  // ===== NAVIGATION =====
  function setupNavigation() {
    $$(Dom.navLinks).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
        closeSidebar();
      });
    });
    $$(Dom.bottomLinks).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });
  }

  function navigateTo(page) {
    $$(Dom.pages).forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    $$(Dom.navLinks).forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });
    $$(Dom.bottomLinks).forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });
  }

  function openSidebar() {
    $(Dom.sidebar).classList.add('open');
    $(Dom.overlay).classList.add('open');
  }

  function closeSidebar() {
    $(Dom.sidebar).classList.remove('open');
    $(Dom.overlay).classList.remove('open');
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    byId('menuBtn').addEventListener('click', openSidebar);
    byId('sidebarClose').addEventListener('click', closeSidebar);
    byId('overlay').addEventListener('click', closeSidebar);

    byId('refreshBtn').addEventListener('click', () => {
      renderAll();
      byId('refreshBtn').classList.add('fa-spin');
      setTimeout(() => byId('refreshBtn').classList.remove('fa-spin'), 600);
    });

    // Logout button
    byId('logoutBtn').addEventListener('click', async () => {
      if (confirm('Yakin mau logout?')) {
        await Auth.logout();
        window.location.reload();
      }
    });

    byId('transSearch').addEventListener('input', renderTransactions);
    byId('transFilterJenis').addEventListener('change', renderTransactions);
    byId('transFilterKategori').addEventListener('change', renderTransactions);

    byId('addTransBtn').addEventListener('click', () => openModal());

    byId('modalClose').addEventListener('click', closeModal);
    byId('modalCancel').addEventListener('click', closeModal);
    byId('modalSave').addEventListener('click', saveTransaction);

    byId('formJenis').addEventListener('change', () => {
      const jenis = byId('formJenis').value;
      byId('formPosTujuanGroup').style.display = jenis === 'Pindah' ? 'block' : 'none';
      updateKategoriOptions();
    });

    byId('addCatBtn').addEventListener('click', () => openCatModal());
    byId('catModalClose').addEventListener('click', closeCatModal);
    byId('catModalCancel').addEventListener('click', closeCatModal);
    byId('catModalSave').addEventListener('click', saveCategory);
    byId('catType').addEventListener('change', toggleCatType);

    byId('addFundBtn').addEventListener('click', () => openFundModal());
    byId('fundModalClose').addEventListener('click', closeFundModal);
    byId('fundModalCancel').addEventListener('click', closeFundModal);
    byId('fundModalSave').addEventListener('click', saveFund);

    // Transfer
    byId('transferBtn').addEventListener('click', () => openTransferModal());
    byId('transferModalClose').addEventListener('click', closeTransferModal);
    byId('transferCancel').addEventListener('click', closeTransferModal);
    byId('transferSave').addEventListener('click', saveTransfer);
    byId('transferDari').addEventListener('change', updateTransferSaldo);
    byId('transferKe').addEventListener('change', updateTransferSaldo);

    // Stock
    byId('addStockBtn').addEventListener('click', () => openStockModal());
    byId('stockModalClose').addEventListener('click', closeStockModal);
    byId('stockModalCancel').addEventListener('click', closeStockModal);
    byId('stockModalSave').addEventListener('click', saveStock);
    byId('stockFilterKategori').addEventListener('change', renderStock);

    // Shopping
    byId('addShoppingBtn').addEventListener('click', addShoppingItem);
    byId('shoppingInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addShoppingItem();
    });
    byId('resetShoppingBtn').addEventListener('click', resetShopping);
  }

  function byId(id) {
    const el = document.getElementById(id);
    if (!el) console.warn('Element #' + id + ' not found');
    return el;
  }

  function toggleCatType() {
    const type = byId('catType').value;
    byId('catPicGroup').style.display = type === 'expense' ? 'block' : 'none';
    byId('catPrioGroup').style.display = type === 'expense' ? 'block' : 'none';
  }

  // ===== FORM SETUP =====
  function setupForm() {
    const today = new Date().toISOString().split('T')[0];
    byId('formTanggal').value = today;
    updateKategoriOptions();
    refreshFormPosOptions();

    const filter = byId('transFilterKategori');
    if (filter) {
      filter.innerHTML = '<option value="">Semua Kategori</option>';
      try {
        AppData.getExpenseCategories().forEach(c => {
          filter.innerHTML += '<option value="' + c + '">' + c + '</option>';
        });
      } catch(e) { console.warn('Filter setup error:', e); }
    }
  }

  function updateKategoriOptions() {
    const jenis = byId('formJenis').value;
    const sel = byId('formKategori');
    if (!sel) return;
    sel.innerHTML = '';
    let cats = [];
    try {
      if (jenis === 'Masuk') cats = AppData.getIncomeCategories();
      else if (jenis === 'Keluar') cats = AppData.getExpenseCategories();
      else cats = ['Transfer Dana', 'Nabung', 'Pindah Dana'];
    } catch(e) { cats = []; }
    cats.forEach(c => {
      sel.innerHTML += '<option value="' + c + '">' + c + '</option>';
    });
    if (jenis !== 'Pindah') {
      sel.innerHTML += '<option value="">— Lainnya —</option>';
    }
  }

  function refreshFormPosOptions() {
    let funds = [];
    try { funds = AppData.getFunds(); } catch(e) { funds = []; }
    const selIds = ['formPosAsal', 'formPosTujuan'];
    selIds.forEach(id => {
      const el = byId(id);
      if (!el) return;
      const currentVal = el.value;
      el.innerHTML = '';
      funds.forEach(f => {
        const label = f.name + ' (' + AppData.formatRp(f.balance || 0) + ')';
        el.innerHTML += '<option value="' + f.id + '">' + label + '</option>';
      });
      // Restore previous selection if still valid
      if (currentVal && funds.some(f => f.id === currentVal)) {
        el.value = currentVal;
      }
    });
  }

  // ===== TRANSACTION MODAL =====
  function openModal(trans) {
    const isEditing = !!trans;
    byId('modalTitle').textContent = isEditing ? 'Edit Transaksi' : 'Tambah Transaksi';

    // Always refresh pos options first
    refreshFormPosOptions();

    if (isEditing) {
      editId = trans.id;
      byId('formTanggal').value = trans.tanggal || '';
      byId('formJenis').value = trans.jenis || 'Keluar';
      byId('formKeterangan').value = trans.keterangan || '';
      byId('formNominal').value = trans.nominal || '';
      try { byId('formPosAsal').value = trans.posAsal || 'Blu'; } catch(e) {}
      try { byId('formPosTujuan').value = trans.posTujuan || ''; } catch(e) {}
      byId('formInput').value = trans.input || 'Manual';
      byId('formOleh').value = trans.oleh || 'Vina';
      updateKategoriOptions();
      try { byId('formKategori').value = trans.kategori || ''; } catch(e) {}
      byId('formPosTujuanGroup').style.display = trans.jenis === 'Pindah' ? 'block' : 'none';
    } else {
      editId = null;
      byId('formTanggal').value = new Date().toISOString().split('T')[0];
      byId('formJenis').value = 'Keluar';
      byId('formKeterangan').value = '';
      byId('formNominal').value = '';
      try { byId('formPosAsal').value = 'Blu'; } catch(e) {}
      try { byId('formPosTujuan').value = 'Comfort Life'; } catch(e) {}
      byId('formInput').value = 'Manual';
      byId('formOleh').value = 'Vina';
      updateKategoriOptions();
      byId('formPosTujuanGroup').style.display = 'none';
    }
    byId('transModal').classList.add('open');
  }

  function closeModal() {
    byId('transModal').classList.remove('open');
    editId = null;
  }

  function saveTransaction() {
    const tanggal = byId('formTanggal').value;
    const jenis = byId('formJenis').value;
    const kategori = byId('formKategori').value;
    const keterangan = byId('formKeterangan').value.trim();
    const nominal = parseFloat(byId('formNominal').value) || 0;
    let posAsal = 'Blu', posTujuan = '';
    try { posAsal = byId('formPosAsal').value; } catch(e) {}
    try { posTujuan = byId('formPosTujuan').value; } catch(e) {}
    const input = byId('formInput').value;
    const oleh = byId('formOleh').value;

    if (!tanggal) { alert('Tanggal harus diisi!'); return; }
    if (nominal <= 0) { alert('Nominal harus lebih dari 0!'); return; }

    const transData = { tanggal, jenis, kategori, keterangan, nominal, posAsal, posTujuan, input, oleh };

    try {
      if (editId) {
        AppData.updateTransaction(editId, transData);
      } else {
        AppData.addTransaction(transData);
      }
    } catch(e) {
      alert('Gagal menyimpan: ' + e.message);
      return;
    }

    closeModal();
    renderAll();
  }

  // ===== CATEGORY MODAL =====
  function openCatModal() {
    byId('catModalTitle').textContent = 'Tambah Kategori Baru';
    byId('catType').value = 'expense';
    byId('catName').value = '';
    try { byId('catPic').value = 'Vina/Henry'; } catch(e) {}
    try { byId('catPrio').value = 'Boleh'; } catch(e) {}
    toggleCatType();
    byId('catModal').classList.add('open');
  }

  function closeCatModal() {
    byId('catModal').classList.remove('open');
  }

  function saveCategory() {
    const type = byId('catType').value;
    const name = byId('catName').value.trim();
    if (!name) { alert('Nama kategori harus diisi!'); return; }

    try {
      if (type === 'income') {
        if (AppData.getIncomeCategories().includes(name)) {
          alert('Kategori sudah ada!'); return;
        }
        AppData.addIncomeCategory(name);
      } else {
        if (AppData.getExpenseCategories().includes(name)) {
          alert('Kategori sudah ada!'); return;
        }
        const pic = byId('catPic').value;
        const prio = byId('catPrio').value;
        AppData.addExpenseCategory(name, pic, prio);
      }
    } catch(e) {
      alert('Gagal: ' + e.message);
      return;
    }

    closeCatModal();
    setupForm();
    renderAll();
    alert('Kategori "' + name + '" berhasil ditambahkan!');
  }

  // ===== FUND MODAL =====
  function openFundModal() {
    byId('fundModalTitle').textContent = 'Tambah Pos Uang Baru';
    byId('fundId').value = '';
    byId('fundName').value = '';
    byId('fundDesc').value = '';
    byId('fundTarget').value = '';
    byId('fundModal').classList.add('open');
  }

  function closeFundModal() {
    byId('fundModal').classList.remove('open');
  }

  function saveFund() {
    const id = byId('fundId').value.trim();
    const name = byId('fundName').value.trim() || id;
    const desc = byId('fundDesc').value.trim();
    const target = byId('fundTarget').value.trim();
    if (!id) { alert('Nama pos uang harus diisi!'); return; }

    try {
      if (AppData.getFunds().some(f => f.id === id)) {
        alert('Pos uang "' + id + '" sudah ada!'); return;
      }
      AppData.addFund(id, name, desc, target);
    } catch(e) {
      alert('Gagal: ' + e.message);
      return;
    }

    closeFundModal();
    refreshFormPosOptions();
    renderAll();
  }

  // ===== TRANSFER MODAL =====
  function openTransferModal() {
    byId('transferTanggal').value = new Date().toISOString().split('T')[0];
    byId('transferNominal').value = '';
    byId('transferKeterangan').value = '';
    byId('transferOleh').value = 'Vina';

    // Populate dropdowns
    let funds = [];
    try { funds = AppData.getFunds(); } catch(e) { funds = []; }

    const dariSel = byId('transferDari');
    const keSel = byId('transferKe');
    dariSel.innerHTML = '';
    keSel.innerHTML = '';

    funds.forEach(f => {
      dariSel.innerHTML += '<option value="' + f.id + '">' + f.name + ' (' + AppData.formatRp(f.balance || 0) + ')</option>';
      keSel.innerHTML += '<option value="' + f.id + '">' + f.name + ' (' + AppData.formatRp(f.balance || 0) + ')</option>';
    });

    // Default: pos pertama → pos kedua (jika ada minimal 2)
    if (funds.length >= 2) {
      dariSel.value = funds[0].id;
      keSel.value = funds[1].id;
    }

    updateTransferSaldo();
    byId('transferModal').classList.add('open');
  }

  function closeTransferModal() {
    byId('transferModal').classList.remove('open');
  }

  function updateTransferSaldo() {
    let funds = [];
    try { funds = AppData.getFunds(); } catch(e) { funds = []; }

    const dariId = byId('transferDari').value;
    const keId = byId('transferKe').value;

    const dariFund = funds.find(f => f.id === dariId);
    const keFund = funds.find(f => f.id === keId);

    byId('transferSaldoDari').textContent = 'Saldo: ' + AppData.formatRp(dariFund ? (dariFund.balance || 0) : 0);
    byId('transferSaldoKe').textContent = 'Saldo: ' + AppData.formatRp(keFund ? (keFund.balance || 0) : 0);
  }

  function saveTransfer() {
    const tanggal = byId('transferTanggal').value;
    const posAsal = byId('transferDari').value;
    const posTujuan = byId('transferKe').value;
    const nominal = parseFloat(byId('transferNominal').value) || 0;
    const keterangan = byId('transferKeterangan').value.trim() || ('Transfer ' + posAsal + ' → ' + posTujuan);
    const oleh = byId('transferOleh').value;

    // Validasi
    if (!tanggal) { alert('Tanggal harus diisi!'); return; }
    if (posAsal === posTujuan) { alert('Pos asal dan tujuan tidak boleh sama!'); return; }
    if (nominal <= 0) { alert('Nominal harus lebih dari 0!'); return; }

    // Cek saldo cukup
    let funds = [];
    try { funds = AppData.getFunds(); } catch(e) { funds = []; }
    const dariFund = funds.find(f => f.id === posAsal);
    if (dariFund && (dariFund.balance || 0) < nominal) {
      if (!confirm('Saldo ' + posAsal + ' tidak cukup (' + AppData.formatRp(dariFund.balance || 0) + '). Tetap transfer?')) {
        return;
      }
    }

    const transData = {
      tanggal: tanggal,
      jenis: 'Pindah',
      kategori: 'Transfer Dana',
      keterangan: keterangan,
      nominal: nominal,
      posAsal: posAsal,
      posTujuan: posTujuan,
      input: 'Manual',
      oleh: oleh
    };

    try {
      AppData.addTransaction(transData);
    } catch(e) {
      alert('Gagal transfer: ' + e.message);
      return;
    }

    closeTransferModal();
    renderAll();
    alert('Transfer berhasil! ' + posAsal + ' → ' + posTujuan + ': ' + AppData.formatRp(nominal));
  }

  // ===== STOCK MODAL =====
  let editStockId = null;

  function openStockModal(item) {
    editStockId = item ? item.id : null;
    byId('stockModalTitle').innerHTML = '<i class="fas fa-box"></i> ' + (item ? 'Edit Stock' : 'Tambah Stock');
    byId('stockName').value = item ? item.name : '';
    byId('stockKebutuhan').value = item ? item.kebutuhan : '';
    byId('stockSisa').value = item ? (item.sisa !== undefined ? item.sisa : '') : '';
    byId('stockSatuan').value = item ? (item.satuan || 'pcs') : 'pcs';
    byId('stockKategori').value = item ? (item.kategori || 'Groceries') : 'Groceries';
    byId('stockCatatan').value = item ? (item.catatan || '') : '';
    byId('stockModal').classList.add('open');
  }

  function closeStockModal() {
    byId('stockModal').classList.remove('open');
    editStockId = null;
  }

  function saveStock() {
    const name = byId('stockName').value.trim();
    const kebutuhan = parseFloat(byId('stockKebutuhan').value) || 0;
    const sisa = parseFloat(byId('stockSisa').value) || 0;
    const satuan = byId('stockSatuan').value;
    const kategori = byId('stockKategori').value;
    const catatan = byId('stockCatatan').value.trim();

    if (!name) { alert('Nama barang harus diisi!'); return; }
    if (kebutuhan <= 0) { alert('Kebutuhan per bulan harus lebih dari 0!'); return; }

    const itemData = { name, kebutuhan, sisa, satuan, kategori, catatan };

    try {
      if (editStockId) {
        AppData.updateStockItem(editStockId, itemData);
      } else {
        AppData.addStockItem(itemData);
      }
    } catch(e) {
      alert('Gagal menyimpan: ' + e.message);
      return;
    }

    closeStockModal();
    renderAll();
  }

  function deleteStock(id, name) {
    if (!confirm('Hapus "' + name + '" dari daftar stock?')) return;
    try {
      AppData.deleteStockItem(id);
    } catch(e) {
      alert('Gagal menghapus: ' + e.message);
      return;
    }
    renderAll();
  }

  // --- RENDER STOCK ---
  function renderStock() {
    let items = [];
    try { items = AppData.getStockItems(); } catch(e) {}

    // Apply category filter
    const filterKategori = byId('stockFilterKategori').value;
    if (filterKategori) {
      items = items.filter(i => i.kategori === filterKategori);
    }

    const summary = byId('stockSummary');
    if (summary) {
      let habis = 0, hampirHabis = 0, aman = 0;
      items.forEach(item => {
        const ratio = item.kebutuhan > 0 ? item.sisa / item.kebutuhan : 0;
        if (ratio <= 0) habis++;
        else if (ratio < 0.3) hampirHabis++;
        else aman++;
      });
      summary.innerHTML =
        '<div class="stock-stat"><div class="stock-stat-num" style="color:var(--negative)">' + habis + '</div><div class="stock-stat-label">Habis</div></div>' +
        '<div class="stock-stat"><div class="stock-stat-num" style="color:var(--warning)">' + hampirHabis + '</div><div class="stock-stat-label">Hampir Habis</div></div>' +
        '<div class="stock-stat"><div class="stock-stat-num" style="color:var(--positive)">' + aman + '</div><div class="stock-stat-label">Aman</div></div>' +
        '<div class="stock-stat"><div class="stock-stat-num">' + items.length + '</div><div class="stock-stat-label">Total Item</div></div>';
    }

    const body = byId('stockBody');
    if (!body) return;
    body.innerHTML = '';

    if (items.length === 0) {
      body.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:30px;">Belum ada item stock. Klik + untuk menambah.</td></tr>';
      setText('stockFooter', 'Tidak ada item');
      return;
    }

    // Sort: habis dulu, lalu hampir habis, lalu aman
    items.sort((a, b) => {
      const ratioA = a.kebutuhan > 0 ? a.sisa / a.kebutuhan : 0;
      const ratioB = b.kebutuhan > 0 ? b.sisa / b.kebutuhan : 0;
      return ratioA - ratioB;
    });

    items.forEach(item => {
      const ratio = item.kebutuhan > 0 ? item.sisa / item.kebutuhan : 0;
      let statusText, statusIcon, statusCls, rowCls;
      if (ratio <= 0) {
        statusText = 'Habis'; statusIcon = '🔴'; statusCls = 'status-over'; rowCls = 'row-over';
      } else if (ratio < 0.3) {
        statusText = 'Hampir Habis'; statusIcon = '⚠️'; statusCls = 'status-warning'; rowCls = 'row-warning';
      } else {
        statusText = 'Aman'; statusIcon = '✅'; statusCls = 'status-aman'; rowCls = '';
      }

      const pct = Math.round(ratio * 100);
      const barColor = ratio <= 0 ? 'var(--negative)' : (ratio < 0.3 ? 'var(--warning)' : 'var(--positive)');

      const catColors = { 'Groceries': '#8bc34a', 'Home': '#64b5f6', 'Henry': '#ce93d8', 'Vina': '#f48fb1', 'Hiro': '#ffcc80' };
      const catColor = catColors[item.kategori] || '#888';

      const tr = document.createElement('tr');
      tr.className = rowCls;
      tr.innerHTML =
        '<td><strong>' + item.name + '</strong>' + (item.catatan ? '<br><small class="text-muted">' + item.catatan + '</small>' : '') + '</td>' +
        '<td><span class="kategori-badge" style="background:' + catColor + '20;color:' + catColor + '">' + (item.kategori || '-') + '</span></td>' +
        '<td class="text-center">' + item.kebutuhan + ' ' + (item.satuan || 'pcs') + '</td>' +
        '<td class="text-center" style="font-weight:600">' + item.sisa + ' ' + (item.satuan || 'pcs') + '</td>' +
        '<td class="text-center text-muted">' + (item.satuan || 'pcs') + '</td>' +
        '<td><div class="progress-mini"><div class="progress-bar-mini" style="width:' + Math.min(pct, 100) + '%;background:' + barColor + '"></div></div><span class="pct-badge ' + statusCls + '">' + statusIcon + ' ' + statusText + '</span></td>' +
        '<td><div class="stock-actions">' +
          '<button class="btn-icon btn-edit" title="Edit" data-id="' + item.id + '"><i class="fas fa-pen"></i></button>' +
          '<button class="btn-icon btn-update-sisa" title="Update Sisa" data-id="' + item.id + '"><i class="fas fa-rotate"></i></button>' +
          '<button class="btn-icon btn-delete" title="Hapus" data-id="' + item.id + '"><i class="fas fa-trash"></i></button>' +
        '</div></td>';
      body.appendChild(tr);
    });

    // Attach event listeners
    body.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = items.find(i => i.id === id);
        if (item) openStockModal(item);
      });
    });

    body.querySelectorAll('.btn-update-sisa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = items.find(i => i.id === id);
        if (!item) return;
        const newSisa = prompt('Update sisa stock "' + item.name + '":', item.sisa);
        if (newSisa !== null && !isNaN(parseFloat(newSisa))) {
          AppData.updateStockItem(id, { sisa: parseFloat(newSisa) });
          renderAll();
        }
      });
    });

    body.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const item = items.find(i => i.id === id);
        if (item) deleteStock(id, item.name);
      });
    });

    setText('stockFooter', 'Total ' + items.length + ' item stock');
  }

  // --- SHOPPING LIST ---
  function addShoppingItem() {
    const input = byId('shoppingInput');
    const catatanInput = byId('shoppingCatatan');
    const name = input.value.trim();
    if (!name) return;

    try {
      AppData.addShoppingItem({ name, catatan: catatanInput.value.trim() });
    } catch(e) {
      alert('Gagal menambah: ' + e.message);
      return;
    }

    input.value = '';
    catatanInput.value = '';
    input.focus();
    renderAll();
  }

  function toggleShoppingItem(id, checked) {
    try {
      AppData.updateShoppingItem(id, { checked: !checked });
    } catch(e) {}
    renderAll();
  }

  function deleteShoppingItem(id) {
    try {
      AppData.deleteShoppingItem(id);
    } catch(e) {}
    renderAll();
  }

  function resetShopping() {
    const items = AppData.getShoppingItems();
    if (items.length === 0) return;
    const checkedCount = items.filter(i => i.checked).length;
    if (!confirm('Reset daftar belanja?\n' + (checkedCount > 0 ? checkedCount + ' item sudah dibeli akan dihapus.\n' : '') + (items.length - checkedCount) + ' item belum dibeli juga akan dihapus.')) return;
    try {
      AppData.resetShoppingList();
    } catch(e) {
      alert('Gagal reset: ' + e.message);
      return;
    }
    renderAll();
  }

  function renderShopping() {
    let items = [];
    try { items = AppData.getShoppingItems(); } catch(e) {}

    const total = items.length;
    const checked = items.filter(i => i.checked).length;
    const unchecked = total - checked;

    // Stats
    const stats = byId('shoppingStats');
    if (stats) {
      stats.innerHTML =
        '<div class="stock-stat"><div class="stock-stat-num">' + total + '</div><div class="stock-stat-label">Total Item</div></div>' +
        '<div class="stock-stat"><div class="stock-stat-num" style="color:var(--positive)">' + checked + '</div><div class="stock-stat-label">Sudah Dibeli</div></div>' +
        '<div class="stock-stat"><div class="stock-stat-num" style="color:var(--warning)">' + unchecked + '</div><div class="stock-stat-label">Belum Dibeli</div></div>';
    }

    // List
    const list = byId('shoppingList');
    if (!list) return;
    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = '<div class="shopping-empty">Belum ada item. Ketik di atas untuk menambah.</div>';
      setText('shoppingFooter', 'Daftar kosong');
      return;
    }

    // Sort: unchecked first, then checked
    items.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return 0;
    });

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shopping-item' + (item.checked ? ' shopping-checked' : '');
      div.innerHTML =
        '<label class="shopping-checkbox-wrap">' +
          '<input type="checkbox" class="shopping-checkbox" data-id="' + item.id + '"' + (item.checked ? ' checked' : '') + '>' +
          '<span class="shopping-checkmark"></span>' +
        '</label>' +
        '<div class="shopping-item-info">' +
          '<span class="shopping-item-name">' + item.name + '</span>' +
          (item.catatan ? '<span class="shopping-item-note">' + item.catatan + '</span>' : '') +
        '</div>' +
        '<button class="btn-icon btn-delete shopping-delete" data-id="' + item.id + '"><i class="fas fa-times"></i></button>';
      list.appendChild(div);
    });

    // Attach listeners
    list.querySelectorAll('.shopping-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(cb.dataset.id);
        const item = items.find(i => i.id === id);
        if (item) toggleShoppingItem(id, item.checked);
      });
    });

    list.querySelectorAll('.shopping-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteShoppingItem(parseInt(btn.dataset.id));
      });
    });

    setText('shoppingFooter', checked + '/' + total + ' sudah dibeli');
  }

  // ===== RENDER =====
  function renderAll() {
    try { AppData.updateFundsFromTransactions(); } catch(e) { console.warn('updateFunds:', e); }
    try { renderDashboard(); } catch(e) { console.warn('dashboard:', e); }
    try { renderTransactions(); } catch(e) { console.warn('transactions:', e); }
    try { renderBudget(); } catch(e) { console.warn('budget:', e); }
    try { renderReport(); } catch(e) { console.warn('report:', e); }
    try { renderFunds(); } catch(e) { console.warn('funds:', e); }
    try { renderGuide(); } catch(e) { console.warn('guide:', e); }
    try { renderStock(); } catch(e) { console.warn('stock:', e); }
    try { renderShopping(); } catch(e) { console.warn('shopping:', e); }
  }

  // --- DASHBOARD ---
  function renderDashboard() {
    let funds = [], totals = {totalIncome:0,totalExpense:0,totalTransfer:0,sisa:0};
    let expenseByCat = {}, budgetExpense = {};
    try { funds = AppData.getFunds(); } catch(e) {}
    try { totals = AppData.getCurrentMonthTotals(); } catch(e) {}
    try { expenseByCat = AppData.getExpenseByCategory(); } catch(e) {}
    try { budgetExpense = AppData.getBudgetExpense(); } catch(e) {}
    const totalKas = funds.reduce((s, f) => s + (f.balance||0), 0);

    setText('totalKas', AppData.formatRp(totalKas));
    setText('totalIncome', AppData.formatRp(totals.totalIncome));
    setText('totalExpense', AppData.formatRp(totals.totalExpense));
    setText('totalSisa', AppData.formatRp(totals.sisa));

    const grid = byId('fundsGrid');
    if (grid) {
      grid.innerHTML = '';
      funds.forEach(f => {
        grid.innerHTML += '<div class="fund-item"><div class="fund-name">' + f.name + '</div><div class="fund-desc">' + (f.desc||'') + '</div><div class="fund-balance">' + AppData.formatRp(f.balance||0) + '</div></div>';
      });
    }

    // Budget Alerts
    renderBudgetAlerts(expenseByCat, budgetExpense);

    const body = byId('dashboardBudgetBody');
    if (!body) return;
    body.innerHTML = '';
    let cats = [];
    try { cats = AppData.getExpenseCategories(); } catch(e) {}

    cats.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      const sisa = budget - real;
      const pct = budget > 0 ? Math.round((real / budget) * 100) : (real > 0 ? 100 : 0);
      let status, cls;
      if (budget === 0 && real > 0) { status = 'NO BUDGET'; cls = 'status-over'; }
      else if (pct > 100) { status = 'OVER'; cls = 'status-over'; }
      else if (pct >= 80 && pct < 100) { status = 'WARNING'; cls = 'status-warning'; }
      else { status = 'OK'; cls = 'status-aman'; }

      const barColor = pct > 100 ? 'var(--negative)' : ((pct >= 80 && pct < 100) ? 'var(--warning)' : 'var(--positive)');
      const barWidth = Math.min(pct, 100);

      body.innerHTML += '<tr class="' + (pct > 100 ? 'row-over' : (pct >= 80 && pct < 100) ? 'row-warning' : '') + '"><td>' + cat + '</td><td class="text-right mono">' + AppData.formatRp(budget) + '</td><td class="text-right mono">' + AppData.formatRp(real) + '</td><td class="text-right mono">' + AppData.formatRp(Math.abs(sisa)) + (sisa < 0 ? ' (lebih)' : '') + '</td><td><div class="progress-mini"><div class="progress-bar-mini" style="width:' + barWidth + '%;background:' + barColor + '"></div></div><span class="pct-badge ' + cls + '">' + pct + '%</span></td><td class="' + cls + '">' + status + '</td></tr>';
    });
  }

  // --- BUDGET ALERTS ---
  function renderBudgetAlerts(expenseByCat, budgetExpense) {
    const container = byId('budgetAlerts');
    if (!container) return;
    container.innerHTML = '';

    let cats = [];
    try { cats = AppData.getExpenseCategories(); } catch(e) {}

    const overBudget = [];
    const warning = [];

    cats.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      if (budget === 0 && real > 0) {
        overBudget.push({ cat, budget, real, pct: 100, over: real });
      } else if (budget > 0) {
        const pct = Math.round((real / budget) * 100);
        if (pct > 100) {
          overBudget.push({ cat, budget, real, pct, over: real - budget });
        } else if (pct >= 80 && pct < 100) {
   warning.push({ cat, budget, real, pct, sisa: budget - real });
        }
      }
    });

    if (overBudget.length === 0 && warning.length === 0) return;

    let html = '';

    if (overBudget.length > 0) {
      html += '<div class="alert alert-danger"><div class="alert-header"><i class="fas fa-exclamation-circle"></i> Over Budget! (' + overBudget.length + ')</div><div class="alert-body">';
      overBudget.forEach(item => {
        html += '<div class="alert-item"><span class="alert-cat">' + item.cat + '</span><span class="alert-detail">' + AppData.formatRp(item.real) + ' / ' + AppData.formatRp(item.budget) + ' <span class="pct-badge status-over">' + item.pct + '%</span></span></div>';
      });
      html += '</div></div>';
    }

    if (warning.length > 0) {
      html += '<div class="alert alert-warning"><div class="alert-header"><i class="fas fa-exclamation-triangle"></i> Hampir Habis! (' + warning.length + ')</div><div class="alert-body">';
      warning.forEach(item => {
        html += '<div class="alert-item"><span class="alert-cat">' + item.cat + '</span><span class="alert-detail">Sisa ' + AppData.formatRp(item.sisa) + ' <span class="pct-badge status-warning">' + item.pct + '%</span></span></div>';
      });
      html += '</div></div>';
    }

    container.innerHTML = html;
  }

  function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = text;
  }

  // --- TRANSACTIONS ---
  function renderTransactions() {
    let all = [];
    try { all = AppData.getTransactions(); } catch(e) {}
    const search = (byId('transSearch').value || '').toLowerCase();
    const filterJenis = byId('transFilterJenis').value;
    const filterKategori = byId('transFilterKategori').value;

    let filtered = all.filter(t => {
      if (search && !((t.keterangan||'').toLowerCase().includes(search) || (t.kategori||'').toLowerCase().includes(search) || t.nominal.toString().includes(search) || (t.posAsal||'').toLowerCase().includes(search))) return false;
      if (filterJenis && t.jenis !== filterJenis) return false;
      if (filterKategori && t.kategori !== filterKategori) return false;
      return true;
    });

    filtered.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);

    const body = byId('transBody');
    if (!body) return;
    body.innerHTML = '';

    if (filtered.length === 0) {
      body.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:30px;">Belum ada transaksi. Klik + untuk menambah.</td></tr>';
      setText('transFooter', 'Tidak ada transaksi');
      return;
    }

    filtered.forEach((t, idx) => {
      const nominal = parseFloat(t.nominal) || 0;
      const posDisplay = t.jenis === 'Pindah' ? (t.posAsal + ' → ' + (t.posTujuan||'')) : t.posAsal;
      const jClass = 'jenis-' + (t.jenis||'').toLowerCase();
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML =
        '<td><strong>' + t.id + '</strong></td>' +
        '<td>' + (AppData.formatDateDisplay ? AppData.formatDateDisplay(t.tanggal) : t.tanggal) + '</td>' +
        '<td><span class="jenis-badge ' + jClass + '">' + t.jenis + '</span></td>' +
        '<td>' + (t.kategori||'-') + '</td>' +
        '<td>' + (t.keterangan||'-') + '</td>' +
        '<td class="text-right mono" style="font-weight:600;white-space:nowrap">' + AppData.formatRp(nominal) + '</td>' +
        '<td>' + posDisplay + '</td>';
      tr.addEventListener('click', (function(t) { return function() { openModal(t); }; })(t));
      body.appendChild(tr);
    });

    setText('transFooter', 'Menampilkan ' + filtered.length + ' dari ' + all.length + ' transaksi');
  }

  // --- BUDGET ---
  function renderBudget() {
    let budgetIncome = {}, budgetExpense = {}, incomeByCat = {}, expenseByCat = {};
    try { budgetIncome = AppData.getBudgetIncome(); } catch(e) {}
    try { budgetExpense = AppData.getBudgetExpense(); } catch(e) {}
    try { incomeByCat = AppData.getIncomeByCategory(); } catch(e) {}
    try { expenseByCat = AppData.getExpenseByCategory(); } catch(e) {}

    // Income
    const incomeBody = byId('budgetIncomeBody');
    if (incomeBody) {
      incomeBody.innerHTML = '';
      let totalTarget = 0, totalActual = 0;
      let cats = [];
      try { cats = AppData.getIncomeCategories(); } catch(e) {}
      cats.forEach(cat => {
        const target = budgetIncome[cat] || 0;
        const actual = incomeByCat[cat] || 0;
        totalTarget += target; totalActual += actual;
        incomeBody.innerHTML += '<tr><td>' + cat + '</td><td class="editable-cell text-right mono" contenteditable="true" data-type="income" data-cat="' + cat + '">' + target.toFixed(2) + '</td><td class="text-right mono">' + AppData.formatRp(actual) + '</td><td class="text-right mono">' + AppData.formatRp(target - actual) + '</td><td>' + (target > 0 ? Math.round((actual/target)*100) + '%' : '-') + '</td></tr>';
      });
      incomeBody.innerHTML += '<tr style="font-weight:700;background:var(--bg-elevated)"><td>TOTAL</td><td class="text-right mono">' + AppData.formatRp(totalTarget) + '</td><td class="text-right mono">' + AppData.formatRp(totalActual) + '</td><td class="text-right mono">' + AppData.formatRp(totalTarget - totalActual) + '</td><td>' + (totalTarget > 0 ? Math.round((totalActual/totalTarget)*100) + '%' : '-') + '</td></tr>';
    }

    // Expense
    const expenseBody = byId('budgetExpenseBody');
    if (expenseBody) {
      expenseBody.innerHTML = '';
      let cats = [];
      try { cats = AppData.getExpenseCategories(); } catch(e) {}
      cats.forEach(cat => {
        const budget = budgetExpense[cat] || 0;
        let pic = '', prio = '';
        try { pic = AppData.getPIC(cat); } catch(e) {}
        try { prio = AppData.getPrioritas(cat); } catch(e) {}
        const real = expenseByCat[cat] || 0;
        const pct = budget > 0 ? Math.round((real / budget) * 100) : (real > 0 ? 100 : 0);
        const barColor = pct > 100 ? 'var(--negative)' : (pct >= 80 ? 'var(--warning)' : 'var(--positive)');
        const barWidth = Math.min(pct, 100);
        const rowCls = pct > 100 ? 'row-over' : (pct >= 80 ? 'row-warning' : '');
        const statusCls = pct > 100 ? 'status-over' : (pct >= 80 ? 'status-warning' : 'status-aman');
        expenseBody.innerHTML += '<tr class="' + rowCls + '"><td>' + cat + '</td><td class="editable-cell" contenteditable="true" data-type="expense" data-cat="' + cat + '">' + budget.toFixed(2) + '</td><td>' + pic + '</td><td><span class="' + (prio === 'Wajib' ? 'prio-wajib' : 'prio-boleh') + '">' + prio + '</span></td><td><div class="progress-mini"><div class="progress-bar-mini" style="width:' + barWidth + '%;background:' + barColor + '"></div></div><span class="pct-badge ' + statusCls + '">' + pct + '%</span></td></tr>';
      });
    }

    // Editable listeners
    $$('.editable-cell').forEach(cell => {
      cell.addEventListener('blur', onBudgetEdit);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); cell.blur(); }
      });
    });
  }

  function onBudgetEdit(e) {
    const cell = e.target;
    const raw = cell.textContent.replace(/[^0-9,.]/g, '').replace(',', '.');
    const val = parseFloat(raw) || 0;
    const type = cell.dataset.type;
    const cat = cell.dataset.cat;
    if (!cat) return;

    try {
      if (type === 'income') {
        const budget = AppData.getBudgetIncome();
        budget[cat] = val;
        AppData.setBudgetIncome(budget);
      } else if (type === 'expense') {
        const budget = AppData.getBudgetExpense();
        budget[cat] = val;
        AppData.setBudgetExpense(budget);
      } else if (type === 'startbalance') {
        const funds = AppData.getFunds();
        const fund = funds.find(f => f.id === cat);
        if (fund) {
          fund.startBalance = val;
          AppData.updateFunds(funds);
        }
      }
    } catch(e) { return; }

    renderAll();
  }

  // --- REPORT ---
  function renderReport() {
    let totals = {totalIncome:0,totalExpense:0,totalTransfer:0,sisa:0};
    let expenseByCat = {}, budgetExpense = {};
    try { totals = AppData.getCurrentMonthTotals(); } catch(e) {}
    try { expenseByCat = AppData.getExpenseByCategory(); } catch(e) {}
    try { budgetExpense = AppData.getBudgetExpense(); } catch(e) {}

    const summary = byId('reportSummary');
    if (summary) {
      summary.innerHTML =
        '<div class="report-item rp-income"><div class="report-label">Total Pemasukan</div><div class="report-value">' + AppData.formatRp(totals.totalIncome) + '</div></div>' +
        '<div class="report-item rp-expense"><div class="report-label">Total Pengeluaran</div><div class="report-value">' + AppData.formatRp(totals.totalExpense) + '</div></div>' +
        '<div class="report-item rp-transfer"><div class="report-label">Total Pindah Pos</div><div class="report-value">' + AppData.formatRp(totals.totalTransfer) + '</div></div>' +
        '<div class="report-item rp-sisa"><div class="report-label">Sisa / Nabung</div><div class="report-value">' + AppData.formatRp(totals.sisa) + '</div></div>';
    }

    const body = byId('reportOverBudgetBody');
    if (!body) return;
    body.innerHTML = '';
    let cats = [];
    try { cats = AppData.getExpenseCategories(); } catch(e) {}
    cats.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      const selisih = budget - real;
      const pct = budget > 0 ? Math.round((real / budget) * 100) : (real > 0 ? 100 : 0);
      let status, cls;
      if (budget === 0 && real > 0) { status = 'NO BUDGET'; cls = 'status-over'; }
      else if (pct > 100) { status = 'OVER'; cls = 'status-over'; }
      else if (pct >= 80 && pct < 100) { status = 'WARNING'; cls = 'status-warning'; }
      else if (budget > 0) { status = 'OK'; cls = 'status-aman'; }
      else { status = '—'; cls = ''; }
      const barColor = pct > 100 ? 'var(--negative)' : ((pct >= 80 && pct < 100) ? 'var(--warning)' : 'var(--positive)');
      const barWidth = Math.min(pct, 100);
      const rowCls = pct > 100 ? 'row-over' : ((pct >= 80 && pct < 100) ? 'row-warning' : '');
      body.innerHTML += '<tr class="' + rowCls + '"><td>' + cat + '</td><td class="text-right mono">' + AppData.formatRp(budget) + '</td><td class="text-right mono">' + AppData.formatRp(real) + '</td><td class="text-right mono">' + AppData.formatRp(Math.abs(selisih)) + (selisih < 0 ? ' (lebih)' : '') + '</td><td><div class="progress-mini"><div class="progress-bar-mini" style="width:' + barWidth + '%;background:' + barColor + '"></div></div><span class="pct-badge ' + cls + '">' + pct + '%</span></td><td class="' + cls + '">' + status + '</td></tr>';
    });
  }

  // --- FUNDS ---
  function renderFunds() {
    let funds = [];
    try { funds = AppData.getFunds(); } catch(e) {}
    const body = byId('fundsBody');
    if (!body) return;
    body.innerHTML = '';

    funds.forEach(f => {
      const mutasi = (f.balance||0) - (f.startBalance||0);
      const mc = mutasi >= 0 ? 'mutasi-plus' : 'mutasi-minus';
      const row = document.createElement('tr');
      row.innerHTML = '<td><strong>' + f.name + '</strong></td>' +
        '<td class="text-right mono">' + AppData.formatRp(f.balance||0) + '</td>' +
        '<td class="editable-cell text-right mono" contenteditable="true" data-type="startbalance" data-cat="' + f.id + '">' + AppData.formatRp(f.startBalance||0) + '</td>' +
        '<td class="text-right mono ' + mc + '">' + (mutasi >= 0 ? '+' : '') + AppData.formatRp(mutasi) + '</td>' +
        '<td>' + (f.target||'-') + '</td>' +
        '<td class="text-muted">' + (f.desc||'') + '</td>';
      body.appendChild(row);
    });

    const totalBal = funds.reduce((s, f) => s + (f.balance||0), 0);
    const totalStart = funds.reduce((s, f) => s + (f.startBalance||0), 0);
    const totalMutasi = totalBal - totalStart;
    const totalRow = document.createElement('tr');
    totalRow.style.cssText = 'font-weight:700;background:var(--bg-elevated)';
    totalRow.innerHTML = '<td>TOTAL KAS</td><td class="text-right mono">' + AppData.formatRp(totalBal) + '</td><td class="text-right mono">' + AppData.formatRp(totalStart) + '</td><td class="text-right mono ' + (totalMutasi >= 0 ? 'mutasi-plus' : 'mutasi-minus') + '">' + (totalMutasi >= 0 ? '+' : '') + AppData.formatRp(totalMutasi) + '</td><td></td><td></td>';
    body.appendChild(totalRow);

    // Editable listeners for saldo awal
    body.querySelectorAll('.editable-cell').forEach(cell => {
      cell.addEventListener('blur', onBudgetEdit);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); cell.blur(); }
      });
    });
  }

  // --- GUIDE ---
  function renderGuide() {
    const formatContainer = byId('guideFormat');
    if (formatContainer) {
      formatContainer.innerHTML =
        '<div class="guide-item"><div class="guide-icon">◆</div><div class="guide-text"><strong>Pemasukan</strong><br><strong>tgl | masuk | kategori | keterangan | nominal | pos</strong><span class="guide-example">25/6 | masuk | Paycheck | Gaji Juni | 5200000 | Blu</span></div></div>' +
        '<div class="guide-item"><div class="guide-icon">◆</div><div class="guide-text"><strong>Pengeluaran</strong><br><strong>tgl | keluar | kategori | keterangan | nominal | pos</strong><span class="guide-example">25/6 | keluar | Food | Makan siang | 35000 | Cash</span></div></div>' +
        '<div class="guide-item"><div class="guide-icon">◆</div><div class="guide-text"><strong>Pindah Pos</strong><br><strong>tgl | pindah | - | keterangan | nominal | asal → tujuan</strong><span class="guide-example">25/6 | pindah | - | Nabung darurat | 500000 | Blu → Comfort Life</span></div></div>';
    }

    const incomeContainer = byId('guideIncomeKategori');
    if (incomeContainer) {
      incomeContainer.innerHTML = '';
      try {
        AppData.getIncomeCategories().forEach(c => {
          incomeContainer.innerHTML += '<div class="kategori-item"><span class="kategori-nama">' + c + '</span></div>';
        });
      } catch(e) {}
    }

    const expenseContainer = byId('guideExpenseKategori');
    if (expenseContainer) {
      expenseContainer.innerHTML = '';
      try {
        AppData.getExpenseCategories().forEach(c => {
          let pic = '', prio = '';
          try { pic = AppData.getPIC(c); } catch(e) {}
          try { prio = AppData.getPrioritas(c); } catch(e) {}
          expenseContainer.innerHTML += '<div class="kategori-item"><span class="kategori-nama">' + c + '</span> <span class="kategori-desc">PIC: ' + pic + ' — ' + prio + '</span></div>';
        });
      } catch(e) {}
    }
  }

  // ===== START =====
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
// v2.1 - editable saldo awal 1782912238
