/* ============================================
   Our Financial Planner - Data Layer (Wrapper)
   Delegates to SupabaseData
   ============================================ */

const AppData = (() => {
  'use strict';

  return {
    getTransactions: () => SupabaseData.getTransactions(),
    addTransaction: (trans) => SupabaseData.addTransaction(trans),
    updateTransaction: (id, updates) => SupabaseData.updateTransaction(id, updates),
    deleteTransaction: (id) => SupabaseData.deleteTransaction(id),
    
    getFunds: () => SupabaseData.getFunds(),
    updateFunds: (funds) => SupabaseData.updateFunds(funds),
    addFund: (fund) => SupabaseData.addFund(fund),
    
    getBudgetIncome: () => SupabaseData.getBudgetIncome(),
    getBudgetExpense: () => SupabaseData.getBudgetExpense(),
    setBudgetIncome: (data) => SupabaseData.setBudgetIncome(data),
    setBudgetExpense: (data) => SupabaseData.setBudgetExpense(data),
    
    getIncomeCategories: () => SupabaseData.getIncomeCats(),
    getExpenseCategories: () => SupabaseData.getExpenseCats(),
    addCategory: (type, name) => SupabaseData.updateCategories(
      type === 'income' ? [...SupabaseData.getIncomeCats(), name] : SupabaseData.getIncomeCats(),
      type === 'expense' ? [...SupabaseData.getExpenseCats(), name] : SupabaseData.getExpenseCats()
    ),
    addIncomeCategory: (name) => SupabaseData.addIncomeCategory(name),
    addExpenseCategory: (name, pic, prio) => SupabaseData.addExpenseCategory(name, pic, prio),
    
    getPIC: (cat) => SupabaseData.getPicData()[cat] || 'Vina/Henry',
    getPrioritas: (cat) => SupabaseData.getPrioritasData()[cat] || 'Boleh',
    setPIC: (cat, val) => {
      const pics = SupabaseData.getPicData();
      pics[cat] = val;
      SupabaseData.updatePicData(pics);
    },
    setPrioritas: (cat, val) => {
      const prios = SupabaseData.getPrioritasData();
      prios[cat] = val;
      SupabaseData.updatePrioritasData(prios);
    },
    
    formatRp: (amount) => SupabaseData.formatRp(amount),
    parseDate: (str) => SupabaseData.parseDate(str),
    formatDateDisplay: (str) => SupabaseData.formatDateDisplay(str),
    getMonth: (str) => SupabaseData.getMonth(str),
    isCurrentMonth: (str) => SupabaseData.isCurrentMonth(str),
    generateId: () => SupabaseData.generateId(),
    updateFundsFromTransactions: () => SupabaseData.updateFundsFromTransactions(),
    getCurrentMonthTotals: () => SupabaseData.getCurrentMonthTotals(),
    getExpenseByCategory: () => SupabaseData.getExpenseByCategory(),
    getIncomeByCategory: () => SupabaseData.getIncomeByCategory(),
    
    getStockItems: () => SupabaseData.getStockItems(),
    addStockItem: (item) => SupabaseData.addStockItem(item),
    updateStockItem: (id, updates) => SupabaseData.updateStockItem(id, updates),
    deleteStockItem: (id) => SupabaseData.deleteStockItem(id),
    
    getShoppingItems: () => SupabaseData.getShoppingItems(),
    addShoppingItem: (item) => SupabaseData.addShoppingItem(item),
    updateShoppingItem: (id, updates) => SupabaseData.updateShoppingItem(id, updates),
    deleteShoppingItem: (id) => SupabaseData.deleteShoppingItem(id),
    resetShoppingList: () => SupabaseData.resetShoppingList()
  };
})();
