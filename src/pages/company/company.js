// src/pages/company/company.js
import {
  getDocsByCollection,
  addDocument
} from '../../utils/firestoreUtils.js';

import {
  clearContainer,
  showLoader,
  showNoDataMessage,
  createCompanyCard
} from '../../utils/uiUtils.js';

import {
  showFormPrompt,
  showToastSuccess,
  showToastError
} from '../../utils/alerts.js';

import { groupBy } from '../../utils/helpers.js';

const cardContainer     = document.getElementById('cardContainer');
const addBtn            = document.getElementById('addBtn');
let companies           = [];
let branchesByCompany   = {};

// 1️ Carga inicial de datos
async function loadData() {
  clearContainer(cardContainer);
  showLoader(cardContainer);

  try {
    companies = await getDocsByCollection('empresas');
    const branches = await getDocsByCollection('sucursales');
    branchesByCompany = groupBy(branches, b => b.empresaId);
    renderCards();
  } catch (err) {
    clearContainer(cardContainer);
    showNoDataMessage(cardContainer, 'Error cargando datos.');
    console.error(err);
  }
}

// 2️ Render de tarjetas clicables
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

// 3️ Click en tarjeta → navegar a la vista Company Menu
cardContainer.addEventListener('click', e => {
  const card = e.target.closest('.card[data-id]');
  if (!card) return;
  const companyId = card.dataset.id;
  // ruta relativa dentro de src/pages/company/
  window.location.href = `./company-menu.html?companyId=${companyId}`;
});

// 4️ Botón “+” para agregar nueva empresa
addBtn.addEventListener('click', () => {
  openAddForm();
});

async function openAddForm() {
  const inputs = `
    <input id="swal-name"    class="swal2-input" placeholder="Nombre">
    <input id="swal-address" class="swal2-input" placeholder="Dirección">
    <input id="swal-phone"   class="swal2-input" placeholder="Teléfono (+502-0000-0000)">
    <input id="swal-email"   class="swal2-input" placeholder="Email">
    <select id="swal-status" class="swal2-select">
      <option value="ACTIVO" selected>Activo</option>
      <option value="INACTIVO">Inactivo</option>
    </select>`;

  const data = await showFormPrompt({
    title: 'Agregar empresa',
    htmlInputs: inputs
  });

  if (!data) return;

  try {
    await addDocument('empresas', data);
    showToastSuccess('Empresa creada');
    loadData();
  } catch (err) {
    console.error(err);
    showToastError('Error guardando empresa');
  }
}

// 5️ Inicialización al cargar el DOM
window.addEventListener('DOMContentLoaded', loadData);
