const livres = [
  { id: 1, titre: "1984", auteur: "George Orwell", categorie: "Roman", dispo: true },
  { id: 2, titre: "Sapiens", auteur: "Yuval Noah Harari", categorie: "Histoire", dispo: false },
  { id: 3, titre: "Clean Code", auteur: "Robert C. Martin", categorie: "Informatique", dispo: true }
];

const container = document.getElementById("livresTable");

function render(data) {
  container.innerHTML = `
    <div class="table-row header">
      <div>Titre</div>
      <div>Auteur</div>
      <div>Catégorie</div>
      <div>Status</div>
      <div>Action</div>
    </div>
  `;

  data.forEach(l => {
    container.innerHTML += `
      <div class="table-row data">
        <div>${l.titre}</div>
        <div>${l.auteur}</div>
        <div>${l.categorie}</div>
        <div>
          <span class="${l.dispo ? 'badge-ok' : 'badge-no'}">
            ${l.dispo ? 'Disponible' : 'Emprunté'}
          </span>
        </div>
        <div>
          <button class="btn-delete" onclick="alert('Supprimer ${l.titre}')">
            🗑️
          </button>
        </div>
      </div>
    `;
  });
}

document.getElementById("search").addEventListener("input", e => {
  const val = e.target.value.toLowerCase();
  render(livres.filter(l =>
    Object.values(l).some(v => v.toString().toLowerCase().includes(val))
  ));
});

render(livres);
