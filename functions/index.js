const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * Callable: setAcademicYear({ year: "2025-2026" })
 * Requires auth token with `admin: true`.
 */
exports.setAcademicYear = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "Admin only.");
  }

  const newYearRaw = (data.year || "").toString().trim();
  if (!/^\d{4}\s?[-–]\s?\d{4}$/.test(newYearRaw)) {
    throw new functions.https.HttpsError("invalid-argument", "Year must be like 2025-2026.");
  }
  const newYear = newYearRaw.replace(/\s/g, ""); // normalize "2025-2026"

  const settingsRef = db.collection("settings").doc("global");
  const settingsSnap = await settingsRef.get();
  const prevYear = settingsSnap.exists ? (settingsSnap.data().currentAcademicYear || null) : null;

  // If no change, just return
  if (prevYear && prevYear === newYear) {
    return { ok: true, message: "Academic year unchanged." };
  }

  // Update settings first
  await settingsRef.set(
    {
      currentAcademicYear: newYear,
      previousAcademicYear: prevYear || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid,
    },
    { merge: true }
  );

  // Expire passes from previous year
  if (prevYear) {
    const pageSize = 400;
    let lastDoc = null;
    let expiredCount = 0;

    while (true) {
      let queryRef = db
        .collection("passes")
        .where("academicYear", "==", prevYear)
        .where("status", "in", ["active", "due"])
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(pageSize);

      if (lastDoc) queryRef = queryRef.startAfter(lastDoc);

      const snap = await queryRef.get();
      if (snap.empty) break;

      const batch = db.batch();
      snap.docs.forEach((d) => {
        batch.update(d.ref, {
          status: "expired",
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          expiredReason: "yearChange",
          expiredFromAcademicYear: prevYear,
        });
      });
      await batch.commit();

      expiredCount += snap.docs.length;
      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.size < pageSize) break;
    }

    return {
      ok: true,
      message: `Academic year set to ${newYear}. Expired ${expiredCount} passes from ${prevYear}.`,
    };
  }

  return { ok: true, message: `Academic year set to ${newYear}.` };
});
