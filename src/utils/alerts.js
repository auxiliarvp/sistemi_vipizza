// src/utils/alerts.js

// Confirma una acción (Sí/No)
export function confirmAction(message) {
  return Swal.fire({
    title: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Sí, eliminar'
  }).then(result => result.isConfirmed);
}

// Muestra un formulario en un modal SweetAlert2
export function showFormPrompt(title, htmlInputs) {
  return Swal.fire({
    title,
    html: htmlInputs,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      const name    = document.getElementById('swal-name').value;
      const address = document.getElementById('swal-address').value;
      const phone   = document.getElementById('swal-phone').value;
      const email   = document.getElementById('swal-email').value;
      const status  = document.getElementById('swal-status').value;

      if (!name) {
        Swal.showValidationMessage('El nombre es requerido');
        return null;
      }
      return { name, address, phone, email, status };
    }
  }).then(result => result.value);
}

// Toastr: éxito
export function showToastSuccess(msg) {
  toastr.success(msg);
}

// Toastr: error
export function showToastError(msg) {
  toastr.error(msg);
}
