// src/utils/alerts.js

import { isValidEmail, isValidGuatemalaPhone } from './regexUtils.js';

/**
 * Muestra un modal de confirmación con SweetAlert2 (usa global Swal).
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.text='']
 * @param {'warning'|'info'|'success'|'error'|'question'} [options.icon='warning']
 * @param {string} [options.confirmButtonText='Sí']
 * @param {string} [options.cancelButtonText='Cancelar']
 * @returns {Promise<boolean>}
 */
export async function confirmAction({
  title,
  text = '',
  icon = 'warning',
  confirmButtonText = 'Sí',
  cancelButtonText = 'Cancelar'
}) {
  try {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText
    });
    return result.isConfirmed;
  } catch (error) {
    console.error('confirmAction error:', error);
    return false;
  }
}

/**
 * Muestra un formulario en un modal SweetAlert2 y valida campos:
 * - Nombre obligatorio
 * - Email (si se ingresa) con formato válido
 * - Teléfono Guatemala (si se ingresa) en +502-0000-0000
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.htmlInputs
 * @param {string} [options.confirmButtonText='Guardar']
 * @param {string} [options.cancelButtonText='Cancelar']
 * @returns {Promise<Object|null>}
 */
export async function showFormPrompt({
  title,
  htmlInputs,
  confirmButtonText = 'Guardar',
  cancelButtonText = 'Cancelar'
}) {
  try {
    const result = await Swal.fire({
      title,
      html: htmlInputs,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText,
      cancelButtonText,
      preConfirm: () => {
        const name    = document.getElementById('swal-name').value.trim();
        const address = document.getElementById('swal-address').value.trim();
        const phone   = document.getElementById('swal-phone').value.trim();
        const email   = document.getElementById('swal-email').value.trim();
        const status  = document.getElementById('swal-status').value;

        if (!name) {
          Swal.showValidationMessage('El nombre es requerido');
          return false;
        }
        if (email && !isValidEmail(email)) {
          Swal.showValidationMessage('Email no válido');
          return false;
        }
        if (phone && !isValidGuatemalaPhone(phone)) {
          Swal.showValidationMessage('Teléfono no válido. Formato: +502-0000-0000');
          return false;
        }
        return { name, address, phone, email, status };
      }
    });
    return result.isConfirmed ? result.value : null;
  } catch (error) {
    console.error('showFormPrompt error:', error);
    return null;
  }
}

/**
 * Muestra una notificación con Toastr (usa global toastr).
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} msg
 */
function showToast(type, msg) {
  toastr[type](msg);
}

export const showToastSuccess = msg => showToast('success', msg);
export const showToastError   = msg => showToast('error',   msg);
export const showToastInfo    = msg => showToast('info',    msg);
export const showToastWarning = msg => showToast('warning', msg);
