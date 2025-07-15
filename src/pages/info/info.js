// src/pages/info/info.js
import { getDocById, getDocsByCollection } from '../../utils/firestoreUtils.js';
import { buildCompanyDetailHtml }           from '../../utils/helpers.js';

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
  // 1) Inyectar navbar y sidebar
  await fetchAndInject('../../components/navbar.html',          '#navbar-container');
  await fetchAndInject('../../components/company-sidebar.html', '#company-sidebar-container');

  // 2) Actualizar hrefs del sidebar
  if (companyId) {
    document.getElementById('linkInfo').href     = `../info/info.html?companyId=${companyId}`;
    document.getElementById('linkConfig').href   = `../config/config.html?companyId=${companyId}`;
    document.getElementById('linkBranches').href = `../branches/branches.html?companyId=${companyId}`;
  }

  // 3) Ajustar posición/altura del sidebar
  const nav     = document.querySelector('.navbar.fixed-top');
  const sidebar = document.getElementById('company-sidebar');
  if (nav && sidebar) {
    const navH = nav.offsetHeight;
    sidebar.style.top    = `${navH}px`;
    sidebar.style.height = `calc(100vh - ${navH}px)`;
  }

  // 4) Cargar datos y renderizar
  const infoSection = document.getElementById('infoSection');
  if (!companyId) {
    infoSection.innerHTML = '<p class="text-danger">Empresa no encontrada.</p>';
    return;
  }
  try {
    const company  = await getDocById('empresas', companyId);
    const branches = (await getDocsByCollection('sucursales'))
                        .filter(b => b.empresaId === companyId);
    infoSection.innerHTML = buildCompanyDetailHtml(company, branches);
  } catch (err) {
    console.error('Error cargando información:', err);
    infoSection.innerHTML = '<p class="text-danger">Error al cargar información.</p>';
  }
}

window.addEventListener('DOMContentLoaded', init);
