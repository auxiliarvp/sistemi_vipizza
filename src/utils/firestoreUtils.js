// src/utils/firestoreUtils.js
import { db } from '../services/firebaseConfig.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/**
 * Obtiene todos los documentos de una colección.
 * @param {string} collectionName
 * @returns {Promise<Array<Object>>}
 */
export async function getDocsByCollection(collectionName) {
  const colRef = collection(db, collectionName);
  const snap = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene un documento por ID.
 * @param {string} collectionName
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getDocById(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() };
}

/**
 * Añade un nuevo documento a la colección.
 * @param {string} collectionName
 * @param {Object} data
 */
export async function addDocument(collectionName, data) {
  const colRef = collection(db, collectionName);
  await addDoc(colRef, data);
}

/**
 * Actualiza un documento existente.
 * @param {string} collectionName
 * @param {string} id
 * @param {Object} data
 */
export async function updateDocument(collectionName, id, data) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

/**
 * Elimina un documento por ID.
 * @param {string} collectionName
 * @param {string} id
 */
export async function deleteDocument(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}
