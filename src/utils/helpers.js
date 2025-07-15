// src/utils/helpers.js

/**
 * Agrupa un array de objetos por clave o función.
 * @param {Array<Object>} array
 * @param {string|function(Object):string} key
 */
export function groupBy(array, key) {
  const keyFn = typeof key === 'function' ? key : item => item[key];
  return array.reduce((acc, item) => {
    const k = keyFn(item) ?? '';
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

/** Escapa caracteres para HTML. */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}

/**
 * Genera el HTML de detalles de empresa + sus sucursales.
 * @param {Object} company
 * @param {Array<Object>} branches
 */
export function buildCompanyDetailHtml(company, branches) {
  const header = `<h4><i class="fas fa-building me-2"></i>${escapeHtml(company.name)}</h4>`;

  const fields = [
    { icon: 'map-marker-alt', label: 'Dirección', value: company.address },
    { icon: 'phone',          label: 'Teléfono',  value: company.phone },
    { icon: 'envelope',       label: 'Email',     value: company.email },
    {
      icon: company.status==='ACTIVO'
        ? 'toggle-on bg-success'
        : 'toggle-off bg-danger',
      label: 'Estado',
      value: company.status
    }
  ].map(f => `
    <p>
      <i class="fas fa-${f.icon} me-1"></i>
      <strong>${f.label}:</strong> ${escapeHtml(f.value) || '—'}
    </p>
  `).join('');

  const branchList = branches.map(b => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span><i class="fas fa-store me-1"></i>${escapeHtml(b.name)}</span>
      <span class="badge ${b.status==='ACTIVO'?'bg-success':'bg-danger'}">
        ${escapeHtml(b.status)}
      </span>
    </li>
  `).join('');

  return `
    ${header}
    ${fields}
    <hr>
    <h5><i class="fas fa-code-branch me-2"></i>Sucursales (${branches.length})</h5>
    <ul class="list-group">${branchList}</ul>
  `;
}
