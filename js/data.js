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
    generateId: () => SupabaseData.generateId()
  };
})();
