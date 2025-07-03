// src/utils/firestoreUtils.js
import { db } from '../services/firebaseConfig.js';

// Lee todos los documentos de una colección
export async function getDocsByCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Lee un documento por su ID
export async function getDocById(collectionName, id) {
  const docRef = db.collection(collectionName).doc(id);
  const snap = await docRef.get();
  return { id: snap.id, ...snap.data() };
}

// Agrega un documento nuevo
export async function addDocument(collectionName, data) {
  await db.collection(collectionName).add(data);
}

// Actualiza un documento existente
export async function updateDocument(collectionName, id, data) {
  await db.collection(collectionName).doc(id).update(data);
}

// Elimina un documento
export async function deleteDocument(collectionName, id) {
  await db.collection(collectionName).doc(id).delete();
}
