// Fix Student Payment and Pass Status Display
// Run this ONCE after deploying the fix to update existing student records

import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * This script updates existing student records to show proper payment and pass status
 * in the admin dashboard.
 * 
 * How it works:
 * 1. Finds all students with successful payments
 * 2. Checks if they have issued passes
 * 3. Updates their user profile with correct status fields
 */
export const fixStudentStatuses = async () => {
  try {
    console.log("🔍 Starting student status fix...");
    
    // Get all payments
    const paymentsSnapshot = await getDocs(collection(db, "payments"));
    const studentPayments = {};
    
    // Group payments by student
    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data();
      if (payment.status === "success") {
        if (!studentPayments[payment.studentId]) {
          studentPayments[payment.studentId] = [];
        }
        studentPayments[payment.studentId].push(payment);
      }
    });
    
    console.log(`📊 Found ${Object.keys(studentPayments).length} students with successful payments`);
    
    // Process each student
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const [studentId, payments] of Object.entries(studentPayments)) {
      try {
        // Check if student has a pass
        const passDoc = await getDoc(doc(db, "passes", studentId));
        
        if (passDoc.exists()) {
          // Get user document
          const userDoc = await getDoc(doc(db, "users", studentId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const passData = passDoc.data();
            
            // Calculate total paid amount
            const totalPaid = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
            
            // Only update if status fields are missing, incorrect, or fee is missing
            const needsUpdate = 
              userData.paymentStatus !== "success" || 
              userData.passStatus !== "Issued" ||
              !userData.fee ||
              userData.fee === 0 ||
              !userData.paymentMethod;
            
            if (needsUpdate) {
              const updateData = {
                paymentStatus: "success",
                passStatus: "Issued",
                fee: totalPaid, // ✅ Update total paid amount
              };
              
              // Add payment method from pass if available
              if (passData.paymentMethod) {
                updateData.paymentMethod = passData.paymentMethod;
              }
              
              await updateDoc(doc(db, "users", studentId), updateData);
              
              updatedCount++;
              console.log(`✅ Updated status and fee (₹${totalPaid}) for: ${userData.name || studentId}`);
            } else {
              skippedCount++;
              console.log(`⏭️ Skipped ${userData.name || studentId} (already correct)`);
            }
          }
        } else {
          console.log(`⚠️ Student ${studentId} has payments but no pass issued`);
        }
      } catch (error) {
        console.error(`❌ Error processing student ${studentId}:`, error);
      }
    }
    
    console.log("\n📈 Summary:");
    console.log(`   ✅ Updated: ${updatedCount} students`);
    console.log(`   ⏭️ Skipped: ${skippedCount} students (already correct)`);
    console.log(`   📊 Total processed: ${Object.keys(studentPayments).length} students`);
    console.log("\n✨ Student status fix complete!");
    
    return {
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
      total: Object.keys(studentPayments).length
    };
    
  } catch (error) {
    console.error("❌ Error fixing student statuses:", error);
    return {
      success: false,
      error: error.message
    };
  }
};


