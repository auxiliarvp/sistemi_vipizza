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

// Genera el HTML de detalles de empresa + sus sucursales, con iconos
export function buildCompanyDetailHtml(company, branches) {
  let html = `
    <h4><i class="fas fa-building me-2"></i>${company.name}</h4>
    <p>
      <i class="fas fa-map-marker-alt me-1"></i>
      <strong>Dirección:</strong> ${company.address || '—'}
    </p>
    <p>
      <i class="fas fa-phone me-1"></i>
      <strong>Teléfono:</strong> ${company.phone || '—'}
    </p>
    <p>
      <i class="fas fa-envelope me-1"></i>
      <strong>Email:</strong> ${company.email || '—'}
    </p>
    <p>
      <i class="fas fa-toggle-${company.status === 'ACTIVO' ? 'on bg-success' : 'off bg-danger'} me-1"></i>
      <strong>Estado:</strong> ${company.status}
    </p>
    <hr>
    <h5>
      <i class="fas fa-code-branch me-2"></i>
      Sucursales (${branches.length})
    </h5>
    <ul class="list-group">`;

  branches.forEach(b => {
    html += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          <i class="fas fa-store me-1"></i>${b.name}
        </span>
        <span class="badge ${b.status === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
          ${b.status}
        </span>
      </li>`;
  });

  html += '</ul>';
  return html;
}
