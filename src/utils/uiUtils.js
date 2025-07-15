// src/utils/uiUtils.js

/**
 * Limpia el contenido de un contenedor.
 * @param {HTMLElement} container
 */
export function clearContainer(container) {
  container.innerHTML = '';
}

/**
 * Muestra un spinner de carga dentro de un contenedor.
 * @param {HTMLElement} container
 * @param {number} [height=200] Altura en px.
 */
export function showLoader(container, height = 200) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center w-100"
         style="height:${height}px;" aria-hidden="true">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
}

/**
 * Muestra un mensaje centrado de “sin datos” o error.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showNoDataMessage(container, message) {
  container.innerHTML = `<p class="text-center text-muted">${message}</p>`;
}

/**
 * Crea una tarjeta de empresa clicable (sin botones de acción).
 * @param {Object} company
 * @param {number} branchCount
 */
export function createCompanyCard(company, branchCount) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';
  col.innerHTML = `
    <div
      class="card h-100"
      data-id="${company.id}"
      role="button"
      tabindex="0"
      aria-label="Ver detalles de ${company.name}"
      style="cursor: pointer;"
    >
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">
          <i class="fas fa-building me-2" aria-hidden="true"></i>
          ${company.name}
        </h5>
        <p class="card-text flex-grow-1">
          <i class="fas fa-code-branch me-1" aria-hidden="true"></i>
          ${branchCount} sucursales
        </p>
      </div>
    </div>
  `;
  return col;
}
