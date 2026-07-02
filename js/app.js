/* ============================================
   Our Financial Planner - App Controller
   ============================================ */

(function() {
  'use strict';

  // ===== AUTH (Simple Password) =====
    function setupAuth() {
      const loginScreen = document.getElementById('login-screen');
      const loginBtn = document.getElementById('loginBtn');
      const loginPassword = document.getElementById('loginPassword');
      const loginError = document.getElementById('loginError');

      // Check if already authenticated
      if (SimpleAuth.isLoggedIn()) {
        loginScreen.classList.add('hidden');
        // Load data
        loadAppData();
      } else {
        loginScreen.classList.remove('hidden');
      }

      // Login button click
      loginBtn.addEventListener('click', async () => {
        const password = loginPassword.value;

        if (!password) {
          loginError.textContent = 'Masukkan password!';
          return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Loading...';
        loginError.textContent = '';

        const result = await SimpleAuth.login(password);
      
        if (result.success) {
          loginScreen.classList.add('hidden');
          // Load data after successful login
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
        logoutBtn.addEventListener('click', () => {
          SimpleAuth.logout();
          loginScreen.classList.remove('hidden');
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
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
        SimpleAuth.logout();
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
      el.innerHTML = '';
      funds.forEach(f => {
        el.innerHTML += '<option value="' + f.id + '">' + f.id + '</option>';
      });
    });
  }

  // ===== TRANSACTION MODAL =====
  function openModal(trans) {
    const isEditing = !!trans;
    byId('modalTitle').textContent = isEditing ? 'Edit Transaksi' : 'Tambah Transaksi';

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

  // ===== RENDER =====
  function renderAll() {
    try { AppData.updateFundsFromTransactions(); } catch(e) { console.warn('updateFunds:', e); }
    try { renderDashboard(); } catch(e) { console.warn('dashboard:', e); }
    try { renderTransactions(); } catch(e) { console.warn('transactions:', e); }
    try { renderBudget(); } catch(e) { console.warn('budget:', e); }
    try { renderReport(); } catch(e) { console.warn('report:', e); }
    try { renderFunds(); } catch(e) { console.warn('funds:', e); }
    try { renderGuide(); } catch(e) { console.warn('guide:', e); }
  }

  // --- DASHBOARD ---
  function renderDashboard() {
    let funds = [], totals = {totalIncome:0,totalExpense:0,totalTransfer:0,sisa:0};
    try { funds = AppData.getFunds(); } catch(e) {}
    try { totals = AppData.getCurrentMonthTotals(); } catch(e) {}
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

    const body = byId('dashboardBudgetBody');
    if (!body) return;
    body.innerHTML = '';
    let expenseByCat = {}, budgetExpense = {};
    try { expenseByCat = AppData.getExpenseByCategory(); } catch(e) {}
    try { budgetExpense = AppData.getBudgetExpense(); } catch(e) {}
    let cats = [];
    try { cats = AppData.getExpenseCategories(); } catch(e) {}

    cats.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      const sisa = budget - real;
      const status = sisa < 0 ? 'OVER' : 'OK';
      const cls = sisa < 0 ? 'status-over' : 'status-aman';
      body.innerHTML += '<tr><td>' + cat + '</td><td>' + AppData.formatRp(budget) + '</td><td>' + AppData.formatRp(real) + '</td><td>' + AppData.formatRp(Math.abs(sisa)) + (sisa < 0 ? ' (lebih)' : '') + '</td><td class="' + cls + '">' + status + '</td></tr>';
    });
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
        '<td class="text-right" style="font-weight:600;white-space:nowrap">' + AppData.formatRp(nominal) + '</td>' +
        '<td>' + posDisplay + '</td>';
      tr.addEventListener('click', (function(t) { return function() { openModal(t); }; })(t));
      body.appendChild(tr);
    });

    setText('transFooter', 'Menampilkan ' + filtered.length + ' dari ' + all.length + ' transaksi');
  }

  // --- BUDGET ---
  function renderBudget() {
    let budgetIncome = {}, budgetExpense = {}, incomeByCat = {};
    try { budgetIncome = AppData.getBudgetIncome(); } catch(e) {}
    try { budgetExpense = AppData.getBudgetExpense(); } catch(e) {}
    try { incomeByCat = AppData.getIncomeByCategory(); } catch(e) {}

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
        incomeBody.innerHTML += '<tr><td>' + cat + '</td><td class="editable-cell" contenteditable="true" data-type="income" data-cat="' + cat + '">' + target.toFixed(2) + '</td><td>' + AppData.formatRp(actual) + '</td><td>' + AppData.formatRp(target - actual) + '</td><td>' + (target > 0 ? Math.round((actual/target)*100) + '%' : '-') + '</td></tr>';
      });
      incomeBody.innerHTML += '<tr style="font-weight:700;background:var(--bg-elevated)"><td>TOTAL</td><td>' + AppData.formatRp(totalTarget) + '</td><td>' + AppData.formatRp(totalActual) + '</td><td>' + AppData.formatRp(totalTarget - totalActual) + '</td><td>' + (totalTarget > 0 ? Math.round((totalActual/totalTarget)*100) + '%' : '-') + '</td></tr>';
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
        expenseBody.innerHTML += '<tr><td>' + cat + '</td><td class="editable-cell" contenteditable="true" data-type="expense" data-cat="' + cat + '">' + budget.toFixed(2) + '</td><td>' + pic + '</td><td><span class="' + (prio === 'Wajib' ? 'prio-wajib' : 'prio-boleh') + '">' + prio + '</span></td></tr>';
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
      const pct = budget > 0 ? Math.round((real / budget) * 100) : 0;
      let status, cls;
      if (budget === 0 && real > 0) { status = 'NO BUDGET'; cls = 'status-over'; }
      else if (real > budget) { status = 'OVER'; cls = 'status-over'; }
      else if (budget > 0) { status = 'OK'; cls = 'status-aman'; }
      else { status = '—'; cls = ''; }
      body.innerHTML += '<tr><td>' + cat + '</td><td>' + AppData.formatRp(budget) + '</td><td>' + AppData.formatRp(real) + '</td><td>' + AppData.formatRp(Math.abs(selisih)) + (selisih < 0 ? ' (lebih)' : '') + '</td><td>' + (budget > 0 ? pct + '%' : '-') + '</td><td class="' + cls + '">' + status + '</td></tr>';
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
