import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPC5Xx0TOrLzI3H0Nd2emBl-QM8r0Muzo",
  authDomain: "wms-analytics-repl.firebaseapp.com",
  projectId: "wms-analytics-repl",
  storageBucket: "wms-analytics-repl.firebasestorage.app",
  messagingSenderId: "663619218105",
  appId: "1:663619218105:web:8fbf3dfe8b3bd0eb430968"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveWmsRows(rows) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += 500) {
    chunks.push(rows.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const r of chunk) {
      const docRef = doc(db, "wms_data", String(r.tareaAlmacen));
      batch.set(docRef, r, { merge: true });
    }
    await batch.commit();
  }
  return true;
}

export async function getAllWmsRows() {
  const querySnapshot = await getDocs(collection(db, "wms_data"));
  const rows = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.fechaConf && data.fechaConf.toDate) {
      data.fechaConf = data.fechaConf.toDate();
    }
    rows.push(data);
  });
  return rows;
}

export async function saveUxcMapping(mapping) {
  const docRef = doc(db, "config", "uxc_mapping");
  await setDoc(docRef, { data: mapping });
  return true;
}

export async function getUxcMapping() {
  const docRef = doc(db, "config", "uxc_mapping");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().data || {};
  }
  return {};
}

export async function clearAllWmsData() {
  const querySnapshot = await getDocs(collection(db, "wms_data"));
  const chunks = [];
  let currentChunk = [];
  
  querySnapshot.forEach((doc) => {
    currentChunk.push(doc.ref);
    if (currentChunk.length === 500) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  });
  if (currentChunk.length > 0) chunks.push(currentChunk);

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const ref of chunk) {
      batch.delete(ref);
    }
    await batch.commit();
  }
  return true;
}
