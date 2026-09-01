import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, setDoc, getDoc, deleteDoc, writeBatch } from "firebase/firestore";

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

export async function saveWmsRows(newRows) {
  // 1. Agrupamos las filas nuevas por "Día_Turno" (Ej: 2026-01-28_AM)
  const rowsByGroup = {};
  for (const r of newRows) {
    // Si por alguna razón no tiene fecha o turno, lo mandamos a un grupo "Desconocido"
    const fecha = r.fechaOpStr || "SinFecha";
    const turno = r.turno || "SinTurno";
    const groupId = `${fecha}_${turno}`;
    
    if (!rowsByGroup[groupId]) rowsByGroup[groupId] = [];
    rowsByGroup[groupId].push(r);
  }
  
  // 2. Por cada grupo, descargamos SOLO su historial, fusionamos y volvemos a subir
  for (const groupId of Object.keys(rowsByGroup)) {
    const docRef = doc(db, "wms_days", groupId);
    
    // Descargamos lo que ya existe solo de ese turno específico
    const docSnap = await getDoc(docRef);
    const existingRows = docSnap.exists() && docSnap.data().data 
      ? JSON.parse(docSnap.data().data) 
      : [];
      
    // Fusionamos para eliminar duplicados si subiste el mismo Excel dos veces
    const map = new Map();
    for (const r of existingRows) {
      map.set(String(r.tareaAlmacen), r);
    }
    for (const r of rowsByGroup[groupId]) {
      map.set(String(r.tareaAlmacen), r);
    }
    
    // Guardamos la partición en la nube
    await setDoc(docRef, { data: JSON.stringify(Array.from(map.values())) });
  }
  
  return true;
}

export async function getAllWmsRows() {
  // Al iniciar la página, traemos todas las particiones
  const querySnapshot = await getDocs(collection(db, "wms_days"));
  let rows = [];
  querySnapshot.forEach((doc) => {
    const chunkData = doc.data().data;
    if (chunkData) {
      rows = rows.concat(JSON.parse(chunkData));
    }
  });
  
  // Restaurar las fechas a formato de JavaScript
  rows.forEach(r => {
    if (r.fechaConf) {
      r.fechaConf = new Date(r.fechaConf);
    }
  });
  return rows;
}

export async function saveUxcMapping(mapping) {
  const docRef = doc(db, "config", "uxc_mapping");
  await setDoc(docRef, { data: JSON.stringify(mapping) });
  return true;
}

export async function getUxcMapping() {
  const docRef = doc(db, "config", "uxc_mapping");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data().data) {
    return JSON.parse(docSnap.data().data);
  }
  return {};
}

export async function clearAllWmsData() {
  // Borrar todas las particiones si el usuario presiona "Limpiar Nube"
  const querySnapshot = await getDocs(collection(db, "wms_days"));
  const batch = writeBatch(db);
  querySnapshot.forEach((document) => {
    batch.delete(document.ref);
  });
  await batch.commit();
  return true;
}
