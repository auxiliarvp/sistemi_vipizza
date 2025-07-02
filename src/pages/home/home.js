// src/pages/home/home.js

async function updateCounts() {
  try {
    // usa la `db` global de firebaseConfig.js en modo compat
    const [empSnap, sucSnap] = await Promise.all([
      db.collection('empresas').get(),
      db.collection('sucursales').get()
    ]);
    document.getElementById('companyCount').textContent = empSnap.size;
    document.getElementById('branchCount').textContent  = sucSnap.size;
  } catch (e) {
    console.error('Error al obtener contadores:', e);
  }
}

document.addEventListener('DOMContentLoaded', updateCounts);
