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
  showModal('addCompanyModal');
}

async function addCompany() {
  const name = $('#companyName').value.trim();
  if (!name) return Swal.fire('Error','El nombre es obligatorio.','error');
  const payload = {
    name,
    address: $('#companyAddress').value.trim(),
    phone:   $('#companyPhone').value.trim(),
    email:   $('#companyEmail').value.trim(),
    creationDate: $('#companyCreationDate').value,
    description:  $('#companyDescription').value.trim(),
    status:       $('#companyStatus').value
  };
  const { isConfirmed } = await Swal.fire({
    title:'¿Guardar empresa?', icon:'question',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;
  try {
    const ref = await db.collection('empresas').add(payload);
    await audit('create','empresas',ref.id,{ name });
    Swal.fire('Guardado','','success');
    closeModal('addCompanyModal');
    loadCompanies();
    loadCompanyOptions();
  } catch {
    Swal.fire('Error','No se pudo guardar.','error');
  }
}

async function viewSelectedCompany() {
  const sel = getSelIds('#companiesTable');
  if (sel.length !== 1) return Swal.fire('Atención', sel.length? 'Selecciona solo una.' : 'Selecciona al menos una.','warning');
  const doc = await db.collection('empresas').doc(sel[0]).get();
  const d = doc.data();
  const labels = { name:'Nombre', address:'Dirección', phone:'Teléfono', email:'Email', creationDate:'Creado', description:'Descripción', status:'Estado' };
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
  if (sel.length !== 1) return Swal.fire('Atención','Selecciona una sola.','warning');
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
  const name = $('#editCompanyName').value.trim();
  if (!name) return Swal.fire('Error','El nombre es obligatorio.','error');
  const payload = {
    name,
    address: $('#editCompanyAddress').value.trim(),
    phone:   $('#editCompanyPhone').value.trim(),
    email:   $('#editCompanyEmail').value.trim(),
    creationDate: $('#editCompanyCreationDate').value,
    description:  $('#editCompanyDescription').value.trim(),
    status:       $('#editCompanyStatus').value
  };
  const { isConfirmed } = await Swal.fire({
    title:'Guardar cambios?', icon:'question',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
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
  if (!sel.length) return Swal.fire('Atención','Selecciona al menos una.','warning');
  const { isConfirmed } = await Swal.fire({
    title:`¿Eliminar ${sel.length}?`, icon:'warning',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
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
    tr.style.display = tr.cells[0].textContent.toUpperCase().includes(term)? '' : 'none';
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
    row.insertCell().textContent = v.address||'—';
    row.insertCell().textContent = v.phone  ||'—';
    row.insertCell().textContent = v.email  ||'—';
    row.insertCell().textContent = v.creationDate||'—';
    row.insertCell().textContent = v.manager||'—';
    row.insertCell().textContent = v.description||'—';
    row.insertCell().textContent = v.status;
    row.insertCell().textContent = emps[v.empresaId]||'—';
  });
  toggleBtns('#branchesTable','#viewBranchBtn','#editBranchBtn','#deleteBranchBtn');
}

function showAddBranchForm() {
  showModal('addBranchModal');
}

async function addBranch() {
  const name = $('#branchName').value.trim();
  const emp  = $('#companySelect').value;
  if (!name||!emp) return Swal.fire('Error','Nombre y empresa obligatorios.','error');
  const { isConfirmed } = await Swal.fire({
    title:'¿Guardar sucursal?', icon:'question',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;
  const payload = {
    name,
    address: $('#branchAddress').value.trim(),
    phone:   $('#branchPhone').value.trim(),
    email:   $('#branchEmail').value.trim(),
    creationDate: $('#branchCreationDate').value,
    manager:       $('#branchManager').value.trim(),
    description:   $('#branchDescription').value.trim(),
    status:        $('#branchStatus').value,
    empresaId:     emp
  };
  try {
    const ref = await db.collection('sucursales').add(payload);
    await audit('create','sucursales',ref.id,{ name });
    Swal.fire('Guardado','','success');
    closeModal('addBranchModal');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo guardar.','error');
  }
}

async function viewSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (sel.length!==1) return Swal.fire('Atención','Selecciona una sucursal.','warning');
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
    let val = k==='empresa'
      ? (empDoc.exists?empDoc.data().name:'—')
      : (d[k]||'—');
    li.innerHTML = `<strong>${labels[k]}</strong><span>${val}</span>`;
    ul.appendChild(li);
  }
  showModal('viewBranchModal');
}

async function editSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (sel.length!==1) return Swal.fire('Atención','Selecciona una sucursal.','warning');
  const doc = await db.collection('sucursales').doc(sel[0]).get();
  const v = doc.data();
  $('#editBranchId').value            = doc.id;
  $('#editBranchName').value          = v.name;
  $('#editBranchAddress').value       = v.address||'';
  $('#editBranchPhone').value         = v.phone  ||'';
  $('#editBranchEmail').value         = v.email  ||'';
  $('#editBranchCreationDate').value  = v.creationDate||'';
  $('#editBranchManager').value       = v.manager||'';
  $('#editBranchDescription').value   = v.description||'';
  $('#editBranchStatus').value        = v.status;
  $('#editCompanySelect').value       = v.empresaId;
  showModal('editBranchModal');
}

async function updateBranch() {
  const id = $('#editBranchId').value;
  const name = $('#editBranchName').value.trim();
  const emp  = $('#editCompanySelect').value;
  if (!name||!emp) return Swal.fire('Error','Nombre y empresa obligatorios.','error');
  const { isConfirmed } = await Swal.fire({
    title:'Guardar cambios?', icon:'question',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;
  const data = {
    name,
    address: $('#editBranchAddress').value.trim(),
    phone:   $('#editBranchPhone').value.trim(),
    email:   $('#editBranchEmail').value.trim(),
    creationDate: $('#editBranchCreationDate').value,
    manager:       $('#editBranchManager').value.trim(),
    description:   $('#editBranchDescription').value.trim(),
    status:        $('#editBranchStatus').value,
    empresaId:     emp
  };
  try {
    await db.collection('sucursales').doc(id).update(data);
    await audit('update','sucursales',id,data);
    Swal.fire('Actualizado','','success');
    closeModal('editBranchModal');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo actualizar.','error');
  }
}

async function deleteSelectedBranch() {
  const sel = getSelIds('#branchesTable');
  if (!sel.length) return Swal.fire('Atención','Selecciona al menos una sucursal.','warning');
  const { isConfirmed } = await Swal.fire({
    title:`¿Eliminar ${sel.length}?`, icon:'warning',
    showCancelButton:true, confirmButtonText:'Sí', cancelButtonText:'No'
  });
  if (!isConfirmed) return;
  try {
    await Promise.all(sel.map(id=>db.collection('sucursales').doc(id).delete()));
    sel.forEach(id=>audit('delete','sucursales',id));
    Swal.fire('Eliminado','','success');
    loadBranches();
  } catch {
    Swal.fire('Error','No se pudo eliminar.','error');
  }
}

function filterBranchesByName() {
  const term = $('#branchSearchInput').value.toUpperCase();
  document.querySelectorAll('#branchesTable tbody tr').forEach(tr=>{
    tr.style.display = tr.cells[0].textContent.toUpperCase().includes(term)? '':'none';
  });
}

function filterBranchesByCompany() {
  const cid = $('#branchCompanyFilter').value;
  document.querySelectorAll('#branchesTable tbody tr').forEach(tr=>{
    tr.style.display = !cid||tr.dataset.empresaId===cid? '':'none';
  });
}

async function loadCompanyOptions() {
  const selAdd  = $('#companySelect');
  const selFilt = $('#branchCompanyFilter');
  selAdd.innerHTML  = '';
  selFilt.innerHTML = '<option value="">Todas las empresas</option>';
  const snap = await db.collection('empresas').orderBy('name').get();
  snap.forEach(d=>{
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.data().name;
    selAdd.appendChild(opt);
    selFilt.appendChild(opt.cloneNode(true));
  });
}

// Modal controls
function showModal(id) { document.getElementById(id).style.display='flex'; }
function closeModal(id) { document.getElementById(id).style.display='none'; }

// Initialization
window.addEventListener('DOMContentLoaded', ()=>{
  loadCompanies();
  loadBranches();
  loadCompanyOptions();
  makeRowsSelectable('#companiesTable','#viewCompanyBtn','#editCompanyBtn','#deleteCompanyBtn');
  makeRowsSelectable('#branchesTable','#viewBranchBtn','#editBranchBtn','#deleteBranchBtn');
});
