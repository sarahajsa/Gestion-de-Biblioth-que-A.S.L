(function () {
  // Logic for Auteurs page: list, search, sort, pagination, modals, export
  document.addEventListener('DOMContentLoaded', function () {
    // Simulated data
    let auteurs = [
      { id: 1, nom: 'Camus', prenom: 'Albert', dateNaissance: '1913-11-07', nationalite: 'Française', livres: 12, bio: 'Écrivain français.', site: '' },
      { id: 2, nom: 'Orwell', prenom: 'George', dateNaissance: '1903-06-25', nationalite: 'Anglaise', livres: 9, bio: 'Auteur de 1984.', site: '' },
      { id: 3, nom: 'Rowling', prenom: 'J.K.', dateNaissance: '1965-07-31', nationalite: 'Anglaise', livres: 15, bio: 'Auteure de Harry Potter.', site: '' },
      { id: 4, nom: 'Tolkien', prenom: 'J.R.R.', dateNaissance: '1892-01-03', nationalite: 'Anglaise', livres: 20, bio: 'Le Seigneur des Anneaux.', site: '' },
      { id: 5, nom: 'Damasio', prenom: 'Alain', dateNaissance: '1969-01-01', nationalite: 'Française', livres: 5, bio: 'La Horde du Contrevent.', site: '' }
    ];

    // State
    let state = { page: 1, pageSize: 10, filter: '', nationalite: '', dateNaissance: '', sortBy: 'nom', sortOrder: 'asc' };

    // Elements
    const tableBody = document.getElementById('auteursTableBody');
    const filterSearch = document.getElementById('filterSearch');
    const filterNationalite = document.getElementById('filterNationalite');
    const filterDate = document.getElementById('filterDate');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const sortBy = document.getElementById('sortBy');
    const sortOrder = document.getElementById('sortOrder');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const paginationInfo = document.getElementById('paginationInfo');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const pageSizeSelect = document.getElementById('pageSize');

    // Modals & forms
    const auteurModal = document.getElementById('auteurModal');
    const auteurForm = document.getElementById('auteurForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const btnAddAuteur = document.getElementById('btnAddAuteur');
    const btnCancelForm = document.getElementById('btnCancelForm');
    const auteurIdInput = document.getElementById('auteurId');
    const auteurNom = document.getElementById('auteurNom');
    const auteurPrenom = document.getElementById('auteurPrenom');
    const auteurDateNaissance = document.getElementById('auteurDateNaissance');
    const auteurNationalite = document.getElementById('auteurNationalite');
    const auteurBiographie = document.getElementById('auteurBiographie');

    const deleteModal = document.getElementById('deleteModal');
    const deleteModalClose = document.getElementById('deleteModalClose');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');

    const detailsModal = document.getElementById('auteurDetailsModal');
    const closeDetailsModal = document.getElementById('closeDetailsModal');

    // Utilities
    function formatDate(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('fr-FR'); }

    function applyFiltersAndSort(list) {
      const f = state.filter.trim().toLowerCase();
      let res = list.filter(a => {
        if (f) {
          const text = (a.nom + ' ' + a.prenom + ' ' + (a.nationalite||'')).toLowerCase();
          if (!text.includes(f)) return false;
        }
        if (state.nationalite) {
          if (a.nationalite !== state.nationalite) return false;
        }
        if (state.dateNaissance) {
          if (a.dateNaissance !== state.dateNaissance) return false;
        }
        return true;
      });

      res.sort((x, y) => {
        const key = state.sortBy;
        let a = x[key] || '';
        let b = y[key] || '';
        if (typeof a === 'string') a = a.toLowerCase();
        if (typeof b === 'string') b = b.toLowerCase();
        if (a < b) return state.sortOrder === 'asc' ? -1 : 1;
        if (a > b) return state.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      return res;
    }

    function renderTable() {
      const filtered = applyFiltersAndSort(auteurs);
      const total = filtered.length;
      const pageSize = Number(state.pageSize || pageSizeSelect.value || 10);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (state.page > totalPages) state.page = totalPages;

      const start = (state.page - 1) * pageSize;
      const end = Math.min(total, start + pageSize);

      tableBody.innerHTML = '';
      const frag = document.createDocumentFragment();
      filtered.slice(start, end).forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${a.id}</td>
          <td>${a.nom}</td>
          <td>${a.prenom}</td>
          <td>${formatDate(a.dateNaissance)}</td>
          <td>${a.nationalite || ''}</td>
          <td>${a.livres || 0}</td>
          <td class="actions-cell">
            <button class="action-btn" data-act="details" data-id="${a.id}" title="Détails">🔍</button>
            <button class="action-btn" data-act="edit" data-id="${a.id}" title="Modifier">✏️</button>
            <button class="action-btn" data-act="delete" data-id="${a.id}" title="Supprimer">🗑️</button>
          </td>
        `;
        frag.appendChild(tr);
      });
      tableBody.appendChild(frag);

      // Pagination UI
      paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} résultats`;
      btnPrevPage.disabled = state.page <= 1;
      btnNextPage.disabled = state.page >= totalPages;

      paginationNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const b = document.createElement('button');
        b.textContent = i;
        if (i === state.page) b.style.fontWeight = '700';
        b.addEventListener('click', () => { state.page = i; renderTable(); });
        paginationNumbers.appendChild(b);
      }
    }

    // Debounce for search
    function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }

    const onSearchChange = debounce(() => { state.filter = filterSearch.value; state.page = 1; renderTable(); }, 220);

    // Events
    filterSearch.addEventListener('input', onSearchChange);
    filterNationalite.addEventListener('change', () => { state.nationalite = filterNationalite.value; state.page = 1; renderTable(); });
    filterDate.addEventListener('change', () => { state.dateNaissance = filterDate.value; state.page = 1; renderTable(); });
    btnClearFilters.addEventListener('click', () => { filterSearch.value = ''; filterNationalite.value = ''; filterDate.value = ''; state = { ...state, filter: '', nationalite: '', dateNaissance: '', page: 1 }; renderTable(); });

    sortBy.addEventListener('change', () => { state.sortBy = sortBy.value; renderTable(); });
    sortOrder.addEventListener('change', () => { state.sortOrder = sortOrder.value; renderTable(); });

    pageSizeSelect.addEventListener('change', () => { state.pageSize = Number(pageSizeSelect.value); state.page = 1; renderTable(); });
    btnPrevPage.addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); } });
    btnNextPage.addEventListener('click', () => { state.page++; renderTable(); });

    // Export CSV
    btnExportCSV.addEventListener('click', () => {
      const rows = [ ['ID','Nom','Prénom','Date de naissance','Nationalité','Livres'] ];
      applyFiltersAndSort(auteurs).forEach(a => rows.push([a.id,a.nom,a.prenom,a.dateNaissance,a.nationalite,a.livres]));
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'auteurs.csv'; a.click(); URL.revokeObjectURL(url);
    });

    // Actions (details/edit/delete)
    document.getElementById('auteursTable').addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;
      const auteur = auteurs.find(x => x.id === id);
      if (act === 'details') {
        document.getElementById('detailsNom').textContent = auteur.nom + ' ' + auteur.prenom;
        document.getElementById('detailsNationalite').textContent = auteur.nationalite;
        document.getElementById('detailsBio').textContent = auteur.bio || '—';
        detailsModal.classList.add('is-open');
      } else if (act === 'edit') {
        modalTitle.textContent = 'Modifier un auteur';
        auteurIdInput.value = auteur.id;
        auteurNom.value = auteur.nom;
        auteurPrenom.value = auteur.prenom;
        auteurDateNaissance.value = auteur.dateNaissance;
        auteurNationalite.value = auteur.nationalite;
        auteurBiographie.value = auteur.bio;
        auteurModal.classList.add('is-open');
      } else if (act === 'delete') {
        deleteModal.classList.add('is-open');
        deleteModal.dataset.targetId = id;
      }
    });

    // Add auteur
    btnAddAuteur.addEventListener('click', () => {
      modalTitle.textContent = 'Ajouter un auteur';
      auteurForm.reset(); auteurIdInput.value = '';
      auteurModal.classList.add('is-open');
    });

    // Modal close handlers
    modalClose.addEventListener('click', () => auteurModal.classList.remove('is-open'));
    btnCancelForm.addEventListener('click', () => auteurModal.classList.remove('is-open'));
    detailsModal.querySelector('#btnCloseDetails').addEventListener('click', () => detailsModal.classList.remove('is-open'));

    // Delete modal handlers
    deleteModalClose.addEventListener('click', () => deleteModal.classList.remove('is-open'));
    btnCancelDelete.addEventListener('click', () => deleteModal.classList.remove('is-open'));
    btnConfirmDelete.addEventListener('click', () => {
      const id = Number(deleteModal.dataset.targetId);
      auteurs = auteurs.filter(a => a.id !== id);
      deleteModal.classList.remove('is-open');
      renderTable();
    });

    // Save auteur
    auteurForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const id = auteurIdInput.value ? Number(auteurIdInput.value) : null;
      const data = {
        id: id || (auteurs.length ? Math.max(...auteurs.map(a => a.id)) + 1 : 1),
        nom: auteurNom.value.trim(), prenom: auteurPrenom.value.trim(), dateNaissance: auteurDateNaissance.value || '',
        nationalite: auteurNationalite.value, bio: auteurBiographie.value.trim(), livres: 0
      };
      if (!data.nom || !data.prenom) return alert('Nom et prénom requis');
      if (id) {
        auteurs = auteurs.map(a => a.id === id ? Object.assign({}, a, data) : a);
      } else {
        auteurs.push(data);
      }
      auteurModal.classList.remove('is-open');
      renderTable();
    });

    // Initial render
    renderTable();
  });
})();