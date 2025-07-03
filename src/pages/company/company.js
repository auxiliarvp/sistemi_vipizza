// src/pages/company/company.js
import {
  getDocsByCollection,
  getDocById,
  addDocument,
  updateDocument,
  deleteDocument
} from '../../utils/firestoreUtils.js';

import {
  clearContainer,
  showLoader,
  showNoDataMessage,
  createCompanyCard
} from '../../utils/uiUtils.js';

import {
  confirmAction,
  showFormPrompt,
  showToastSuccess,
  showToastError
} from '../../utils/alerts.js';

import {
  groupBy,
  buildCompanyDetailHtml
} from '../../utils/helpers.js';

const cardContainer = document.getElementById('cardContainer');
const addBtn = document.getElementById('addBtn');

let companies = [];
let branchesByCompany = {};

// 1️⃣ Carga inicial de datos
async function loadData() {
  clearContainer(cardContainer);
  showLoader(cardContainer);
  try {
    companies = await getDocsByCollection('empresas');
    const branches = await getDocsByCollection('sucursales');
    branchesByCompany = groupBy(branches, b => b.empresaId);
    renderCards();
  } catch (e) {
    clearContainer(cardContainer);
    showNoDataMessage(cardContainer, 'Error cargando datos.');
    console.error(e);
  }
}

// 2️⃣ Render de tarjetas
function renderCards() {
  clearContainer(cardContainer);
  if (companies.length === 0) {
    showNoDataMessage(cardContainer, 'No hay empresas registradas.');
    return;
  }
  companies.forEach(company => {
    const count = (branchesByCompany[company.id] || []).length;
    cardContainer.appendChild(createCompanyCard(company, count));
  });
}

// 3️⃣ Delegación de eventos
cardContainer.addEventListener('click', e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'view') return viewDetails(id);
  if (action === 'edit') return openForm('edit', id);
  if (action === 'del')  return confirmDelete(id);
});

// 4️⃣ Ver detalles de una empresa
async function viewDetails(id) {
  try {
    const comp     = await getDocById('empresas', id);
    const branches = branchesByCompany[id] || [];
    const html     = buildCompanyDetailHtml(comp, branches);
    Swal.fire({ title: 'Detalles de empresa', html, width: 600 });
  } catch (e) {
    console.error(e);
    showToastError('Error obteniendo detalles');
  }
}

// 5️⃣ Abrir modal Agregar/Editar
function openForm(mode, id = '') {
  const isEdit = mode === 'edit';
  const existing = isEdit
    ? companies.find(c => c.id === id) || {}
    : { name:'', address:'', phone:'', email:'', status:'ACTIVO' };

  const inputs = `
    <input id="swal-name"    class="swal2-input" placeholder="Nombre"    value="${existing.name || ''}">
    <input id="swal-address" class="swal2-input" placeholder="Dirección" value="${existing.address || ''}">
    <input id="swal-phone"   class="swal2-input" placeholder="Teléfono"  value="${existing.phone || ''}">
    <input id="swal-email"   class="swal2-input" placeholder="Email"     value="${existing.email || ''}">
    <select id="swal-status" class="swal2-select">
      <option value="ACTIVO"${existing.status==='ACTIVO'?' selected':''}>Activo</option>
      <option value="INACTIVO"${existing.status==='INACTIVO'?' selected':''}>Inactivo</option>
    </select>`;

  showFormPrompt(isEdit ? 'Editar empresa' : 'Agregar empresa', inputs)
    .then(async data => {
      if (!data) return;
      try {
        if (isEdit) {
          await updateDocument('empresas', id, data);
          showToastSuccess('Empresa actualizada');
        } else {
          await addDocument('empresas', data);
          showToastSuccess('Empresa creada');
        }
        loadData();
      } catch (e) {
        console.error(e);
        showToastError('Error guardando');
      }
    });
}

// 6️⃣ Confirmar y eliminar
function confirmDelete(id) {
  confirmAction('¿Eliminar esta empresa?')
    .then(ok => {
      if (!ok) return;
      deleteDocument('empresas', id)
        .then(() => {
          showToastSuccess('Empresa eliminada');
          loadData();
        })
        .catch(e => {
          console.error(e);
          showToastError('Error eliminando');
        });
    });
}

// 7️⃣ Botón de agregar
addBtn.addEventListener('click', () => openForm('add'));

// 8️⃣ Inicialización
window.addEventListener('DOMContentLoaded', loadData);
