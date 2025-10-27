// Fix Incorrect Total Fees (String Concatenation Issue)
// Run this ONCE to fix students with incorrectly calculated fees

import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * This script fixes incorrect fees caused by string concatenation
 * Example: "1600" + "6000" = "16006000" instead of 1600 + 6000 = 7600
 */
export const fixIncorrectFees = async () => {
  try {
    console.log("🔍 Starting fee correction...");
    
    // Get all students with payments
    const usersSnapshot = await getDocs(collection(db, "users"));
    const paymentsSnapshot = await getDocs(collection(db, "payments"));
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Skip admin users
      if (userData.role === "admin") {
        skippedCount++;
        continue;
      }
      
      // Get all successful payments for this student
      const studentPayments = [];
      paymentsSnapshot.forEach((payDoc) => {
        const payment = payDoc.data();
        if (payment.studentId === userId && payment.status === "success") {
          studentPayments.push(payment);
        }
      });
      
      if (studentPayments.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Calculate correct total fee
      const correctTotalFee = studentPayments.reduce((sum, payment) => {
        return sum + Number(payment.amount || 0);
      }, 0);
      
      const currentFee = Number(userData.fee || 0);
      
      // Check if fee is incorrect (suspiciously high or doesn't match payment sum)
      const isIncorrect = currentFee > 100000 || // Suspiciously high
                          (currentFee !== correctTotalFee && studentPayments.length > 0);
      
      if (isIncorrect) {
        console.log(`🔧 Fixing fee for ${userData.name || userId}:`);
        console.log(`   Current (incorrect): ₹${currentFee}`);
        console.log(`   Correct total: ₹${correctTotalFee}`);
        console.log(`   Payments: ${studentPayments.length} payment(s)`);
        
        await updateDoc(doc(db, "users", userId), {
          fee: correctTotalFee
        });
        
        fixedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log("\n✅ Fee correction complete!");
    console.log(`   Fixed: ${fixedCount} students`);
    console.log(`   Skipped: ${skippedCount} students (already correct or no payments)`);
    
    return {
      success: true,
      fixed: fixedCount,
      skipped: skippedCount
    };
    
  } catch (error) {
    console.error("❌ Error fixing fees:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

