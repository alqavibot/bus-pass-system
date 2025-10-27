// src/utils/syncBusStageData.js
// Utility to sync bus and stage data from passes collection to users collection

import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const syncBusStageData = async () => {
  try {
    console.log('🔄 Starting bus & stage data sync...');
    
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
        // Update user profile with bus and stage from their pass
        await setDoc(
          doc(db, 'users', studentId),
          {
            busNumber: passData.busNumber,
            busId: passData.busId || null,
            stage: passData.stage,
            stageId: passData.stageId || null,
          },
          { merge: true }
        );

        console.log(`✅ Synced bus & stage for student ${studentId}`);
        console.log(`   Bus: ${passData.busNumber}, Stage: ${passData.stage}`);
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
      message: `Synced bus & stage data for ${updated} students (${skipped} skipped)`
    };

  } catch (error) {
    console.error('❌ Error syncing bus & stage data:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

