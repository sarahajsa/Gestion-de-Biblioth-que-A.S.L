(function () {
  document.addEventListener('DOMContentLoaded', function () {
    let emprunts = [
      { id: 1, livre: '1984', adherent: 'Martin Dupont', dateEmprunt: '2025-12-01', dateRetour: '2025-12-15', statut: 'en_cours' },
      { id: 2, livre: 'Sapiens', adherent: 'Sophie Martin', dateEmprunt: '2025-11-05', dateRetour: '2025-11-20', statut: 'rendu' }
    ];

    let state = { page: 1, pageSize: 10, filter: '', status: '' };

    const tableBody = document.getElementById('empruntsTableBody');
    const filterSearch = document.getElementById('filterSearch');
    const filterStatus = document.getElementById('filterStatus');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const paginationInfo = document.getElementById('paginationInfo');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');
    const pageSizeSelect = document.getElementById('pageSize');

    const modal = document.getElementById('empruntModal');
    const form = document.getElementById('empruntForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const btnAdd = document.getElementById('btnAddEmprunt');
    const btnCancelForm = document.getElementById('btnCancelForm');

    const idInput = document.getElementById('empruntId');
    const livreInput = document.getElementById('empruntLivre');
    const adherentInput = document.getElementById('empruntAdherent');
    const dateEmpruntInput = document.getElementById('dateEmprunt');
    const dateRetourInput = document.getElementById('dateRetour');
    const statutInput = document.getElementById('empruntStatut');

    function formatDate(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('fr-FR'); }

    function applyFilters(list) {
      const f = state.filter.trim().toLowerCase();
      return list.filter(e => {
        if (f) { const text = (e.livre + ' ' + e.adherent).toLowerCase(); if (!text.includes(f)) return false; }
        if (state.status) if (e.statut !== state.status) return false;
        return true;
      });
    }

    function renderTable() {
      const filtered = applyFilters(emprunts);
      const total = filtered.length;
      const pageSize = Number(state.pageSize || pageSizeSelect.value || 10);
      const totalPages = Math.max(1, Math.ceil(total / pageSize)); if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * pageSize; const end = Math.min(total, start + pageSize);

      tableBody.innerHTML = '';
      const frag = document.createDocumentFragment();
      filtered.slice(start, end).forEach(e => {
        const tr = document.createElement('tr'); tr.innerHTML = `
          <td>${e.id}</td>
          <td>${e.livre}</td>
          <td>${e.adherent}</td>
          <td>${formatDate(e.dateEmprunt)}</td>
          <td>${formatDate(e.dateRetour)}</td>
          <td>${e.statut}</td>
          <td class="actions-cell"><button class="action-btn" data-act="edit" data-id="${e.id}">✏️</button><button class="action-btn" data-act="delete" data-id="${e.id}">🗑️</button></td>
        `; frag.appendChild(tr);
      });
      tableBody.appendChild(frag);

      paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} résultats`;
      btnPrevPage.disabled = state.page <= 1; btnNextPage.disabled = state.page >= totalPages; paginationNumbers.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.textContent = i; if (i === state.page) b.style.fontWeight = '700'; b.addEventListener('click', () => { state.page = i; renderTable(); }); paginationNumbers.appendChild(b); }
    }

    function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
    const onSearchChange = debounce(() => { state.filter = filterSearch.value; state.page = 1; renderTable(); }, 220);

    filterSearch.addEventListener('input', onSearchChange);
    filterStatus.addEventListener('change', () => { state.status = filterStatus.value; state.page = 1; renderTable(); });
    btnClearFilters.addEventListener('click', () => { filterSearch.value = ''; filterStatus.value = ''; state = { ...state, filter: '', status: '', page: 1 }; renderTable(); });

    btnExportCSV.addEventListener('click', () => { const rows = [['ID','Livre','Adhérent','Date emprunt','Date retour','Statut']]; applyFilters(emprunts).forEach(e => rows.push([e.id,e.livre,e.adherent,e.dateEmprunt,e.dateRetour,e.statut])); const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = 'emprunts.csv'; a.click(); });

    document.getElementById('empruntsTable').addEventListener('click', function (e) { const btn = e.target.closest('button[data-act]'); if (!btn) return; const id = Number(btn.dataset.id); const act = btn.dataset.act; const target = emprunts.find(x => x.id === id); if (act === 'edit') { modalTitle.textContent = 'Modifier un emprunt'; idInput.value = target.id; livreInput.value = target.livre; adherentInput.value = target.adherent; dateEmpruntInput.value = target.dateEmprunt; dateRetourInput.value = target.dateRetour; statutInput.value = target.statut; modal.classList.add('is-open'); } else if (act === 'delete') { document.getElementById('deleteModal').dataset.targetId = id; document.getElementById('deleteModal').classList.add('is-open'); } });

    btnAdd.addEventListener('click', () => { modalTitle.textContent = 'Enregistrer un emprunt'; form.reset(); idInput.value = ''; modal.classList.add('is-open'); });
    modalClose.addEventListener('click', () => modal.classList.remove('is-open'));
    btnCancelForm.addEventListener('click', () => modal.classList.remove('is-open'));

    document.getElementById('deleteModal').querySelector('#btnConfirmDelete').addEventListener('click', () => { const id = Number(document.getElementById('deleteModal').dataset.targetId); emprunts = emprunts.filter(e => e.id !== id); document.getElementById('deleteModal').classList.remove('is-open'); renderTable(); });

    form.addEventListener('submit', function (e) { e.preventDefault(); const id = idInput.value ? Number(idInput.value) : null; const data = { id: id || (emprunts.length ? Math.max(...emprunts.map(a => a.id)) + 1 : 1), livre: livreInput.value.trim(), adherent: adherentInput.value.trim(), dateEmprunt: dateEmpruntInput.value || '', dateRetour: dateRetourInput.value || '', statut: statutInput.value }; if (!data.livre || !data.adherent) return alert('Livre et adhérent requis'); if (id) { emprunts = emprunts.map(a => a.id === id ? Object.assign({}, a, data) : a); } else { emprunts.push(data); } modal.classList.remove('is-open'); renderTable(); });

    document.getElementById('deleteModal').querySelector('#deleteModalClose').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));
    document.getElementById('deleteModal').querySelector('#btnCancelDelete').addEventListener('click', () => document.getElementById('deleteModal').classList.remove('is-open'));

    renderTable();
  });
})();
