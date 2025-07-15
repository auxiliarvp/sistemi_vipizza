// src/pages/company/company-menu.js
import { getDocById } from '../../utils/firestoreUtils.js';

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

  // Ajustar posición y altura del sidebar
  const nav     = document.querySelector('.navbar.fixed-top');
  const sidebar = document.querySelector('#company-sidebar');
  if (nav && sidebar) {
    const navH = nav.offsetHeight;
    sidebar.style.top    = `${navH}px`;
    sidebar.style.height = `calc(100vh - ${navH}px)`;
  }

  // Referencias a elementos del DOM
  const nameEl         = document.getElementById('companyName');
  const sidebarTitleEl = document.getElementById('sidebarCompanyName');
  const linkInfo       = document.getElementById('linkInfo');
  const linkConfig     = document.getElementById('linkConfig');
  const linkBranches   = document.getElementById('linkBranches');

  // Validar companyId
  if (!companyId) {
    if (nameEl)         nameEl.textContent         = 'Empresa no encontrada';
    if (sidebarTitleEl) sidebarTitleEl.textContent = 'Empresa no encontrada';
    return;
  }

  // Cargar datos de la empresa
  try {
    const company = await getDocById('empresas', companyId);
    nameEl.textContent         = company.name;
    sidebarTitleEl.textContent = company.name;

    linkInfo.href      = `../info/info.html?companyId=${companyId}`;
    linkConfig.href    = `../config/config.html?companyId=${companyId}`;
    linkBranches.href  = `../branches/branches.html?companyId=${companyId}`;
  } catch (err) {
    console.error('Error al cargar la empresa:', err);
    if (nameEl)         nameEl.textContent         = 'Error al cargar empresa';
    if (sidebarTitleEl) sidebarTitleEl.textContent = 'Error al cargar empresa';
  }
}

window.addEventListener('DOMContentLoaded', init);
