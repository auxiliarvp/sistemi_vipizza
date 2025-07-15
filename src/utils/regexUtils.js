// src/utils/regexUtils.js

/**
 * Expresiones regulares y validadores centralizados para Guatemala.
 */

// Email genérico (simple RFC-like)
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Teléfono Guatemala (formato obligatorio): +502-0000-0000
 */
export const GUATEMALA_PHONE_REGEX = /^\+502-\d{4}-\d{4}$/;
export function isValidGuatemalaPhone(phone) {
  return GUATEMALA_PHONE_REGEX.test(phone.trim());
}

/**
 * Código postal Guatemala: 5 dígitos, departamentos 01–22.
 */
export const GUATEMALA_POSTAL_CODE_REGEX = /^(?:0[1-9]|1\d|2[0-2])\d{3}$/;
export function isValidGuatemalaPostalCode(code) {
  return GUATEMALA_POSTAL_CODE_REGEX.test(code.trim());
}

/**
 * NIT Guatemala: 1–10 dígitos, guión, dígito o K.
 */
export const GUATEMALA_NIT_REGEX = /^\d{1,10}-[0-9Kk]$/;
export function isValidGuatemalaNIT(nit) {
  return GUATEMALA_NIT_REGEX.test(nit.trim());
}

/**
 * CUI (DPI) Guatemala: 13 dígitos exactos.
 */
export const GUATEMALA_CUI_REGEX = /^\d{13}$/;
export function isValidGuatemalaCUI(cui) {
  return GUATEMALA_CUI_REGEX.test(cui.trim());
}
