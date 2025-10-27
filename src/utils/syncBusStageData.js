// src/utils/syncBusStageData.js
// Utility to sync bus and stage data from passes collection to users collection

import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

export const syncBusStageData = async () => {
  try {
    console.log('🔄 Starting complete payment data sync (bus, stage, fees, payment method)...');
    
    // Get all passes
    const passesSnap = await getDocs(collection(db, 'passes'));
    
    if (passesSnap.empty) {
      console.log('ℹ️ No passes found.');
      return { success: true, updated: 0 };
    }

    console.log(`📊 Found ${passesSnap.size} passes to check...`);

    let updated = 0;
    let skipped = 0;

    for (const passDoc of passesSnap.docs) {
      const passData = passDoc.data();
      const studentId = passData.studentId;
      
      if (!studentId) {
        console.log('⚠️ Skipping pass without studentId');
        skipped++;
        continue;
      }

      // Check if pass has bus and stage info
      if (!passData.busNumber || !passData.stage) {
        console.log(`⚠️ Skipping ${studentId} - pass missing bus/stage data`);
        skipped++;
        continue;
      }

      try {
        // Get all payments for this student to calculate total fee
        const paymentsSnap = await getDocs(
          query(
            collection(db, 'payments'),
            where('studentId', '==', studentId),
            where('status', '==', 'success')
          )
        );

        let totalFee = 0;
        let lastPaymentAmount = 0;
        let lastPaymentDate = null;
        let paymentMethod = null;

        paymentsSnap.forEach((paymentDoc) => {
          const payment = paymentDoc.data();
          totalFee += Number(payment.amount || 0);
          
          // Keep track of the most recent payment
          if (!lastPaymentDate || payment.paidAt?.toDate() > lastPaymentDate) {
            lastPaymentAmount = Number(payment.amount || 0);
            lastPaymentDate = payment.paidAt?.toDate() || null;
            paymentMethod = passData.paymentMethod || null;
          }
        });

        // Update user profile with complete payment data
        await setDoc(
          doc(db, 'users', studentId),
          {
            busNumber: passData.busNumber,
            busId: passData.busId || null,
            stage: passData.stage,
            stageId: passData.stageId || null,
            fee: totalFee,
            lastPaymentAmount: lastPaymentAmount,
            lastPaymentDate: lastPaymentDate,
            paymentMethod: passData.paymentMethod || null,
            paymentStatus: 'success',
            passStatus: 'Issued',
          },
          { merge: true }
        );

        console.log(`✅ Synced complete payment data for student ${studentId}`);
        console.log(`   Bus: ${passData.busNumber}, Stage: ${passData.stage}`);
        console.log(`   Total Fee: ₹${totalFee}, Payment Method: ${passData.paymentMethod}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating student ${studentId}:`, error);
      }
    }

    console.log(`✅ Sync complete! Updated: ${updated}, Skipped: ${skipped}`);
    
    return { 
      success: true, 
      updated: updated,
      skipped: skipped,
      message: `Synced complete payment data for ${updated} students (${skipped} skipped)`
    };

  } catch (error) {
    console.error('❌ Error syncing complete payment data:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

