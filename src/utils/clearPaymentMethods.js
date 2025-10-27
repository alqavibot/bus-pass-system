// src/utils/clearPaymentMethods.js
// Quick utility to clear payment method field from all users

import { db } from '../firebase/config';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

export const clearAllPaymentMethods = async () => {
  try {
    console.log('🧹 Starting payment method cleanup...');
    
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    if (usersSnapshot.empty) {
      console.log('ℹ️ No users found.');
      return { success: true, updated: 0 };
    }

    console.log(`📊 Found ${usersSnapshot.size} users to check...`);

    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    let usersUpdated = 0;

    usersSnapshot.docs.forEach((document) => {
      const userData = document.data();
      
      // Only update if user has paymentMethod field
      if (userData.paymentMethod !== undefined && userData.paymentMethod !== null) {
        currentBatch.update(doc(db, 'users', document.id), {
          paymentMethod: null,
        });
        
        operationCount++;
        usersUpdated++;

        if (operationCount === 500) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      }
    });

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    if (batches.length > 0) {
      await Promise.all(batches.map(batch => batch.commit()));
      console.log(`✅ Successfully cleared payment method from ${usersUpdated} user profiles!`);
    } else {
      console.log('ℹ️ No users had payment method set.');
    }

    return { 
      success: true, 
      updated: usersUpdated,
      message: `Cleared payment method from ${usersUpdated} user profiles!`
    };

  } catch (error) {
    console.error('❌ Error clearing payment methods:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

