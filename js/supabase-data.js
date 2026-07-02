/* ============================================
   Supabase Data Layer
   Replaces Firebase Firestore
   ============================================ */
const SupabaseData = (() => {
  'use strict';

  // Cache for offline/fast access
  let cache = {
    transactions: [],
    funds: [],
    budgetIncome: {},
    budgetExpense: {},
    incomeCats: [],
    expenseCats: [],
    picData: {},
    prioritasData: {},
    stockItems: [],
    shoppingItems: []
  };

  // Load all data from Supabase
  async function loadAllData() {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('id, data');

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      data.forEach(row => {
        switch (row.id) {
          case 'funds':
            cache.funds = row.data.items || [];
            break;
          case 'transactions':
            cache.transactions = row.data.items || [];
            break;
          case 'budget':
            cache.budgetIncome = row.data.income || {};
            cache.budgetExpense = row.data.expense || {};
            break;
          case 'categories':
            cache.incomeCats = row.data.income || [];
            cache.expenseCats = row.data.expense || [];
            break;
          case 'pic':
            cache.picData = row.data.data || {};
            break;
          case 'prioritas':
            cache.prioritasData = row.data.data || {};
            break;
          case 'stock':
            cache.stockItems = row.data.items || [];
            break;
          case 'shopping':
            cache.shoppingItems = row.data.items || [];
            break;
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Save single document
  async function saveDoc(docId, data) {
    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ id: docId, data, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error saving:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving:', error);
      return false;
    }
  }

  // ===== TRANSACTIONS =====
  function getTransactions() {
    return [...cache.transactions];
  }

  async function addTransaction(trans) {
    trans.id = Date.now() + Math.floor(Math.random() * 1000);
    cache.transactions.push(trans);
    return await saveDoc('transactions', { items: cache.transactions });
  }

  async function updateTransaction(id, updates) {
    const idx = cache.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    cache.transactions[idx] = { ...cache.transactions[idx], ...updates };
    return await saveDoc('transactions', { items: cache.transactions });
  }

  async function deleteTransaction(id) {
    cache.transactions = cache.transactions.filter(t => t.id !== id);
    return await saveDoc('transactions', { items: cache.transactions });
  }

  // ===== FUNDS =====
  function getFunds() {
    return [...cache.funds];
  }

  async function updateFunds(funds) {
    cache.funds = funds;
    return await saveDoc('funds', { items: funds });
  }

  async function updateSingleFund(fundId, updates) {
    const idx = cache.funds.findIndex(f => f.id === fundId);
    if (idx === -1) return false;
    cache.funds[idx] = { ...cache.funds[idx], ...updates };
    return await saveDoc('funds', { items: cache.funds });
  }

  // ===== BUDGET =====
  function getBudgetIncome() {
    return { ...cache.budgetIncome };
  }

  function getBudgetExpense() {
    return { ...cache.budgetExpense };
  }

  async function updateBudget(budgetIncome, budgetExpense) {
    cache.budgetIncome = budgetIncome;
    cache.budgetExpense = budgetExpense;
    return await saveDoc('budget', { income: budgetIncome, expense: budgetExpense });
  }

  async function setBudgetIncome(data) {
    cache.budgetIncome = data;
    return await saveDoc('budget', { income: data, expense: cache.budgetExpense });
  }

  async function setBudgetExpense(data) {
    cache.budgetExpense = data;
    return await saveDoc('budget', { income: cache.budgetIncome, expense: data });
  }

  // ===== CATEGORIES =====
  function getIncomeCats() {
    return [...cache.incomeCats];
  }

  function getExpenseCats() {
    return [...cache.expenseCats];
  }

  async function updateCategories(incomeCats, expenseCats) {
    cache.incomeCats = incomeCats;
    cache.expenseCats = expenseCats;
    return await saveDoc('categories', { income: incomeCats, expense: expenseCats });
  }

  // ===== PIC =====
  function getPicData() {
    return { ...cache.picData };
  }

  async function updatePicData(picData) {
    cache.picData = picData;
    return await saveDoc('pic', { data: picData });
  }

  // ===== PRIORITAS =====
  function getPrioritasData() {
    return { ...cache.prioritasData };
  }

  async function updatePrioritasData(prioritasData) {
    cache.prioritasData = prioritasData;
    return await saveDoc('prioritas', { data: prioritasData });
  }

  // ===== ADD FUND =====
  async function addFund(id, name, desc, target) {
    const newFund = { id: id, name: name || id, desc: desc || '', target: target || '', saldoAwal: 0, saldo: 0, balance: 0, startBalance: 0 };
    cache.funds.push(newFund);
    return await saveDoc('funds', { items: cache.funds });
  }

  // ===== ADD INCOME CATEGORY =====
  async function addIncomeCategory(name) {
    cache.incomeCats.push(name);
    return await updateCategories(cache.incomeCats, cache.expenseCats);
  }

  // ===== ADD EXPENSE CATEGORY =====
  async function addExpenseCategory(name, pic, prio) {
    cache.expenseCats.push(name);
    if (pic) cache.picData[name] = pic;
    if (prio) cache.prioritasData[name] = prio;
    await updateCategories(cache.incomeCats, cache.expenseCats);
    await updatePicData(cache.picData);
    await updatePrioritasData(cache.prioritasData);
    return true;
  }

  // ===== HELPERS =====
  function getCache() {
    return cache;
  }

  function setCache(newCache) {
    cache = { ...cache, ...newCache };
  }

  // ===== FORMAT HELPERS =====
  function formatRp(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseDate(str) {
    if (!str) return new Date();
    return new Date(str);
  }

  function formatDateDisplay(str) {
    const d = parseDate(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function getMonth(str) {
    const d = parseDate(str);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function isCurrentMonth(str) {
    const now = new Date();
    return getMonth(str) === (now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));
  }

  function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // ===== UPDATE FUNDS FROM TRANSACTIONS =====
  function updateFundsFromTransactions() {
    // Reset all fund saldos to saldoAwal
    cache.funds.forEach(f => { 
      f.saldo = f.saldoAwal || 0;
      f.balance = f.saldoAwal || 0;
    });

    // Apply transactions
    cache.transactions.forEach(t => {
      if (t.jenis === 'Masuk') {
        const fund = cache.funds.find(f => f.id === t.posAsal);
        if (fund) { fund.saldo += t.nominal; fund.balance = fund.saldo; }
      } else if (t.jenis === 'Keluar') {
        const fund = cache.funds.find(f => f.id === t.posAsal);
        if (fund) { fund.saldo -= t.nominal; fund.balance = fund.saldo; }
      } else if (t.jenis === 'Pindah') {
        const from = cache.funds.find(f => f.id === t.posAsal);
        const to = cache.funds.find(f => f.id === t.posTujuan);
        if (from) { from.saldo -= t.nominal; from.balance = from.saldo; }
        if (to) { to.saldo += t.nominal; to.balance = to.saldo; }
      }
    });
  }

  // ===== GET CURRENT MONTH TOTALS =====
  function getCurrentMonthTotals() {
    const current = new Date();
    const month = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0');
    let totalIncome = 0, totalExpense = 0;
    cache.transactions.forEach(t => {
      if (getMonth(t.tanggal) === month) {
        if (t.jenis === 'Masuk') totalIncome += t.nominal;
        else if (t.jenis === 'Keluar') totalExpense += t.nominal;
      }
    });
    return { totalIncome, totalExpense, sisa: totalIncome - totalExpense };
  }

  // ===== GET EXPENSE BY CATEGORY =====
  function getExpenseByCategory() {
    const current = new Date();
    const month = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0');
    const result = {};
    cache.transactions.forEach(t => {
      if (t.jenis === 'Keluar' && getMonth(t.tanggal) === month) {
        result[t.kategori] = (result[t.kategori] || 0) + t.nominal;
      }
    });
    return result;
  }

  // ===== GET INCOME BY CATEGORY =====
  function getIncomeByCategory() {
    const current = new Date();
    const month = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0');
    const result = {};
    cache.transactions.forEach(t => {
      if (t.jenis === 'Masuk' && getMonth(t.tanggal) === month) {
        result[t.kategori] = (result[t.kategori] || 0) + t.nominal;
      }
    });
    return result;
  }

  // ===== STOCK ITEMS =====
  function getStockItems() {
    return [...cache.stockItems];
  }

  async function addStockItem(item) {
    item.id = Date.now() + Math.floor(Math.random() * 1000);
    cache.stockItems.push(item);
    return await saveDoc('stock', { items: cache.stockItems });
  }

  async function updateStockItem(id, updates) {
    const idx = cache.stockItems.findIndex(s => s.id === id);
    if (idx === -1) return false;
    cache.stockItems[idx] = { ...cache.stockItems[idx], ...updates };
    return await saveDoc('stock', { items: cache.stockItems });
  }

  async function deleteStockItem(id) {
    cache.stockItems = cache.stockItems.filter(s => s.id !== id);
    return await saveDoc('stock', { items: cache.stockItems });
  }

  // ===== SHOPPING LIST =====
  function getShoppingItems() {
    return [...cache.shoppingItems];
  }

  async function addShoppingItem(item) {
    item.id = Date.now() + Math.floor(Math.random() * 1000);
    item.checked = false;
    item.createdAt = new Date().toISOString();
    cache.shoppingItems.push(item);
    return await saveDoc('shopping', { items: cache.shoppingItems });
  }

  async function updateShoppingItem(id, updates) {
    const idx = cache.shoppingItems.findIndex(s => s.id === id);
    if (idx === -1) return false;
    cache.shoppingItems[idx] = { ...cache.shoppingItems[idx], ...updates };
    return await saveDoc('shopping', { items: cache.shoppingItems });
  }

  async function deleteShoppingItem(id) {
    cache.shoppingItems = cache.shoppingItems.filter(s => s.id !== id);
    return await saveDoc('shopping', { items: cache.shoppingItems });
  }

  async function resetShoppingList() {
    cache.shoppingItems = [];
    return await saveDoc('shopping', { items: [] });
  }

  return {
    loadAllData,
    saveDoc,
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFunds,
    updateFunds,
    updateSingleFund,
    addFund,
    getBudgetIncome,
    getBudgetExpense,
    updateBudget,
    setBudgetIncome,
    setBudgetExpense,
    getIncomeCats,
    getExpenseCats,
    updateCategories,
    addIncomeCategory,
    addExpenseCategory,
    getPicData,
    updatePicData,
    getPrioritasData,
    updatePrioritasData,
    getCache,
    setCache,
    formatRp,
    parseDate,
    formatDateDisplay,
    getMonth,
    isCurrentMonth,
    generateId,
    updateFundsFromTransactions,
    getCurrentMonthTotals,
    getExpenseByCategory,
    getIncomeByCategory,
    getStockItems,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    getShoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    resetShoppingList
  };
})();
