// src/pages/branches/branches.js
import {
  getDocsByCollection,
  addDocument,
  updateDocument
} from '../../utils/firestoreUtils.js';

import {
  clearContainer,
  showLoader,
  showNoDataMessage
} from '../../utils/uiUtils.js';

import {
  showFormPrompt,
  showToastSuccess,
  showToastError
} from '../../utils/alerts.js';

const params            = new URLSearchParams(window.location.search);
const companyId         = params.get('companyId');
const branchesContainer = document.getElementById('branchesContainer');
const addBranchBtn      = document.getElementById('addBranchBtn');

let companiesList = [];

/**
 * Carga la lista de empresas y sucursales.
 */
async function loadBranches() {
  clearContainer(branchesContainer);
  showLoader(branchesContainer);

  try {
    companiesList = await getDocsByCollection('empresas');

    const allBranches = await getDocsByCollection('sucursales');
    const branches    = allBranches.filter(b => b.empresaId === companyId);

    clearContainer(branchesContainer);

    if (branches.length === 0) {
      showNoDataMessage(branchesContainer, 'No hay sucursales registradas.');
      return;
    }

    branches.forEach(branch => {
      const col = createBranchCard(branch);
      // clic para editar/reasignar
      col.querySelector('.card').addEventListener('click', () => openEditBranchForm(branch));
      branchesContainer.appendChild(col);
    });
  } catch (err) {
    console.error('Error cargando sucursales:', err);
    clearContainer(branchesContainer);
    showNoDataMessage(branchesContainer, 'Error cargando sucursales.');
  }
}

/**
 * Crea la tarjeta de sucursal.
 */
function createBranchCard(branch) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';
  col.innerHTML = `
    <div
      class="card h-100"
      role="button"
      tabindex="0"
      aria-label="Editar sucursal ${branch.name}"
      style="cursor: pointer;"
    >
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">
          <i class="fas fa-store me-2"></i>${branch.name}
        </h5>
        <p class="card-text flex-grow-1">
          <i class="fas fa-map-marker-alt me-1"></i>${branch.address || '—'}
        </p>
        <span class="badge ${branch.status==='ACTIVO'?'bg-success':'bg-danger'} mt-auto">
          ${branch.status}
        </span>
      </div>
    </div>
  `;
  return col;
}

/**
 * Formulario para agregar sucursal.
 */
async function openAddBranchForm() {
  const inputs = `
    <input id="swal-name" class="swal2-input" placeholder="Nombre de sucursal">
    <input id="swal-address" class="swal2-input" placeholder="Dirección">
    <input id="swal-phone" class="swal2-input" placeholder="Teléfono (+502-0000-0000)">
    <input id="swal-email" class="swal2-input" placeholder="Email">
    <select id="swal-company" class="swal2-select">
      ${companiesList.map(c =>
        `<option value="${c.id}" ${c.id===companyId?'selected':''}>${c.name}</option>`
      ).join('')}
    </select>
    <select id="swal-status" class="swal2-select">
      <option value="ACTIVO" selected>Activo</option>
      <option value="INACTIVO">Inactivo</option>
    </select>`;

  const data = await showFormPrompt({
    title: 'Agregar sucursal',
    htmlInputs: inputs,
    confirmButtonText: 'Guardar'
  });
  if (!data) return;

  try {
    const { swalCompany, ...rest } = data;
    const doc = { ...rest, empresaId: swalCompany || companyId };
    await addDocument('sucursales', doc);
    showToastSuccess('Sucursal creada');
    loadBranches();
  } catch (err) {
    console.error('Error creando sucursal:', err);
    showToastError('Error al crear');
  }
}

/**
 * Formulario para editar/reasignar sucursal.
 */
async function openEditBranchForm(branch) {
  const inputs = `
    <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${branch.name}">
    <input id="swal-address" class="swal2-input" placeholder="Dirección" value="${branch.address}">
    <input id="swal-phone" class="swal2-input" placeholder="Teléfono" value="${branch.phone||''}">
    <input id="swal-email" class="swal2-input" placeholder="Email" value="${branch.email||''}">
    <select id="swal-company" class="swal2-select">
      ${companiesList.map(c =>
        `<option value="${c.id}" ${c.id===branch.empresaId?'selected':''}>${c.name}</option>`
      ).join('')}
    </select>
    <select id="swal-status" class="swal2-select">
      <option value="ACTIVO" ${branch.status==='ACTIVO'?'selected':''}>Activo</option>
      <option value="INACTIVO" ${branch.status==='INACTIVO'?'selected':''}>Inactivo</option>
    </select>`;

  const data = await showFormPrompt({
    title: 'Editar sucursal',
    htmlInputs: inputs,
    confirmButtonText: 'Actualizar'
  });
  if (!data) return;

  try {
    const { swalCompany, ...rest } = data;
    const updated = { ...rest, empresaId: swalCompany };
    await updateDocument('sucursales', branch.id, updated);
    showToastSuccess('Sucursal actualizada');
    loadBranches();
  } catch (err) {
    console.error('Error actualizando sucursal:', err);
    showToastError('Error al actualizar');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadBranches();
  addBranchBtn.addEventListener('click', openAddBranchForm);
});
