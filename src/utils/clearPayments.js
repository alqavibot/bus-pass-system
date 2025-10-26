// src/utils/clearPayments.js
// Utility script to clear all payment records from Firestore
// Run this ONCE to start fresh with new payment logic

import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

export const clearAllPayments = async () => {
  try {
    console.log('🗑️ Starting payment records cleanup...');
    
    // Get all payments
    const paymentsRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsRef);
    
    if (snapshot.empty) {
      console.log('✅ No payments found. Database is already clean.');
      return { success: true, deleted: 0 };
    }

    console.log(`📊 Found ${snapshot.size} payment records to delete...`);

    // Use batch for efficient deletion (max 500 per batch)
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    let batchCount = 0;

    snapshot.docs.forEach((document) => {
      currentBatch.delete(doc(db, 'payments', document.id));
      operationCount++;

      // Firestore batch limit is 500 operations
      if (operationCount === 500) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
        batchCount++;
      }
    });

    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
      batchCount++;
    }

    // Commit all batches
    console.log(`📦 Committing ${batchCount} batch(es)...`);
    await Promise.all(batches.map(batch => batch.commit()));

    console.log(`✅ Successfully deleted ${snapshot.size} payment records!`);
    
    return { 
      success: true, 
      deleted: snapshot.size,
      message: `Deleted ${snapshot.size} payment records successfully!`
    };

  } catch (error) {
    console.error('❌ Error clearing payments:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Optional: Clear payment data AND reset passes to "not issued" status
export const clearPaymentsAndResetPasses = async () => {
  try {
    console.log('🗑️ Starting full cleanup (payments + passes)...');
    
    // Step 1: Clear all payments
    const paymentResult = await clearAllPayments();
    
    if (!paymentResult.success) {
      return paymentResult;
    }

    // Step 2: Delete all pass documents
    console.log('🔄 Deleting all pass documents...');
    const passesRef = collection(db, 'passes');
    const passesSnapshot = await getDocs(passesRef);

    let passesDeleted = 0;

    if (!passesSnapshot.empty) {
      console.log(`📊 Found ${passesSnapshot.size} passes to delete...`);

      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      passesSnapshot.docs.forEach((document) => {
        // Delete the pass document entirely
        currentBatch.delete(doc(db, 'passes', document.id));
        operationCount++;
        passesDeleted++;

        if (operationCount === 500) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      await Promise.all(batches.map(batch => batch.commit()));
      console.log(`✅ Successfully deleted ${passesDeleted} pass documents!`);
    } else {
      console.log('ℹ️ No pass documents found.');
    }

    // Step 3: Clear pass-related fields from all user profiles
    console.log('🔄 Clearing pass fields from user profiles...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    let usersUpdated = 0;

    if (!usersSnapshot.empty) {
      console.log(`📊 Found ${usersSnapshot.size} users to update...`);

      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      usersSnapshot.docs.forEach((document) => {
        const userData = document.data();
        
        // Only update if user has pass-related fields
        if (userData.busNumber || userData.busId || userData.stage || 
            userData.stageId || userData.fee || userData.passStatus || 
            userData.paymentStatus) {
          
          // Update user document to remove pass-related fields
          currentBatch.update(doc(db, 'users', document.id), {
            busNumber: null,
            busId: null,
            stage: null,
            stageId: null,
            fee: null,
            passStatus: null,
            paymentStatus: null,
            lastPaymentAmount: null,
            lastPaymentDate: null,
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

      await Promise.all(batches.map(batch => batch.commit()));
      console.log(`✅ Successfully cleared pass fields from ${usersUpdated} user profiles!`);
    } else {
      console.log('ℹ️ No users found.');
    }

    return { 
      success: true, 
      deleted: paymentResult.deleted,
      passesDeleted: passesDeleted,
      usersUpdated: usersUpdated,
      message: `Deleted ${paymentResult.deleted} payments, ${passesDeleted} passes, and cleared pass data from ${usersUpdated} user profiles!`
    };

  } catch (error) {
    console.error('❌ Error in full cleanup:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

