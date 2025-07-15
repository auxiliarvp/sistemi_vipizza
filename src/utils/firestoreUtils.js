// src/utils/firestoreUtils.js

import { db } from '../services/firebaseConfig.js';
import {
  collection as getColRef,
  getDocs,
  doc as getDocRef,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/** Manejo centralizado de errores Firestore */
function handleError(op, error) {
  console.error(`Firestore ${op} error:`, error);
  throw error;
}

/** Obtiene todos los documentos de una colección */
export async function getDocsByCollection(collectionName) {
  try {
    const colRef = getColRef(db, collectionName);
    const snap   = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleError(`getDocs(${collectionName})`, e);
  }
}

/** Obtiene un documento por ID */
export async function getDocById(collectionName, id) {
  try {
    const docRef = getDocRef(db, collectionName, id);
    const snap   = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Documento no encontrado');
    return { id: snap.id, ...snap.data() };
  } catch (e) {
    handleError(`getDoc(${collectionName}/${id})`, e);
  }
}

/** Añade un documento nuevo y devuelve su ID */
export async function addDocument(collectionName, data) {
  try {
    const colRef = getColRef(db, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (e) {
    handleError(`addDoc(${collectionName})`, e);
  }
}

/** Actualiza un documento existente */
export async function updateDocument(collectionName, id, data) {
  try {
    const docRef = getDocRef(db, collectionName, id);
    await updateDoc(docRef, data);
  } catch (e) {
    handleError(`updateDoc(${collectionName}/${id})`, e);
  }
}

/** Elimina un documento por ID */
export async function deleteDocument(collectionName, id) {
  try {
    const docRef = getDocRef(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (e) {
    handleError(`deleteDoc(${collectionName}/${id})`, e);
  }
}
