// src/utils/helpers.js

// Agrupa un array de objetos por clave
export function groupBy(array, keyFn) {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Genera el HTML de detalles de empresa + sus sucursales
export function buildCompanyDetailHtml(company, branches) {
  let html = `
    <h4>${company.name}</h4>
    <p><strong>Dirección:</strong> ${company.address || '—'}</p>
    <p><strong>Email:</strong> ${company.email || '—'}</p>
    <p><strong>Estado:</strong> ${company.status}</p>
    <hr>
    <h5>Sucursales (${branches.length})</h5>
    <ul class="list-group">`;

  branches.forEach(b => {
    html += `
      <li class="list-group-item d-flex justify-content-between">
        ${b.name}
        <span class="badge ${b.status === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
          ${b.status}
        </span>
      </li>`;
  });

  html += '</ul>';
  return html;
}
