/* ============================================
   Firebase Data Export Script
   Run this in browser console while logged in
   to export all data from Firestore
   ============================================ */

// This script exports all data from Firestore to a JSON file
// Run it in the browser console when logged into the app

async function exportFirestoreData() {
  console.log('Starting Firestore data export...');
  
  // Get the current user
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('No user logged in!');
    return;
  }
  
  console.log('User:', user.uid);
  
  const db = firebase.firestore();
  const userDoc = db.collection('users').doc(user.uid);
  
  const exportData = {
    userId: user.uid,
    exportDate: new Date().toISOString(),
    data: {}
  };
  
  // Get all data subcollections
  const dataCollections = ['funds', 'transactions', 'budget', 'categories', 'pic', 'prioritas'];
  
  for (const collName of dataCollections) {
    try {
      const doc = await userDoc.collection('data').doc(collName).get();
      if (doc.exists) {
        exportData.data[collName] = doc.data();
        console.log(`Exported ${collName}:`, doc.data());
      }
    } catch (error) {
      console.error(`Error exporting ${collName}:`, error);
    }
  }
  
  // Convert to JSON string
  const jsonStr = JSON.stringify(exportData, null, 2);
  
  // Create download link
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financial-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Export complete! Check your downloads folder.');
  return exportData;
}

// Run the export
exportFirestoreData();
