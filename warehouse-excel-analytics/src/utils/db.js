const DB_NAME = 'ReplAnalyticsDB3';
const STORE_DATA = 'wms_data';
const STORE_UXC = 'uxc_mapping';

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA, { keyPath: 'tareaAlmacen' });
      }
      if (!db.objectStoreNames.contains(STORE_UXC)) {
        db.createObjectStore(STORE_UXC, { keyPath: 'producto' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveWmsRows(rows) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DATA, 'readwrite');
    const store = tx.objectStore(STORE_DATA);
    rows.forEach(row => store.put(row)); 
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllWmsRows() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DATA, 'readonly');
    const store = tx.objectStore(STORE_DATA);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUxcMapping(mappingObj) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_UXC, 'readwrite');
    const store = tx.objectStore(STORE_UXC);
    Object.keys(mappingObj).forEach(prod => {
      store.put({ producto: prod, factor: mappingObj[prod] });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUxcMapping() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_UXC, 'readonly');
    const store = tx.objectStore(STORE_UXC);
    const request = store.getAll();
    request.onsuccess = () => {
      const mapping = {};
      request.result.forEach(item => {
        mapping[item.producto] = item.factor;
      });
      resolve(mapping);
    };
    request.onerror = () => reject(request.error);
  });
}