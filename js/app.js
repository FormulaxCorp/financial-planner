/* ============================================
   Our Financial Planner - App Controller
   ============================================ */

(function() {
  'use strict';

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

    // Modal
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
  };

  // ===== STATE =====
  let state = {
    currentPage: 'dashboard',
    editId: null,
    filteredTransactions: []
  };

  // ===== INIT =====
  function init() {
    console.log('🏠 Our Financial Planner starting...');

    // Hide splash after load
    setTimeout(() => {
      $(Dom.splash).classList.add('hidden');
      $(Dom.app).classList.add('visible');
    }, 800);

    // Setup navigation
    setupNavigation();
    setupEventListeners();

    // Setup form
    setupForm();

    // Initial render
    renderAll();

    // Register service worker
    registerSW();
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('✅ SW registered'))
        .catch(err => console.log('SW registration skipped:', err));
    }
  }

  // ===== NAVIGATION =====
  function setupNavigation() {
    // Sidebar links
    $(Dom.navLinks).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
        closeSidebar();
      });
    });

    // Bottom nav links
    $(Dom.bottomLinks).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
      });
    });
  }

  function navigateTo(page) {
    // Update state
    state.currentPage = page;

    // Hide all pages
    $(Dom.pages).forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Update sidebar active
    $(Dom.navLinks).forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });

    // Update bottom nav active
    $(Dom.bottomLinks).forEach(l => {
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
    // Menu toggle
    $(Dom.menuBtn).addEventListener('click', openSidebar);
    $(Dom.sidebarClose).addEventListener('click', closeSidebar);
    $(Dom.overlay).addEventListener('click', closeSidebar);

    // Refresh
    $(Dom.refreshBtn).addEventListener('click', () => {
      renderAll();
      $(Dom.refreshBtn).classList.add('fa-spin');
      setTimeout(() => $(Dom.refreshBtn).classList.remove('fa-spin'), 600);
    });

    // Transaction filters
    $(Dom.transSearch).addEventListener('input', renderTransactions);
    $(Dom.transFilterJenis).addEventListener('change', renderTransactions);
    $(Dom.transFilterKategori).addEventListener('change', renderTransactions);

    // Add Transaction
    $(Dom.addTransBtn).addEventListener('click', () => openModal());

    // Modal
    $(Dom.modalClose).addEventListener('click', closeModal);
    $(Dom.modalCancel).addEventListener('click', closeModal);
    $(Dom.modalSave).addEventListener('click', saveTransaction);

    // Show/hide pos tujuan based on jenis
    $(Dom.formJenis).addEventListener('change', () => {
      const jenis = $(Dom.formJenis).value;
      $(Dom.formPosTujuanGroup).style.display = jenis === 'Pindah' ? 'block' : 'none';
      updateKategoriOptions();
    });
  }

  // ===== FORM SETUP =====
  function setupForm() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    $(Dom.formTanggal).value = today;

    // Populate kategori
    updateKategoriOptions();

    // Populate pos
    const funds = AppData.getFunds();
    const posSelects = [Dom.formPosAsal, Dom.formPosTujuan];
    posSelects.forEach(sel => {
      const el = $(sel);
      el.innerHTML = '';
      funds.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.id;
        el.appendChild(opt);
      });
    });

    // Populate kategori filter
    const filter = $(Dom.transFilterKategori);
    AppData.expenseCategories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filter.appendChild(opt);
    });
  }

  function updateKategoriOptions() {
    const jenis = $(Dom.formJenis).value;
    const sel = $(Dom.formKategori);
    sel.innerHTML = '';

    let cats = [];
    if (jenis === 'Masuk') cats = AppData.incomeCategories;
    else if (jenis === 'Keluar') cats = AppData.expenseCategories;
    else cats = ['Transfer Dana', 'Nabung', 'Pindah Dana'];

    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c || '(pilih)';
      sel.appendChild(opt);
    });

    // Add "Lainnya" option
    if (jenis !== 'Pindah') {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '— Lainnya —';
      sel.appendChild(opt);
    }
  }

  // ===== MODAL =====
  let isEditing = false;

  function openModal(trans) {
    isEditing = !!trans;
    $(Dom.modalTitle).textContent = isEditing ? '✏️ Edit Transaksi' : '✏️ Tambah Transaksi';

    if (isEditing) {
      state.editId = trans.id;
      $(Dom.formTanggal).value = trans.tanggal;
      $(Dom.formJenis).value = trans.jenis;
      $(Dom.formKeterangan).value = trans.keterangan;
      $(Dom.formNominal).value = trans.nominal;
      $(Dom.formPosAsal).value = trans.posAsal;
      $(Dom.formPosTujuan).value = trans.posTujuan || AppData.funds[1].id;
      $(Dom.formInput).value = trans.input;
      $(Dom.formOleh).value = trans.oleh;
      updateKategoriOptions();
      $(Dom.formKategori).value = trans.kategori || '';

      // Show/hide pos tujuan
      $(Dom.formPosTujuanGroup).style.display = trans.jenis === 'Pindah' ? 'block' : 'none';
    } else {
      state.editId = null;
      const today = new Date().toISOString().split('T')[0];
      $(Dom.formTanggal).value = today;
      $(Dom.formJenis).value = 'Keluar';
      $(Dom.formKeterangan).value = '';
      $(Dom.formNominal).value = '';
      $(Dom.formPosAsal).value = 'Blu';
      $(Dom.formPosTujuan).value = 'Comfort Life';
      $(Dom.formInput).value = 'Manual';
      $(Dom.formOleh).value = 'Vina';
      updateKategoriOptions();
      $(Dom.formPosTujuanGroup).style.display = 'none';
    }

    $(Dom.transModal).classList.add('open');
  }

  function closeModal() {
    $(Dom.transModal).classList.remove('open');
    state.editId = null;
  }

  function saveTransaction() {
    const tanggal = $(Dom.formTanggal).value;
    const jenis = $(Dom.formJenis).value;
    const kategori = $(Dom.formKategori).value;
    const keterangan = $(Dom.formKeterangan).value.trim();
    const nominal = parseInt($(Dom.formNominal).value) || 0;
    const posAsal = $(Dom.formPosAsal).value;
    const posTujuan = $(Dom.formPosTujuan).value;
    const input = $(Dom.formInput).value;
    const oleh = $(Dom.formOleh).value;

    // Validation
    if (!tanggal) { alert('Tanggal harus diisi!'); return; }
    if (nominal <= 0) { alert('Nominal harus lebih dari 0!'); return; }

    const transData = { tanggal, jenis, kategori, keterangan, nominal, posAsal, posTujuan, input, oleh };

    if (isEditing && state.editId) {
      AppData.updateTransaction(state.editId, transData);
    } else {
      // Check duplicate: same date, amount, category
      const all = AppData.getTransactions();
      const isDuplicate = all.some(t =>
        t.tanggal === tanggal &&
        t.nominal === nominal &&
        t.kategori === kategori &&
        t.jenis === jenis
      );
      if (isDuplicate) {
        if (!confirm('Transaksi serupa sudah ada. Tetap simpan?')) return;
      }
      AppData.addTransaction(transData);
    }

    closeModal();
    renderAll();
  }

  // ===== RENDER FUNCTIONS =====

  function renderAll() {
    // Update funds first
    AppData.updateFundsFromTransactions();

    renderDashboard();
    renderTransactions();
    renderBudget();
    renderReport();
    renderFunds();
    renderGuide();
  }

  // --- DASHBOARD ---
  function renderDashboard() {
    const funds = AppData.getFunds();
    const totals = AppData.getCurrentMonthTotals();
    const totalKas = funds.reduce((s, f) => s + f.balance, 0);

    // Summary cards
    $(Dom.totalKas).textContent = AppData.formatRp(totalKas);
    $(Dom.totalIncome).textContent = AppData.formatRp(totals.totalIncome);
    $(Dom.totalExpense).textContent = AppData.formatRp(totals.totalExpense);
    $(Dom.totalSisa).textContent = AppData.formatRp(totals.sisa);

    // Funds grid
    const grid = $(Dom.fundsGrid);
    grid.innerHTML = '';
    funds.forEach(f => {
      const item = document.createElement('div');
      item.className = 'fund-item';
      item.innerHTML = `
        <div class="fund-name">${f.name}</div>
        <div class="fund-desc">${f.desc}</div>
        <div class="fund-balance">${AppData.formatRp(f.balance)}</div>
      `;
      grid.appendChild(item);
    });

    // Budget vs Realisasi table
    const body = $(Dom.dashboardBudgetBody);
    body.innerHTML = '';
    const expenseByCat = AppData.getExpenseByCategory();
    const budgetExpense = AppData.getBudgetExpense();

    AppData.expenseCategories.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      const sisa = budget - real;
      let status = sisa < 0 ? '🔴 OVER' : '✅ AMAN';
      let cls = sisa < 0 ? 'status-over' : 'status-aman';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat}</td>
        <td>${AppData.formatRp(budget)}</td>
        <td>${AppData.formatRp(real)}</td>
        <td>${AppData.formatRp(Math.abs(sisa))} ${sisa < 0 ? '(lebih)' : ''}</td>
        <td class="${cls}">${status}</td>
      `;
      body.appendChild(tr);
    });
  }

  // --- TRANSACTIONS ---
  function renderTransactions() {
    const all = AppData.getTransactions();
    const search = ($(Dom.transSearch).value || '').toLowerCase();
    const filterJenis = $(Dom.transFilterJenis).value;
    const filterKategori = $(Dom.transFilterKategori).value;

    let filtered = all.filter(t => {
      // Search
      if (search) {
        const match = t.keterangan.toLowerCase().includes(search) ||
                      t.kategori.toLowerCase().includes(search) ||
                      t.nominal.toString().includes(search) ||
                      t.posAsal.toLowerCase().includes(search);
        if (!match) return false;
      }
      // Jenis filter
      if (filterJenis && t.jenis !== filterJenis) return false;
      // Kategori filter (only for Keluar)
      if (filterKategori && t.kategori !== filterKategori) return false;
      return true;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);

    state.filteredTransactions = filtered;

    const body = $(Dom.transBody);
    body.innerHTML = '';

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="7" class="text-center text-muted" style="padding: 30px;">Belum ada transaksi. Klik + untuk menambah.</td>`;
      body.appendChild(tr);
      $(Dom.transFooter).textContent = 'Tidak ada transaksi';
      return;
    }

    filtered.forEach(t => {
      const nominal = parseInt(t.nominal) || 0;
      const formattedNominal = AppData.formatRp(nominal);

      const jenisClass = `jenis-${t.jenis.toLowerCase()}`;
      const posDisplay = t.jenis === 'Pindah'
        ? `${t.posAsal} → ${t.posTujuan}`
        : t.posAsal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.id}</strong></td>
        <td>${AppData.formatDateDisplay(t.tanggal)}</td>
        <td><span class="${jenisClass}">${t.jenis}</span></td>
        <td>${t.kategori || '-'}</td>
        <td>${t.keterangan || '-'}</td>
        <td class="text-right" style="font-weight:600">${formattedNominal}</td>
        <td>${posDisplay}</td>
      `;
      // Click to edit
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openModal(t));
      body.appendChild(tr);
    });

    $(Dom.transFooter).textContent = `Menampilkan ${filtered.length} dari ${all.length} transaksi`;
  }

  // --- BUDGET ---
  function renderBudget() {
    // Income
    const incomeBody = $(Dom.budgetIncomeBody);
    incomeBody.innerHTML = '';
    const incomeByCat = AppData.getIncomeByCategory();
    const budgetIncome = AppData.getBudgetIncome();
    let totalTarget = 0, totalActual = 0;

    AppData.incomeCategories.forEach(cat => {
      const target = budgetIncome[cat] || 0;
      const actual = incomeByCat[cat] || 0;
      const selisih = target - actual;
      const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
      totalTarget += target;
      totalActual += actual;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat}</td>
        <td>${AppData.formatRp(target)}</td>
        <td>${AppData.formatRp(actual)}</td>
        <td>${AppData.formatRp(Math.abs(selisih))}</td>
        <td>${target > 0 ? pct + '%' : '-'}</td>
      `;
      incomeBody.appendChild(tr);
    });

    // Total row
    const tr = document.createElement('tr');
    tr.style.fontWeight = '700';
    tr.style.background = 'var(--bg-hover)';
    tr.innerHTML = `
      <td>TOTAL</td>
      <td>${AppData.formatRp(totalTarget)}</td>
      <td>${AppData.formatRp(totalActual)}</td>
      <td>${AppData.formatRp(totalTarget - totalActual)}</td>
      <td>${totalTarget > 0 ? Math.round((totalActual/totalTarget)*100) + '%' : '-'}</td>
    `;
    incomeBody.appendChild(tr);

    // Expense budget
    const expenseBody = $(Dom.budgetExpenseBody);
    expenseBody.innerHTML = '';
    const budgetExpense = AppData.getBudgetExpense();

    AppData.expenseCategories.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const pic = AppData.getPIC(cat);
      const prio = AppData.getPrioritas(cat);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat}</td>
        <td>${AppData.formatRp(budget)}</td>
        <td>${pic}</td>
        <td><span style="color:${prio === 'Wajib' ? 'var(--accent-green)' : 'var(--accent-yellow)'}">${prio}</span></td>
      `;
      expenseBody.appendChild(tr);
    });
  }

  // --- REPORT ---
  function renderReport() {
    const totals = AppData.getCurrentMonthTotals();
    const expenseByCat = AppData.getExpenseByCategory();
    const budgetExpense = AppData.getBudgetExpense();
    const totalExpense = Object.values(expenseByCat).reduce((s, v) => s + v, 0);
    const totalBudget = Object.values(budgetExpense).reduce((s, v) => s + v, 0);

    // Summary
    $(Dom.reportSummary).innerHTML = `
      <div class="report-item rp-green">
        <div class="report-label">Total Pemasukan</div>
        <div class="report-value">${AppData.formatRp(totals.totalIncome)}</div>
      </div>
      <div class="report-item rp-red">
        <div class="report-label">Total Pengeluaran</div>
        <div class="report-value">${AppData.formatRp(totals.totalExpense)}</div>
      </div>
      <div class="report-item rp-blue">
        <div class="report-label">Total Pindah Pos</div>
        <div class="report-value">${AppData.formatRp(totals.totalTransfer)}</div>
      </div>
      <div class="report-item rp-yellow">
        <div class="report-label">Sisa / Nabung</div>
        <div class="report-value">${AppData.formatRp(totals.sisa)}</div>
      </div>
    `;

    // Over budget check
    const body = $(Dom.reportOverBudgetBody);
    body.innerHTML = '';
    let overCount = 0;

    AppData.expenseCategories.forEach(cat => {
      const budget = budgetExpense[cat] || 0;
      const real = expenseByCat[cat] || 0;
      const selisih = budget - real;
      const pct = budget > 0 ? Math.round((real / budget) * 100) : 0;
      let status, cls;

      if (budget === 0 && real > 0) {
        status = '⚠️ NO BUDGET';
        cls = 'status-over';
        overCount++;
      } else if (real > budget) {
        status = '🔴 OVER';
        cls = 'status-over';
        overCount++;
      } else if (budget > 0) {
        status = '✅ ON TRACK';
        cls = 'status-aman';
      } else {
        status = '—';
        cls = '';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat}</td>
        <td>${AppData.formatRp(budget)}</td>
        <td>${AppData.formatRp(real)}</td>
        <td>${AppData.formatRp(Math.abs(selisih))} ${selisih < 0 ? '(lebih)' : ''}</td>
        <td>${budget > 0 ? pct + '%' : '-'}</td>
        <td class="${cls}">${status}</td>
      `;
      body.appendChild(tr);
    });
  }

  // --- FUNDS ---
  function renderFunds() {
    const funds = AppData.getFunds();
    const body = $(Dom.fundsBody);
    body.innerHTML = '';

    funds.forEach(f => {
      const mutasi = f.balance - f.startBalance;
      const mutasiText = mutasi >= 0 ? `+${AppData.formatRp(mutasi)}` : AppData.formatRp(mutasi);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${f.name}</strong></td>
        <td>${AppData.formatRp(f.balance)}</td>
        <td>${AppData.formatRp(f.startBalance)}</td>
        <td style="color:${mutasi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${mutasiText}</td>
        <td>${f.target || '-'}</td>
        <td class="text-muted">${f.desc}</td>
      `;
      body.appendChild(tr);
    });

    // Total row
    const totalBal = funds.reduce((s, f) => s + f.balance, 0);
    const totalStart = funds.reduce((s, f) => s + f.startBalance, 0);
    const totalMutasi = totalBal - totalStart;
    const tr = document.createElement('tr');
    tr.style.fontWeight = '700';
    tr.style.background = 'var(--bg-hover)';
    tr.innerHTML = `
      <td>TOTAL KAS</td>
      <td>${AppData.formatRp(totalBal)}</td>
      <td>${AppData.formatRp(totalStart)}</td>
      <td style="color:${totalMutasi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${AppData.formatRp(totalMutasi)}</td>
      <td></td>
      <td></td>
    `;
    body.appendChild(tr);
  }

  // --- GUIDE ---
  function renderGuide() {
    const formatContainer = $(Dom.guideFormat);

    const guideItems = [
      { icon: '📝', title: 'Pemasukan',
        text: 'Format: <strong>tgl | masuk | kategori | keterangan | nominal | pos</strong>',
        example: '25/6 | masuk | Paycheck | Gaji Juni 2026 | 5.200.000 | Blu' },
      { icon: '📝', title: 'Pengeluaran',
        text: 'Format: <strong>tgl | keluar | kategori | keterangan | nominal | pos</strong>',
        example: '25/6 | keluar | Food | Makan siang | 35.000 | Cash' },
      { icon: '🔄', title: 'Pindah Pos',
        text: 'Format: <strong>tgl | pindah | - | keterangan | nominal | asal → tujuan</strong>',
        example: '25/6 | pindah | - | Nabung darurat | 500.000 | Blu → Comfort Life' },
      { icon: '📸', title: 'Foto Struk',
        text: '<strong>Kirim foto struk</strong> ke chat → Hermes baca otomatis',
        example: '📸 (kirim gambar struk belanja)' },
      { icon: '✏️', title: 'Edit Entri',
        text: '<strong>Ketik:</strong> edit transaksi [ID] — ganti [kolom] [nilai]',
        example: 'edit transaksi 5 — ganti nominal 25000' },
      { icon: '🗑️', title: 'Hapus',
        text: '<strong>Ketik:</strong> hapus transaksi [ID]',
        example: 'hapus transaksi 3' },
    ];

    formatContainer.innerHTML = guideItems.map(item => `
      <div class="guide-item">
        <div class="guide-icon">${item.icon}</div>
        <div class="guide-text">
          <strong>${item.title}</strong><br>
          ${item.text}
          <span class="guide-example">${item.example}</span>
        </div>
      </div>
    `).join('');

    // Income categories
    const incomeContainer = $(Dom.guideIncomeKategori);
    incomeContainer.innerHTML = AppData.incomeCategories.map(c => `
      <div class="kategori-item">
        <span class="kategori-nama">${c}</span>
        <span class="kategori-desc">${getIncomeDesc(c)}</span>
      </div>
    `).join('');

    // Expense categories
    const expenseContainer = $(Dom.guideExpenseKategori);
    expenseContainer.innerHTML = AppData.expenseCategories.map(c => {
      const pic = AppData.getPIC(c);
      const prio = AppData.getPrioritas(c);
      return `
      <div class="kategori-item">
        <span class="kategori-nama">${c}</span>
        <span class="kategori-desc">${getExpenseDesc(c)} (PIC: ${pic}) — ${prio}</span>
      </div>`;
    }).join('');
  }

  function getIncomeDesc(cat) {
    const descs = {
      'Paycheck': 'Gaji utama',
      'Interest': 'Bunga tabungan',
      'Repayment': 'Uang kembali / pinjaman dibayar',
      'Gifts': 'Hadiah',
      'Other': 'Pemasukan lain-lain'
    };
    return descs[cat] || '';
  }

  function getExpenseDesc(cat) {
    const descs = {
      'Food': 'Makan sehari-hari, jajan',
      'Groceries': 'Belanja bahan masakan',
      'Health & Medical': 'Obat, vitamin, dokter',
      'Home': 'Perabot, kebersihan rumah',
      'Travel Expenses': 'Tol, bensin, tiket',
      'Utilities': 'Listrik, air, wifi',
      'Phone Credit': 'Pulsa, paket data',
      'Entertainment': 'Netflix, Spotify, hiburan',
      'Skin & Body Care': 'Skincare, kosmetik',
      "Hiroshi's": 'Keperluan Hiro',
      "Mpi's": 'Keperluan Mpi',
      "Henry's": 'Keperluan Henry',
      'Gifts': 'Hadiah untuk orang lain',
      'Public Transportation': 'Angkutan umum',
      'Event': 'Acara / kondangan',
      'Loan': 'Cicilan pinjaman',
      'Debt': 'Pembayaran hutang',
      'Zakat': 'Zakat / infaq / sedekah',
      'Other': 'Pengeluaran lain-lain'
    };
    return descs[cat] || '';
  }

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  }

})();
