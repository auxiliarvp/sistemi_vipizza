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
 * Carga inicial: obtiene la lista de empresas y sucursales.
 */
async function loadBranches() {
  clearContainer(branchesContainer);
  showLoader(branchesContainer);

  try {
    // 1) Obtén todas las empresas para el selector
    companiesList = await getDocsByCollection('empresas');

    // 2) Obtén todas las sucursales y filtra por empresa actual
    const allBranches = await getDocsByCollection('sucursales');
    const branches    = allBranches.filter(b => b.empresaId === companyId);

    clearContainer(branchesContainer);

    if (branches.length === 0) {
      showNoDataMessage(branchesContainer, 'No hay sucursales registradas.');
      return;
    }

    // 3) Renderiza cada tarjeta y añade listener de edición
    branches.forEach(branch => {
      const col = createBranchCard(branch);
      const card = col.querySelector('.card');
      card.addEventListener('click', () => openEditBranchForm(branch));
      branchesContainer.appendChild(col);
    });
  } catch (err) {
    console.error('Error cargando sucursales:', err);
    clearContainer(branchesContainer);
    showNoDataMessage(branchesContainer, 'Error cargando sucursales.');
  }
}

/**
 * Crea el DOM de una tarjeta de sucursal.
 * Mantenemos igual que antes, sin cambios.
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
          <i class="fas fa-store me-2" aria-hidden="true"></i>
          ${branch.name}
        </h5>
        <p class="card-text flex-grow-1">
          <i class="fas fa-map-marker-alt me-1" aria-hidden="true"></i>
          ${branch.address || '—'}
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
 * Abre el formulario para agregar una nueva sucursal.
 * (igual que antes, pero asigna empresaId fijo)
 */
async function openAddBranchForm() {
  const inputs = `
    <input    id="swal-name"    class="swal2-input" placeholder="Nombre de sucursal">
    <input    id="swal-address" class="swal2-input" placeholder="Dirección">
    <input    id="swal-phone"   class="swal2-input" placeholder="Teléfono (+502-0000-0000)">
    <input    id="swal-email"   class="swal2-input" placeholder="Email">
    <select   id="swal-company" class="swal2-select">
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

  // Guarda y recarga
  try {
    data.empresaId = data.swalCompany || companyId;
    delete data.swalCompany;
    await addDocument('sucursales', data);
    showToastSuccess('Sucursal creada');
    loadBranches();
  } catch (err) {
    console.error('Error guardando sucursal:', err);
    showToastError('Error creando sucursal');
  }
}

/**
 * Abre el formulario para editar una sucursal existente,
 * incluyendo la posibilidad de cambiar de empresa.
 */
async function openEditBranchForm(branch) {
  const inputs = `
    <input    id="swal-name"    class="swal2-input" placeholder="Nombre" value="${branch.name}">
    <input    id="swal-address" class="swal2-input" placeholder="Dirección" value="${branch.address}">
    <input    id="swal-phone"   class="swal2-input" placeholder="Teléfono (+502-0000-0000)" value="${branch.phone||''}">
    <input    id="swal-email"   class="swal2-input" placeholder="Email" value="${branch.email||''}">
    <select   id="swal-company" class="swal2-select">
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

  // Prepara objeto a actualizar
  const updated = {
    name:       data.name,
    address:    data.address,
    phone:      data.phone,
    email:      data.email,
    status:     data.status,
    empresaId:  data.swalCompany
  };

  // Guarda cambios y recarga
  try {
    await updateDocument('sucursales', branch.id, updated);
    showToastSuccess('Sucursal actualizada');
    loadBranches();
  } catch (err) {
    console.error('Error actualizando sucursal:', err);
    showToastError('Error al actualizar');
  }
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  loadBranches();
  addBranchBtn.addEventListener('click', openAddBranchForm);
});
