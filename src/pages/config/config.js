// src/pages/config/config.js
import {
  getDocById,
  updateDocument,
  deleteDocument
} from '../../utils/firestoreUtils.js';
import {
  showFormPrompt,
  showToastSuccess,
  showToastError,
  confirmAction
} from '../../utils/alerts.js';

const params    = new URLSearchParams(window.location.search);
const companyId = params.get('companyId');

async function fetchAndInject(path, selector) {
  try {
    const res  = await fetch(path);
    const html = await res.text();
    document.querySelector(selector).innerHTML = html;
  } catch (err) {
    console.error(`Error cargando ${path}:`, err);
  }
}

async function init() {
  // Inyectar navbar y sidebar
  await fetchAndInject('../../components/navbar.html',         '#navbar-container');
  await fetchAndInject('../../components/company-sidebar.html','#company-sidebar-container');

  // Ajustar sidebar
  const nav     = document.querySelector('.navbar.fixed-top');
  const sidebar = document.getElementById('company-sidebar');
  if (nav && sidebar) {
    const navH = nav.offsetHeight;
    sidebar.style.top    = `${navH}px`;
    sidebar.style.height = `calc(100vh - ${navH}px)`;
  }

  // Referencias
  const form         = document.getElementById('configForm');
  const inputName    = document.getElementById('inputName');
  const inputAddr    = document.getElementById('inputAddress');
  const inputPhone   = document.getElementById('inputPhone');
  const inputEmail   = document.getElementById('inputEmail');
  const selectStatus = document.getElementById('selectStatus');
  const sidebarTitle = document.getElementById('sidebarCompanyName');
  const saveBtn      = document.getElementById('saveConfigBtn');
  const deactivateBtn= document.getElementById('deactivateBtn');
  const deleteBtn    = document.getElementById('deleteBtn');

  if (!companyId) {
    document.getElementById('configSection').innerHTML =
      '<p class="text-danger">Empresa no encontrada.</p>';
    return;
  }

  // Cargar datos iniciales
  try {
    const company = await getDocById('empresas', companyId);
    inputName.value        = company.name    || '';
    inputAddr.value        = company.address || '';
    inputPhone.value       = company.phone   || '';
    inputEmail.value       = company.email   || '';
    selectStatus.value     = company.status  || 'ACTIVO';
    sidebarTitle.textContent = company.name;
  } catch (err) {
    console.error('Error cargando configuración:', err);
    document.getElementById('configSection').innerHTML =
      '<p class="text-danger">Error al cargar datos.</p>';
    return;
  }

  // Guardar cambios
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name:    inputName.value.trim(),
      address: inputAddr.value.trim(),
      phone:   inputPhone.value.trim(),
      email:   inputEmail.value.trim(),
      status:  selectStatus.value
    };
    try {
      await updateDocument('empresas', companyId, data);
      showToastSuccess('Datos actualizados');
      sidebarTitle.textContent = data.name;
    } catch (err) {
      console.error('Error guardando configuración:', err);
      showToastError('Error al guardar cambios');
    }
  });

  // Desactivar empresa
  deactivateBtn.addEventListener('click', async () => {
    const ok = await confirmAction({
      title: 'Desactivar empresa',
      text: '¿Seguro que quieres desactivar esta empresa?',
      icon: 'warning'
    });
    if (!ok) return;
    try {
      await updateDocument('empresas', companyId, { status: 'INACTIVO' });
      selectStatus.value = 'INACTIVO';
      showToastSuccess('Empresa desactivada');
    } catch (err) {
      console.error('Error desactivando empresa:', err);
      showToastError('Error al desactivar');
    }
  });

  // Eliminar (temporal)
  deleteBtn.addEventListener('click', async () => {
    const ok = await confirmAction({
      title: 'Eliminar empresa (temporal)',
      text: 'Esta acción eliminará la empresa temporalmente.',
      icon: 'warning'
    });
    if (!ok) return;
    try {
      await deleteDocument('empresas', companyId);
      showToastSuccess('Empresa eliminada temporalmente');
      // Redirigir al listado
      window.location.href = '../company/company.html';
    } catch (err) {
      console.error('Error eliminando empresa:', err);
      showToastError('Error al eliminar empresa');
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
