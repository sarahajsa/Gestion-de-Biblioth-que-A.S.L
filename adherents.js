(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Simulated data for adhérents
    let adherents = [
      { id: 1, nom: 'Dupont', prenom: 'Martin', email: 'm.dupont@example.com', telephone: '0601020304', adresse: '12 rue A', ville: 'Paris', codePostal: '75001', dateInscription: '2023-05-12', statut: 'actif', notes: '' },
      { id: 2, nom: 'Martin', prenom: 'Sophie', email: 's.martin@example.com', telephone: '0602030405', adresse: '4 avenue B', ville: 'Lyon', codePostal: '69001', dateInscription: '2022-11-02', statut: 'inactif', notes: '' },
      { id: 3, nom: 'Moreau', prenom: 'Luc', email: 'l.moreau@example.com', telephone: '', adresse: '', ville: 'Marseille', codePostal: '13001', dateInscription: '2024-01-15', statut: 'actif', notes: '' }
    ];

    let state = { page: 1, pageSize: 10, filter: '', status: '', dateInscription: '', sortBy: 'nom', sortOrder: 'asc' };

    const tableBody = document.getElementById('adherentsTableBody');
    const filterSearch = document.getElementById('filterSearch');
    const filterStatus = document.getElementById('filterStatus');
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

    const modal = document.getElementById('adherentModal');
    const form = document.getElementById('adherentForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const btnAdd = document.getElementById('btnAddAdherent');
    const btnCancelForm = document.getElementById('btnCancelForm');

    const idInput = document.getElementById('adherentId');
    const nomInput = document.getElementById('adherentNom');
    const prenomInput = document.getElementById('adherentPrenom');
    const emailInput = document.getElementById('adherentEmail');
    const telInput = document.getElementById('adherentTelephone');
    const adresseInput = document.getElementById('adherentAdresse');
    const villeInput = document.getElementById('adherentVille');
    const cpInput = document.getElementById('adherentCodePostal');
    const dateInscriptionInput = document.getElementById('adherentDateInscription');
    const statutInput = document.getElementById('adherentStatut');
    const notesInput = document.getElementById('adherentNotes');

    function formatDate(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('fr-FR'); }

    function applyFiltersAndSort(list) {
      const f = state.filter.trim().toLowerCase();
      let res = list.filter(a => {
        if (f) {
          const text = (a.nom + ' ' + a.prenom + ' ' + (a.email||'')).toLowerCase();
          if (!text.includes(f)) return false;
        }
        if (state.status) { if (a.statut !== state.status) return false; }
        if (state.dateInscription) { if (a.dateInscription !== state.dateInscription) return false; }
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
      const filtered = applyFiltersAndSort(adherents);
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
          <td>${a.email || ''}</td>
          <td>${a.telephone || ''}</td>
          <td>${formatDate(a.dateInscription)}</td>
          <td>${a.statut}</td>
          <td class="actions-cell">
            <button class="action-btn" data-act="details" data-id="${a.id}">🔍</button>
            <button class="action-btn" data-act="edit" data-id="${a.id}">✏️</button>
            <button class="action-btn" data-act="delete" data-id="${a.id}">🗑️</button>
          </td>
        `;
        frag.appendChild(tr);
      });
      tableBody.appendChild(frag);

      paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} résultats`;
      btnPrevPage.disabled = state.page <= 1;
      btnNextPage.disabled = state.page >= totalPages;

      paginationNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const b = document.createElement('button'); b.textContent = i; if (i === state.page) b.style.fontWeight = '700'; b.addEventListener('click', () => { state.page = i; renderTable(); }); paginationNumbers.appendChild(b);
      }
    }

    function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
    const onSearchChange = debounce(() => { state.filter = filterSearch.value; state.page = 1; renderTable(); }, 220);

    filterSearch.addEventListener('input', onSearchChange);
    filterStatus.addEventListener('change', () => { state.status = filterStatus.value; state.page = 1; renderTable(); });
    filterDate.addEventListener('change', () => { state.dateInscription = filterDate.value; state.page = 1; renderTable(); });
    btnClearFilters.addEventListener('click', () => { filterSearch.value = ''; filterStatus.value = ''; filterDate.value = ''; state = { ...state, filter: '', status: '', dateInscription: '', page: 1 }; renderTable(); });

    sortBy.addEventListener('change', () => { state.sortBy = sortBy.value; renderTable(); });
    sortOrder.addEventListener('change', () => { state.sortOrder = sortOrder.value; renderTable(); });

    pageSizeSelect.addEventListener('change', () => { state.pageSize = Number(pageSizeSelect.value); state.page = 1; renderTable(); });
    btnPrevPage.addEventListener('click', () => { if (state.page > 1) { state.page--; renderTable(); } });
    btnNextPage.addEventListener('click', () => { state.page++; renderTable(); });

    btnExportCSV.addEventListener('click', () => {
      const rows = [['ID','Nom','Prénom','Email','Téléphone','Date d inscription','Statut']];
      applyFiltersAndSort(adherents).forEach(a => rows.push([a.id,a.nom,a.prenom,a.email,a.telephone,a.dateInscription,a.statut]));
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'adherents.csv'; a.click(); URL.revokeObjectURL(url);
    });

    document.getElementById('adherentsTable').addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-act]'); if (!btn) return; const id = Number(btn.dataset.id); const act = btn.dataset.act; const target = adherents.find(x => x.id === id);
      if (act === 'details') {
        alert(`${target.nom} ${target.prenom}\nEmail: ${target.email}\nTel: ${target.telephone}\nStatut: ${target.statut}`);
      } else if (act === 'edit') {
        modalTitle.textContent = 'Modifier un adhérent'; idInput.value = target.id; nomInput.value = target.nom; prenomInput.value = target.prenom; emailInput.value = target.email; telInput.value = target.telephone; adresseInput.value = target.adresse; villeInput.value = target.ville; cpInput.value = target.codePostal; dateInscriptionInput.value = target.dateInscription; statutInput.value = target.statut; notesInput.value = target.notes || ''; modal.classList.add('is-open');
      } else if (act === 'delete') { document.getElementById('deleteModal').dataset.targetId = id; document.getElementById('deleteModal').classList.add('is-open'); }
    });

    btnAdd.addEventListener('click', () => { modalTitle.textContent = 'Ajouter un adhérent'; form.reset(); idInput.value = ''; modal.classList.add('is-open'); });
    modalClose.addEventListener('click', () => modal.classList.remove('is-open'));
    btnCancelForm.addEventListener('click', () => modal.classList.remove('is-open'));

    document.getElementById('deleteModal').querySelector('#btnConfirmDelete').addEventListener('click', () => { const id = Number(document.getElementById('deleteModal').dataset.targetId); adherents = adherents.filter(a => a.id !== id); document.getElementById('deleteModal').classList.remove('is-open'); renderTable(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); const id = idInput.value ? Number(idInput.value) : null; const data = { id: id || (adherents.length ? Math.max(...adherents.map(a => a.id)) + 1 : 1), nom: nomInput.value.trim(), prenom: prenomInput.value.trim(), email: emailInput.value.trim(), telephone: telInput.value.trim(), adresse: adresseInput.value.trim(), ville: villeInput.value.trim(), codePostal: cpInput.value.trim(), dateInscription: dateInscriptionInput.value || '', statut: statutInput.value, notes: notesInput.value.trim() }; if (!data.nom || !data.prenom) return alert('Nom et prénom requis'); if (id) { adherents = adherents.map(a => a.id === id ? Object.assign({}, a, data) : a); } else { adherents.push(data); } modal.classList.remove('is-open'); renderTable(); });

    // delete modal handlers
    document.getElementById('deleteModal').querySelector('#deleteModalClose').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));
    document.getElementById('deleteModal').querySelector('#btnCancelDelete').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));

    renderTable();
  });
})();
