(function () {
  document.addEventListener('DOMContentLoaded', function () {
    let categories = [ { id: 1, name: 'Science-fiction', description: '' }, { id: 2, name: 'Fantasy', description: '' }, { id: 3, name: 'Essai', description: '' } ];
    let state = { page: 1, pageSize: 10, filter: '' };

    const tableBody = document.getElementById('categoriesTableBody');
    const filterSearch = document.getElementById('filterSearch');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const paginationInfo = document.getElementById('paginationInfo');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const pageSizeSelect = document.getElementById('pageSize');

    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const btnAdd = document.getElementById('btnAddCategory');
    const btnCancelForm = document.getElementById('btnCancelForm');

    const idInput = document.getElementById('categoryId');
    const nameInput = document.getElementById('categoryName');
    const descInput = document.getElementById('categoryDescription');

    function applyFilters(list) { const f = state.filter.trim().toLowerCase(); return list.filter(c => !f || c.name.toLowerCase().includes(f)); }

    function renderTable() {
      const filtered = applyFilters(categories);
      const total = filtered.length;
      const pageSize = Number(state.pageSize || pageSizeSelect.value || 10);
      const totalPages = Math.max(1, Math.ceil(total / pageSize)); if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * pageSize; const end = Math.min(total, start + pageSize);

      tableBody.innerHTML = '';
      const frag = document.createDocumentFragment();
      filtered.slice(start, end).forEach(c => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${c.id}</td><td>${c.name}</td><td>${c.description || ''}</td><td class="actions-cell"><button class="action-btn" data-act="edit" data-id="${c.id}">✏️</button><button class="action-btn" data-act="delete" data-id="${c.id}">🗑️</button></td>`; frag.appendChild(tr); });
      tableBody.appendChild(frag);

      paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} résultats`;
      btnPrevPage.disabled = state.page <= 1; btnNextPage.disabled = state.page >= totalPages; paginationNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.textContent = i; if (i === state.page) b.style.fontWeight = '700'; b.addEventListener('click', () => { state.page = i; renderTable(); }); paginationNumbers.appendChild(b); }
    }

    function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
    const onSearchChange = debounce(() => { state.filter = filterSearch.value; state.page = 1; renderTable(); }, 220);

    filterSearch.addEventListener('input', onSearchChange);
    btnClearFilters.addEventListener('click', () => { filterSearch.value = ''; state = { ...state, filter: '', page: 1 }; renderTable(); });
    btnExportCSV.addEventListener('click', () => { const rows = [['ID','Nom','Description']]; applyFilters(categories).forEach(c => rows.push([c.id,c.name,c.description])); const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = 'categories.csv'; a.click(); });

    document.getElementById('categoriesTable').addEventListener('click', function (e) { const btn = e.target.closest('button[data-act]'); if (!btn) return; const id = Number(btn.dataset.id); const act = btn.dataset.act; const target = categories.find(x => x.id === id); if (act === 'edit') { modalTitle.textContent = 'Modifier une catégorie'; idInput.value = target.id; nameInput.value = target.name; descInput.value = target.description || ''; modal.classList.add('is-open'); } else if (act === 'delete') { document.getElementById('deleteModal').dataset.targetId = id; document.getElementById('deleteModal').classList.add('is-open'); } });

    btnAdd.addEventListener('click', () => { modalTitle.textContent = 'Ajouter une catégorie'; form.reset(); idInput.value = ''; modal.classList.add('is-open'); });
    modalClose.addEventListener('click', () => modal.classList.remove('is-open'));
    btnCancelForm.addEventListener('click', () => modal.classList.remove('is-open'));

    document.getElementById('deleteModal').querySelector('#btnConfirmDelete').addEventListener('click', () => { const id = Number(document.getElementById('deleteModal').dataset.targetId); categories = categories.filter(c => c.id !== id); document.getElementById('deleteModal').classList.remove('is-open'); renderTable(); });

    form.addEventListener('submit', function (e) { e.preventDefault(); const id = idInput.value ? Number(idInput.value) : null; const data = { id: id || (categories.length ? Math.max(...categories.map(a => a.id)) + 1 : 1), name: nameInput.value.trim(), description: descInput.value.trim() }; if (!data.name) return alert('Nom requis'); if (id) { categories = categories.map(a => a.id === id ? Object.assign({}, a, data) : a); } else { categories.push(data); } modal.classList.remove('is-open'); renderTable(); });

    document.getElementById('deleteModal').querySelector('#deleteModalClose').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));
    document.getElementById('deleteModal').querySelector('#btnCancelDelete').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));

    renderTable();
  });
})();
