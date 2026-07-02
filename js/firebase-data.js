/* ============================================
   Firebase Data Layer (Firestore)
   Replaces localStorage with cloud database
   ============================================ */
const FirebaseData = (() => {
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
    prioritasData: {}
  };

  // Get user's document reference
  // Uses a fixed family ID since we have a shared password gate
  function getUserDoc() {
    const familyId = 'family_vh_2024';
    return db.collection('users').doc(familyId);
  }

  // Initialize user data (first time)
  async function initializeUserData() {
    const userDoc = getUserDoc();
    if (!userDoc) return false;

    const doc = await userDoc.get();
    if (doc.exists) return false; // Already initialized

    // Set default data
    await userDoc.set({
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName: auth.currentUser.displayName || auth.currentUser.email
    });

    // Initialize subcollections with defaults
    await initializeDefaultData(userDoc);
    return true;
  }

  // Set default data for new user
  async function initializeDefaultData(userDoc) {
    const defaultFunds = [
      { id: 'Blu', name: 'Blu', desc: 'Rekening transaksi harian', balance: 1562988.15, startBalance: 1562988.15, target: '' },
      { id: 'Comfort Life', name: 'Comfort Life', desc: 'Dana darurat', balance: 664469.31, startBalance: 664469.31, target: '' },
      { id: 'Hiroshi', name: 'Hiroshi', desc: 'Tabungan Hiro', balance: 4715292.39, startBalance: 4715292.39, target: '' },
      { id: 'Education', name: 'Education', desc: 'Tabungan pendidikan', balance: 401464.36, startBalance: 401464.36, target: '' },
      { id: "Hiro's Room", name: "Hiro's Room", desc: 'Tabungan kamar/ruang Hiro', balance: 401464.36, startBalance: 401464.36, target: '' },
      { id: 'Fidyah', name: 'Fidyah', desc: 'Dana sosial/amal', balance: 301098.27, startBalance: 301098.27, target: '' },
      { id: 'HBD hiro', name: 'HBD hiro', desc: 'Tabungan HBD Hiro', balance: 300000.00, startBalance: 300000.00, target: '' },
      { id: 'E-money', name: 'E-money', desc: 'GoPay/OVO/dll', balance: 97598.00, startBalance: 97598.00, target: '' },
      { id: 'Cash', name: 'Cash', desc: 'Uang tunai fisik', balance: 9000.00, startBalance: 9000.00, target: '' }
    ];

    const defaultIncomeCats = ['Paycheck', 'Interest', 'Repayment', 'Gifts', 'Other'];
    const defaultExpenseCats = [
      'Food', 'Groceries', 'Health & Medical', 'Home', 'Travel Expenses',
      'Utilities', 'Phone Credit', 'Entertainment', 'Skin & Body Care',
      "Hiroshi's", "Mpi's", "Henry's", 'Gifts', 'Public Transportation',
      'Event', 'Loan', 'Debt', 'Zakat', 'Admin Fee', 'Other'
    ];

    const defaultPic = {
      'Food': 'Vina/Henry', 'Groceries': 'Vina', 'Health & Medical': 'Vina',
      'Home': 'Henry', 'Travel Expenses': 'Henry', 'Utilities': 'Henry',
      'Phone Credit': 'Vina/Henry', 'Entertainment': 'Vina/Henry',
      'Skin & Body Care': 'Vina', "Hiroshi's": 'Vina', "Mpi's": 'Vina',
      "Henry's": 'Henry', 'Gifts': 'Vina/Henry', 'Public Transportation': 'Henry',
      'Event': 'Vina/Henry', 'Loan': 'Henry', 'Debt': 'Henry',
      'Zakat': 'Henry', 'Admin Fee': 'Henry', 'Other': 'Vina/Henry'
    };

    const defaultPrioritas = {
      'Food': 'Wajib', 'Groceries': 'Wajib', 'Health & Medical': 'Wajib',
      'Home': 'Wajib', 'Travel Expenses': 'Wajib', 'Utilities': 'Wajib',
      'Phone Credit': 'Wajib', 'Entertainment': 'Boleh', 'Skin & Body Care': 'Boleh',
      "Hiroshi's": 'Wajib', "Mpi's": 'Wajib', "Henry's": 'Wajib',
      'Gifts': 'Boleh', 'Public Transportation': 'Wajib', 'Event': 'Boleh',
      'Loan': 'Wajib', 'Debt': 'Wajib', 'Zakat': 'Wajib', 'Admin Fee': 'Wajib', 'Other': 'Boleh'
    };

    const batch = db.batch();

    // Save funds
    const fundsRef = userDoc.collection('data').doc('funds');
    batch.set(fundsRef, { items: defaultFunds });

    // Save categories
    const catsRef = userDoc.collection('data').doc('categories');
    batch.set(catsRef, {
      income: defaultIncomeCats,
      expense: defaultExpenseCats
    });

    // Save PIC
    const picRef = userDoc.collection('data').doc('pic');
    batch.set(picRef, { data: defaultPic });

    // Save Prioritas
    const prioRef = userDoc.collection('data').doc('prioritas');
    batch.set(prioRef, { data: defaultPrioritas });

    // Save empty budget
    const budgetRef = userDoc.collection('data').doc('budget');
    const budgetIncome = {};
    const budgetExpense = {};
    defaultIncomeCats.forEach(c => budgetIncome[c] = 0);
    defaultExpenseCats.forEach(c => budgetExpense[c] = 0);
    batch.set(budgetRef, { income: budgetIncome, expense: budgetExpense });

    // Save empty transactions
    const transRef = userDoc.collection('data').doc('transactions');
    batch.set(transRef, { items: [] });

    await batch.commit();
  }

  // Load all data from Firestore
  async function loadAllData() {
    const userDoc = getUserDoc();
    if (!userDoc) return;

    try {
      // First try to load from family ID
      let dataSnapshot = await userDoc.collection('data').get();
      
      // If no data exists under family ID, check for migration
      if (dataSnapshot.empty) {
        console.log('No data found under family ID, checking for migration...');
        
        // Try to find existing user data
        const usersSnapshot = await db.collection('users').get();
        let oldUserDoc = null;
        
        usersSnapshot.forEach(doc => {
          // Skip the family ID doc
          if (doc.id !== 'family_vh_2024') {
            oldUserDoc = doc.ref;
          }
        });
        
        if (oldUserDoc) {
          console.log('Found old user data, migrating...');
          const oldSnapshot = await oldUserDoc.collection('data').get();
          
          if (!oldSnapshot.empty) {
            // Copy data from old user to family ID
            const batch = db.batch();
            oldSnapshot.forEach(doc => {
              const newRef = userDoc.collection('data').doc(doc.id);
              batch.set(newRef, doc.data());
            });
            await batch.commit();
            
            // Load the newly migrated data
            dataSnapshot = await userDoc.collection('data').get();
            console.log('Migration complete! Data moved to family ID.');
          }
        }
      }
      
      dataSnapshot.forEach(doc => {
        const data = doc.data();
        switch (doc.id) {
          case 'funds':
            cache.funds = data.items || [];
            break;
          case 'transactions':
            cache.transactions = data.items || [];
            break;
          case 'budget':
            cache.budgetIncome = data.income || {};
            cache.budgetExpense = data.expense || {};
            break;
          case 'categories':
            cache.incomeCats = data.income || [];
            cache.expenseCats = data.expense || [];
            break;
          case 'pic':
            cache.picData = data.data || {};
            break;
          case 'prioritas':
            cache.prioritasData = data.data || {};
            break;
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Save single document
  async function saveDoc(docId, data) {
    const userDoc = getUserDoc();
    if (!userDoc) return false;
    
    try {
      await userDoc.collection('data').doc(docId).set(data, { merge: true });
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
    await saveDoc('transactions', { items: cache.transactions });
    return trans;
  }

  async function updateTransaction(id, updates) {
    const idx = cache.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    cache.transactions[idx] = { ...cache.transactions[idx], ...updates };
    await saveDoc('transactions', { items: cache.transactions });
    return true;
  }

  async function deleteTransaction(id) {
    cache.transactions = cache.transactions.filter(t => t.id !== id);
    await saveDoc('transactions', { items: cache.transactions });
    return true;
  }

  // ===== FUNDS =====
  function getFunds() {
    return [...cache.funds];
  }

  async function updateFunds(funds) {
    cache.funds = funds;
    await saveDoc('funds', { items: funds });
  }

  async function addFund(fund) {
    cache.funds.push(fund);
    await saveDoc('funds', { items: cache.funds });
  }

  // ===== BUDGET =====
  function getBudgetIncome() {
    return { ...cache.budgetIncome };
  }

  function getBudgetExpense() {
    return { ...cache.budgetExpense };
  }

  async function setBudgetIncome(data) {
    cache.budgetIncome = data;
    await saveDoc('budget', { income: data });
  }

  async function setBudgetExpense(data) {
    cache.budgetExpense = data;
    await saveDoc('budget', { expense: data });
  }

  // ===== CATEGORIES =====
  function getIncomeCategories() {
    return [...cache.incomeCats];
  }

  function getExpenseCategories() {
    return [...cache.expenseCats];
  }

  async function addCategory(type, name) {
    if (type === 'income') {
      cache.incomeCats.push(name);
      await saveDoc('categories', { income: cache.incomeCats });
    } else {
      cache.expenseCats.push(name);
      await saveDoc('categories', { expense: cache.expenseCats });
    }
  }

  // ===== PIC & PRIORITAS =====
  function getPIC(category) {
    return cache.picData[category] || '';
  }

  function getPrioritas(category) {
    return cache.prioritasData[category] || '';
  }

  async function setPIC(category, pic) {
    cache.picData[category] = pic;
    await saveDoc('pic', { data: cache.picData });
  }

  async function setPrioritas(category, prio) {
    cache.prioritasData[category] = prio;
    await saveDoc('prioritas', { data: cache.prioritasData });
  }

  // ===== MIGRATE FROM LOCALSTORAGE =====
  async function migrateFromLocalStorage() {
    const userDoc = getUserDoc();
    if (!userDoc) return;

    // Check if already has data
    const doc = await userDoc.get();
    if (doc.exists && doc.data().migrated) return;

    // Read from localStorage
    const localTrans = JSON.parse(localStorage.getItem('finplanner_transactions') || '[]');
    const localFunds = JSON.parse(localStorage.getItem('finplanner_funds') || '[]');
    const localBudgetIncome = JSON.parse(localStorage.getItem('finplanner_budget_income') || '{}');
    const localBudgetExpense = JSON.parse(localStorage.getItem('finplanner_budget_expense') || '{}');

    // Only migrate if there's actual data
    if (localTrans.length > 0 || localFunds.length > 0) {
      const batch = db.batch();

      if (localTrans.length > 0) {
        batch.set(userDoc.collection('data').doc('transactions'), { items: localTrans });
        cache.transactions = localTrans;
      }

      if (localFunds.length > 0) {
        batch.set(userDoc.collection('data').doc('funds'), { items: localFunds });
        cache.funds = localFunds;
      }

      if (Object.keys(localBudgetIncome).length > 0) {
        batch.set(userDoc.collection('data').doc('budget'), {
          income: localBudgetIncome,
          expense: localBudgetExpense
        }, { merge: true });
        cache.budgetIncome = localBudgetIncome;
        cache.budgetExpense = localBudgetExpense;
      }

      batch.set(userDoc, { migrated: true }, { merge: true });
      await batch.commit();
    }
  }

  // ===== HELPERS =====
  function formatRp(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return 'Rp\u00a00,00';
    const fixed = amount.toFixed(2);
    const parts = fixed.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Rp\u00a0' + intPart + ',' + parts[1];
  }

  function parseDate(dateStr) {
    if (!dateStr) return new Date();
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date(dateStr);
  }

  function formatDateDisplay(dateStr) {
    const d = parseDate(dateStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function getMonth(dateStr) {
    const d = parseDate(dateStr);
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function isCurrentMonth(dateStr) {
    const d = parseDate(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // Public API
  return {
    initializeUserData,
    loadAllData,
    migrateFromLocalStorage,
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFunds,
    updateFunds,
    addFund,
    getBudgetIncome,
    getBudgetExpense,
    setBudgetIncome,
    setBudgetExpense,
    getIncomeCategories,
    getExpenseCategories,
    addCategory,
    getPIC,
    getPrioritas,
    setPIC,
    setPrioritas,
    formatRp,
    parseDate,
    formatDateDisplay,
    getMonth,
    isCurrentMonth,
    generateId
  };
})();
