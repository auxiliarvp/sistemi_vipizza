// src/pages/home/home.js

// Importa tu instancia modular de Firestore
import { db } from '../../services/firebaseConfig.js';
// Importa helper para contar documentos
import { getDocsByCollection } from '../../utils/firestoreUtils.js';

const companyCountEl = document.getElementById('companyCount');
const branchCountEl  = document.getElementById('branchCount');

async function updateCounts() {
  try {
    // Usa tu util modular para obtener arrays
    const companies = await getDocsByCollection('empresas');
    const branches  = await getDocsByCollection('sucursales');

    companyCountEl.textContent = companies.length;
    branchCountEl.textContent  = branches.length;
  } catch (e) {
    console.error('Error al obtener contadores:', e);
  }
}

window.addEventListener('DOMContentLoaded', updateCounts);
