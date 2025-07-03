// src/utils/uiUtils.js

// Limpia el contenido de un contenedor
export function clearContainer(container) {
  container.innerHTML = '';
}

// Muestra un spinner de carga
export function showLoader(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center w-100" style="height:200px;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`;
}

// Muestra un mensaje de “sin datos” o error
export function showNoDataMessage(container, message) {
  container.innerHTML = `<p class="text-center text-muted">${message}</p>`;
}

// Crea la tarjeta DOM de una empresa con iconos
export function createCompanyCard(company, branchCount) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';

  const card = document.createElement('div');
  card.className = 'card';

  const body = document.createElement('div');
  body.className = 'card-body';

  // Título con icono de edificio
  const title = document.createElement('h5');
  title.className = 'card-title';
  title.innerHTML = `<i class="fas fa-building me-2"></i>${company.name}`;

  // Contador de sucursales con icono de rama
  const count = document.createElement('p');
  count.className = 'card-text';
  count.innerHTML = `<i class="fas fa-code-branch me-1"></i>${branchCount} sucursales`;

  const btnGroup = document.createElement('div');
  btnGroup.className = 'd-flex justify-content-end gap-2';

  // Botones: ver, editar, eliminar (ya tenían iconos)
  [
    { action: 'view', icon: 'eye',   style: 'info'    },
    { action: 'edit', icon: 'edit',  style: 'warning' },
    { action: 'del',  icon: 'trash', style: 'danger'  }
  ].forEach(({ action, icon, style }) => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm btn-${style}`;
    btn.dataset.action = action;
    btn.dataset.id = company.id;
    btn.innerHTML = `<i class="fas fa-${icon}"></i>`;
    btnGroup.appendChild(btn);
  });

  body.append(title, count, btnGroup);
  card.appendChild(body);
  col.appendChild(card);

  return col;
}
