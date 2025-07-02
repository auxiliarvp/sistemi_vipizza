// src/pages/empresa/empresa.js

// Helpers
const $ = s => document.querySelector(s);

function getSelIds(tableSel) {
  return [...document.querySelectorAll(`${tableSel} tbody tr.selected`)]
    .map(tr => tr.dataset.id);
}

function toggleBtns(tableSel, viewBtn, editBtn, delBtn) {
  const n = getSelIds(tableSel).length;
  $(viewBtn).disabled = !(n === 1);
  $(editBtn).disabled = !(n === 1);
  $(delBtn).disabled = (n === 0);
}

function makeRowsSelectable(tableSel, viewBtn, editBtn, delBtn) {
  const tbl = document.querySelector(tableSel);
  tbl.querySelector('tbody').addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const was = tr.classList.contains('selected');
    tbl.querySelectorAll('tbody tr.selected').forEach(r => r.classList.remove('selected'));
    if (!was) tr.classList.add('selected');
    toggleBtns(tableSel, viewBtn, editBtn, delBtn);
  });
}

// Audit
async function audit(act, col, id, data = {}) {
  await db.collection('auditLog').add({
    user: firebase.auth().currentUser?.email || 'anon',
    act, col, id, data,
    at: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Validation
function isValidEmail(email) { return /^\S+@\S+\.\S+$/.test(email); }
function isValidPhone(phone) { return /^\d{7,}$/.test(phone); }

// Reset forms
function resetCompanyForm() {
  $('#companyName').value = '';
  $('#companyAddress').value = '';
  $('#companyPhone').value = '';
  $('#companyEmail').value = '';
  $('#companyCreationDate').value = '';
  $('#companyDescription').value = '';
  $('#companyStatus').value = 'ACTIVO';
}

function resetBranchForm() {
  $('#branchName').value = '';
  $('#branchAddress').value = '';
  $('#branchPhone').value = '';
  $('#branchEmail').value = '';
  $('#branchCreationDate').value = '';
  $('#branchManager').value = '';
  $('#branchDescription').value = '';
  $('#branchStatus').value = 'ACTIVO';
  $('#companySelect').value = '';
}

// — Empresas CRUD —

async function loadCompanies() {
  const snap = await db.collection('empresas').orderBy('name').get();
  const tbody = $('#companiesTable tbody');
  tbody.innerHTML = '';
  snap.forEach(doc => {
    const v = doc.data();
    const row = tbody.insertRow();
    row.dataset.id = doc.id;
    row.insertCell().textContent = v.name;
    row.insertCell().textContent = v.address || '—';
    row.insertCell().textContent = v.phone   || '—';
    row.insertCell().textContent = v.email   || '—';
    row.insertCell().textContent = v.creationDate || '—';
    row.insertCell().textContent = v.description  || '—';
    row.insertCell().textContent = v.status;
  });
  toggleBtns('#companiesTable','#viewCompanyBtn','#editCompanyBtn','#deleteCompanyBtn');
}

function showAddCompanyForm() {
  resetCompanyForm();
  showModal('addCompanyModal');
}

async function addCompany() {
  const name        = $('#companyName').value.trim().toUpperCase();
  if (!name) return Swal.fire('Error','El nombre es obligatorio.','error');

  const payload = {
    name,
    address:      $('#companyAddress').value.trim().toUpperCase(),
    phone:        $('#companyPhone').value.trim(),
    email:        $('#companyEmail').value.trim().toUpperCase(),
    creationDate: $('#companyCreationDate').value,
    description:  $('#companyDescription').value.trim().toUpperCase(),
    status:       $('#companyStatus').value.toUpperCase()
  };

  const { isConfirmed } = await Swal.fire({
    title:'¿Guardar empresa?', icon:'question',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  try {
    const ref = await db.collection('empresas').add(payload);
    await audit('create','empresas',ref.id,{ name });
    Swal.fire('Guardado','','success');
    resetCompanyForm();
    closeModal('addCompanyModal');
    loadCompanies();
    loadCompanyOptions();
  } catch {
    Swal.fire('Error','No se pudo guardar.','error');
  }
}

async function viewSelectedCompany() {
  const sel = getSelIds('#companiesTable');
  if (sel.length !== 1)
    return Swal.fire('Atención', sel.length? 'Selecciona solo una.' : 'Selecciona al menos una.','warning');

  const doc = await db.collection('empresas').doc(sel[0]).get();
  const d = doc.data();
  const labels = {
    name:'Nombre', address:'Dirección', phone:'Teléfono',
    email:'Email', creationDate:'Creado', description:'Descripción', status:'Estado'
  };
  const ul = $('#companyDetailsList'); ul.innerHTML = '';
  for (let k in labels) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between';
    li.innerHTML = `<strong>${labels[k]}</strong><span>${d[k]||'—'}</span>`;
    ul.appendChild(li);
  }
  showModal('viewCompanyModal');
}

async function editSelectedCompany() {
  const sel = getSelIds('#companiesTable');
  if (sel.length !== 1)
    return Swal.fire('Atención','Selecciona una sola.','warning');

  const doc = await db.collection('empresas').doc(sel[0]).get();
  const v = doc.data();
  $('#editCompanyId').value           = doc.id;
  $('#editCompanyName').value         = v.name;
  $('#editCompanyAddress').value      = v.address  || '';
  $('#editCompanyPhone').value        = v.phone    || '';
  $('#editCompanyEmail').value        = v.email    || '';
  $('#editCompanyCreationDate').value = v.creationDate|| '';
  $('#editCompanyDescription').value  = v.description || '';
  $('#editCompanyStatus').value       = v.status;
  showModal('editCompanyModal');
}

async function updateCompany() {
  const id = $('#editCompanyId').value;
  const name = $('#editCompanyName').value.trim().toUpperCase();
  if (!name) return Swal.fire('Error','El nombre es obligatorio.','error');

  const payload = {
    name,
    address:      $('#editCompanyAddress').value.trim().toUpperCase(),
    phone:        $('#editCompanyPhone').value.trim(),
    email:        $('#editCompanyEmail').value.trim().toUpperCase(),
    creationDate: $('#editCompanyCreationDate').value,
    description:  $('#editCompanyDescription').value.trim().toUpperCase(),
    status:       $('#editCompanyStatus').value.toUpperCase()
  };

  const { isConfirmed } = await Swal.fire({
    title:'Guardar cambios?', icon:'question',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  try {
    await db.collection('empresas').doc(id).update(payload);
    await audit('update','empresas',id,payload);
    Swal.fire('Actualizado','','success');
    closeModal('editCompanyModal');
    loadCompanies();
    loadCompanyOptions();
  } catch {
    Swal.fire('Error','No se pudo actualizar.','error');
  }
}

async function deleteSelectedCompany() {
  const sel = getSelIds('#companiesTable');
  if (!sel.length)
    return Swal.fire('Atención','Selecciona al menos una.','warning');

  const { isConfirmed } = await Swal.fire({
    title:`¿Eliminar ${sel.length}?`, icon:'warning',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  try {
    await Promise.all(sel.map(id => db.collection('empresas').doc(id).delete()));
    sel.forEach(id => audit('delete','empresas',id));
    Swal.fire('Eliminado','','success');
    loadCompanies();
    loadCompanyOptions();
  } catch {
    Swal.fire('Error','No se pudo eliminar.','error');
  }
}

function filterCompanies() {
  const term = $('#companySearchInput').value.toUpperCase();
  document.querySelectorAll('#companiesTable tbody tr').forEach(tr => {
    tr.style.display = tr.cells[0].textContent.toUpperCase().includes(term) ? '' : 'none';
  });
}

// — Sucursales CRUD —

async function loadBranches() {
  const filterId = $('#branchCompanyFilter').value;
  let query = db.collection('sucursales');
  if (filterId) query = query.where('empresaId','==',filterId);
  const snap = await query.orderBy('name').get();

  const emps = {};
  (await db.collection('empresas').get()).forEach(d => emps[d.id] = d.data().name);

  const tbody = $('#branchesTable tbody');
  tbody.innerHTML = '';
  snap.forEach(doc => {
    const v = doc.data();
    const row = tbody.insertRow();
    row.dataset.id = doc.id;
    row.dataset.empresaId = v.empresaId;
    row.insertCell().textContent = v.name;
    row.insertCell().textContent = v.address || '—';
    row.insertCell().textContent = v.phone   || '—';
    row.insertCell().textContent = v.email   || '—';
    row.insertCell().textContent = v.creationDate || '—';
    row.insertCell().textContent = v.manager  || '—';
    row.insertCell().textContent = v.description|| '—';
    row.insertCell().textContent = v.status;
    row.insertCell().textContent = emps[v.empresaId] || '—';
  });
  toggleBtns('#branchesTable','#viewBranchBtn','#editBranchBtn','#deleteBranchBtn');
}

function showAddBranchForm() {
  resetBranchForm();
  showModal('addBranchModal');
}

async function addBranch() {
  const name        = $('#branchName').value.trim().toUpperCase();
  const address     = $('#branchAddress').value.trim().toUpperCase();
  const phone       = $('#branchPhone').value.trim();
  const email       = $('#branchEmail').value.trim().toUpperCase();
  const date        = $('#branchCreationDate').value;
  const manager     = $('#branchManager').value.trim().toUpperCase();
  const description = $('#branchDescription').value.trim().toUpperCase();
  const status      = $('#branchStatus').value.toUpperCase();
  const empresaId   = $('#companySelect').value;

  if (!name || !empresaId)
    return Swal.fire('Error','Nombre y empresa obligatorios.','error');

  const { isConfirmed } = await Swal.fire({
    title:'¿Guardar sucursal?', icon:'question',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  const payload = {
    name, address, phone, email,
    creationDate: date,
    manager, description, status,
    empresaId
  };

  try {
    const ref = await db.collection('sucursales').add(payload);
    await audit('create','sucursales',ref.id,{ name });
    Swal.fire('Guardado','','success');
    resetBranchForm();
    closeModal('addBranchModal');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo guardar.','error');
  }
}

async function viewSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (sel.length !== 1)
    return Swal.fire('Atención','Selecciona una sucursal.','warning');

  const doc = await db.collection('sucursales').doc(sel[0]).get();
  const d = doc.data();
  const empDoc = await db.collection('empresas').doc(d.empresaId).get();

  const labels = {
    name:'Nombre', address:'Dirección', phone:'Teléfono',
    email:'Email', creationDate:'Creado', manager:'Encargado',
    description:'Descripción', status:'Estado', empresa:'Empresa'
  };
  const ul = $('#branchDetailsList'); ul.innerHTML = '';
  for (let k in labels) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between';
    let val = k === 'empresa'
      ? (empDoc.exists ? empDoc.data().name : '—')
      : (d[k] || '—');
    li.innerHTML = `<strong>${labels[k]}</strong><span>${val}</span>`;
    ul.appendChild(li);
  }
  showModal('viewBranchModal');
}

async function editSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (sel.length !== 1)
    return Swal.fire('Atención','Selecciona una sucursal.','warning');

  const doc = await db.collection('sucursales').doc(sel[0]).get();
  const v = doc.data();
  $('#editBranchId').value            = doc.id;
  $('#editBranchName').value          = v.name;
  $('#editBranchAddress').value       = v.address  || '';
  $('#editBranchPhone').value         = v.phone    || '';
  $('#editBranchEmail').value         = v.email    || '';
  $('#editBranchCreationDate').value  = v.creationDate|| '';
  $('#editBranchManager').value       = v.manager  || '';
  $('#editBranchDescription').value   = v.description|| '';
  $('#editBranchStatus').value        = v.status;
  $('#editCompanySelect').value       = v.empresaId;
  showModal('editBranchModal');
}

async function updateBranch() {
  const id          = $('#editBranchId').value;
  const name        = $('#editBranchName').value.trim().toUpperCase();
  const address     = $('#editBranchAddress').value.trim().toUpperCase();
  const phone       = $('#editBranchPhone').value.trim();
  const email       = $('#editBranchEmail').value.trim().toUpperCase();
  const date        = $('#editBranchCreationDate').value;
  const manager     = $('#editBranchManager').value.trim().toUpperCase();
  const description = $('#editBranchDescription').value.trim().toUpperCase();
  const status      = $('#editBranchStatus').value.toUpperCase();
  const empresaId   = $('#editCompanySelect').value;

  if (!name || !empresaId)
    return Swal.fire('Error','Nombre y empresa obligatorios.','error');

  const { isConfirmed } = await Swal.fire({
    title:'Guardar cambios?', icon:'question',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  const payload = {
    name, address, phone, email,
    creationDate: date,
    manager, description, status,
    empresaId
  };

  try {
    await db.collection('sucursales').doc(id).update(payload);
    await audit('update','sucursales',id,payload);
    Swal.fire('Actualizado','','success');
    closeModal('editBranchModal');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo actualizar.','error');
  }
}

async function deleteSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (!sel.length)
    return Swal.fire('Atención','Selecciona al menos una sucursal.','warning');

  const { isConfirmed } = await Swal.fire({
    title:`¿Eliminar ${sel.length}?`, icon:'warning',
    showCancelButton:true,
    confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;

  try {
    await Promise.all(sel.map(id => db.collection('sucursales').doc(id).delete()));
    sel.forEach(id => audit('delete','sucursales',id));
    Swal.fire('Eliminado','','success');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo eliminar.','error');
  }
}

function filterBranchesByName() {
  const term = $('#branchSearchInput').value.toUpperCase();
  document.querySelectorAll('#branchesTable tbody tr').forEach(tr => {
    tr.style.display = tr.cells[0].textContent.toUpperCase().includes(term) ? '' : 'none';
  });
}

function filterBranchesByCompany() {
  const cid = $('#branchCompanyFilter').value;
  document.querySelectorAll('#branchesTable tbody tr').forEach(tr => {
    tr.style.display = !cid || tr.dataset.empresaId === cid ? '' : 'none';
  });
}

async function loadCompanyOptions() {
  const selAdd  = $('#companySelect');
  const selEdit = $('#editCompanySelect');
  const selFilt = $('#branchCompanyFilter');

  selAdd.innerHTML  = '';
  selEdit.innerHTML = '';
  selFilt.innerHTML = '<option value="">Todas las empresas</option>';

  const snap = await db.collection('empresas').orderBy('name').get();
  snap.forEach(d => {
    const name = d.data().name;
    const opt1 = document.createElement('option');
    opt1.value = d.id; opt1.textContent = name;
    selAdd.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    selEdit.appendChild(opt2);

    const opt3 = opt1.cloneNode(true);
    selFilt.appendChild(opt3);
  });
}

// Modal controls
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  loadCompanies();
  loadBranches();
  loadCompanyOptions();
  makeRowsSelectable('#companiesTable','#viewCompanyBtn','#editCompanyBtn','#deleteCompanyBtn');
  makeRowsSelectable('#branchesTable','#viewBranchBtn','#editBranchBtn','#deleteBranchBtn');
});
