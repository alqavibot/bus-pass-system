// src/services/passGenerator.js
export function generatePassToken(uid) {
  // simple but unique token for now (stored server-side in Firestore)
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${uid}-${ts}-${rand}`;
}
