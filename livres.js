(function () {
  document.addEventListener('DOMContentLoaded', function () {
    let livres = [
      { id: 1, titre: 'Le Petit Prince', auteur: 'Antoine de Saint-Exupéry', categorie: 'Jeunesse', isbn: '978-0156013987', annee: 1943, statut: 'disponible' },
      { id: 2, titre: '1984', auteur: 'George Orwell', categorie: 'Science-fiction', isbn: '978-0451524935', annee: 1949, statut: 'emprunte' },
      { id: 3, titre: 'Sapiens', auteur: 'Yuval Noah Harari', categorie: 'Essai', isbn: '978-0062316110', annee: 2011, statut: 'disponible' }
    ];

    const categories = ['Jeunesse','Science-fiction','Fantasy','Essai','Classique'];

    let state = { page: 1, pageSize: 10, filter: '', category: '', status: '', sortBy: 'titre', sortOrder: 'asc' };

    const tableBody = document.getElementById('livresTableBody');
    const filterSearch = document.getElementById('filterSearch');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const sortBy = document.getElementById('sortBy');
    const sortOrder = document.getElementById('sortOrder');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const paginationInfo = document.getElementById('paginationInfo');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const pageSizeSelect = document.getElementById('pageSize');

    // Modal elements
    const modal = document.getElementById('livreModal');
    const form = document.getElementById('livreForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const btnAdd = document.getElementById('btnAddLivre');
    const btnCancelForm = document.getElementById('btnCancelForm');

    const idInput = document.getElementById('livreId');
    const titreInput = document.getElementById('livreTitre');
    const auteurInput = document.getElementById('livreAuteur');
    const categorieInput = document.getElementById('livreCategorie');
    const isbnInput = document.getElementById('livreISBN');
    const anneeInput = document.getElementById('livreAnnee');
    const statutInput = document.getElementById('livreStatut');

    function formatNumber(n) { return n == null ? '' : String(n); }

    // populate category select
    categories.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; filterCategory.appendChild(opt); categorieInput.appendChild(opt.cloneNode(true)); });

    function applyFiltersAndSort(list) {
      const f = state.filter.trim().toLowerCase();
      let res = list.filter(b => {
        if (f) { const text = (b.titre + ' ' + b.auteur + ' ' + (b.categorie||'')).toLowerCase(); if (!text.includes(f)) return false; }
        if (state.category) if (b.categorie !== state.category) return false;
        if (state.status) if (b.statut !== state.status) return false;
        return true;
      });
      res.sort((x,y) => { const key = state.sortBy; let a = x[key]||''; let b = y[key]||''; if (typeof a === 'string') a = a.toLowerCase(); if (typeof b === 'string') b = b.toLowerCase(); if (a < b) return state.sortOrder === 'asc' ? -1 : 1; if (a > b) return state.sortOrder === 'asc' ? 1 : -1; return 0; });
      return res;
    }

    function renderTable() {
      const filtered = applyFiltersAndSort(livres);
      const total = filtered.length;
      const pageSize = Number(state.pageSize || pageSizeSelect.value || 10);
      const totalPages = Math.max(1, Math.ceil(total / pageSize)); if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * pageSize; const end = Math.min(total, start + pageSize);

      tableBody.innerHTML = '';
      const frag = document.createDocumentFragment();
      filtered.slice(start, end).forEach(b => {
        const tr = document.createElement('tr'); tr.innerHTML = `
          <td>${b.id}</td>
          <td>${b.titre}</td>
          <td>${b.auteur}</td>
          <td>${b.categorie}</td>
          <td>${b.isbn}</td>
          <td>${formatNumber(b.annee)}</td>
          <td>${b.statut}</td>
          <td class="actions-cell"><button class="action-btn" data-act="edit" data-id="${b.id}">✏️</button><button class="action-btn" data-act="delete" data-id="${b.id}">🗑️</button></td>
        `; frag.appendChild(tr);
      });
      tableBody.appendChild(frag);

      paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} résultats`;
      btnPrevPage.disabled = state.page <= 1; btnNextPage.disabled = state.page >= totalPages;
      paginationNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.textContent = i; if (i === state.page) b.style.fontWeight = '700'; b.addEventListener('click', () => { state.page = i; renderTable(); }); paginationNumbers.appendChild(b); }
    }

    function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
    const onSearchChange = debounce(() => { state.filter = filterSearch.value; state.page = 1; renderTable(); }, 220);

    filterSearch.addEventListener('input', onSearchChange);
    filterCategory.addEventListener('change', () => { state.category = filterCategory.value; state.page = 1; renderTable(); });
    filterStatus.addEventListener('change', () => { state.status = filterStatus.value; state.page = 1; renderTable(); });
    btnClearFilters.addEventListener('click', () => { filterSearch.value = ''; filterCategory.value = ''; filterStatus.value = ''; state = { ...state, filter: '', category: '', status: '', page: 1 }; renderTable(); });

    sortBy.addEventListener('change', () => { state.sortBy = sortBy.value; renderTable(); });
    sortOrder.addEventListener('change', () => { state.sortOrder = sortOrder.value; renderTable(); });

    pageSizeSelect.addEventListener('change', () => { state.pageSize = Number(pageSizeSelect.value); state.page = 1; renderTable(); });
    btnPrevPage.addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); } });
    btnNextPage.addEventListener('click', () => { state.page++; renderTable(); });

    btnExportCSV.addEventListener('click', () => { const rows = [['ID','Titre','Auteur','Catégorie','ISBN','Année','Statut']]; applyFiltersAndSort(livres).forEach(b => rows.push([b.id,b.titre,b.auteur,b.categorie,b.isbn,b.annee,b.statut])); const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'livres.csv'; a.click(); URL.revokeObjectURL(a.href); });

    document.getElementById('livresTable').addEventListener('click', function (e) { const btn = e.target.closest('button[data-act]'); if (!btn) return; const id = Number(btn.dataset.id); const act = btn.dataset.act; const target = livres.find(x => x.id === id); if (act === 'edit') { modalTitle.textContent = 'Modifier un livre'; idInput.value = target.id; titreInput.value = target.titre; auteurInput.value = target.auteur; categorieInput.value = target.categorie; isbnInput.value = target.isbn; anneeInput.value = target.annee; statutInput.value = target.statut; modal.classList.add('is-open'); } else if (act === 'delete') { document.getElementById('deleteModal').dataset.targetId = id; document.getElementById('deleteModal').classList.add('is-open'); } });

    btnAdd.addEventListener('click', () => { modalTitle.textContent = 'Ajouter un livre'; form.reset(); idInput.value = ''; modal.classList.add('is-open'); });
    modalClose.addEventListener('click', () => modal.classList.remove('is-open'));
    btnCancelForm.addEventListener('click', () => modal.classList.remove('is-open'));

    document.getElementById('deleteModal').querySelector('#btnConfirmDelete').addEventListener('click', () => { const id = Number(document.getElementById('deleteModal').dataset.targetId); livres = livres.filter(l => l.id !== id); document.getElementById('deleteModal').classList.remove('is-open'); renderTable(); });

    form.addEventListener('submit', function (e) { e.preventDefault(); const id = idInput.value ? Number(idInput.value) : null; const data = { id: id || (livres.length ? Math.max(...livres.map(a => a.id)) + 1 : 1), titre: titreInput.value.trim(), auteur: auteurInput.value.trim(), categorie: categorieInput.value, isbn: isbnInput.value.trim(), annee: anneeInput.value ? Number(anneeInput.value) : null, statut: statutInput.value }; if (!data.titre) return alert('Titre requis'); if (id) { livres = livres.map(a => a.id === id ? Object.assign({}, a, data) : a); } else { livres.push(data); } modal.classList.remove('is-open'); renderTable(); });

    document.getElementById('deleteModal').querySelector('#deleteModalClose').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));
    document.getElementById('deleteModal').querySelector('#btnCancelDelete').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));

    renderTable();
  });
})();
