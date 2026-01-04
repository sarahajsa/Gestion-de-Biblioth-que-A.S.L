# MI BIBLIO — Backoffice de gestion de bibliothèque

MI BIBLIO est une interface d'administration légère et responsive pour gérer une bibliothèque : livres, auteurs, adhérents, catégories et emprunts. L'application est réalisée en HTML/CSS/Vanilla JavaScript et fournie sous forme de pages statiques (front-end).

## Pages principales
- `dashboard.html` — Tableau de bord avec KPIs et graphiques
- `livres.html` — Gestion CRUD des livres
- `auteurs.html` — Gestion CRUD des auteurs
- `adherents.html` — Gestion CRUD des adhérents
- `categories.html` — Gestion CRUD des catégories
- `emprunts.html` — Suivi des emprunts et retours
- `login.html` — Page de connexion (maquette)

## Fonctionnalités
- Listes avec recherche, filtres et tri
- Pagination et navigation par pages
- Modals pour création / modification d'entités
- Suppression avec confirmation
- Export CSV pour les tableaux

## Structure du projet

```
├─ index.html (ou dashboard.html)
├─ styles.css
├─ dashboard.js
├─ livres.html / livres.css / livres.js
├─ auteurs.html / auteurs.css / auteurs.js
├─ adherents.html / adherents.css / adherents.js
├─ categories.html / categories.css / categories.js
├─ emprunts.html / emprunts.css / emprunts.js
└─ README.md
```

## Stack technique
- HTML5, CSS3 (responsive)
- Vanilla JavaScript (ES6+)
- Font Awesome (icônes)

## Lancer le projet en local

1. Cloner le dépôt :

```bash
git clone https://github.com/sarahajsa/Gestion-de-Biblioth-que-A.S.L
cd Gestion-de-Biblioth-que-A.S.L
```

2. Ouvrir les pages dans un navigateur. Pour un rafraîchissement automatique, installez l'extension Live Server et lancez-la depuis VS Code.

## Personnalisation et données
- Les exemples de données sont gérés en local via les fichiers JS (mock). Pour connecter une API, adaptez les appels dans les fichiers `*.js` correspondants.

## Contribution
- Faites une branche, effectuez vos changements et ouvrez une pull request. Documentez les modifications dans le README.

## Licence
- À renseigner selon l'utilisation souhaitée.

---

Si vous souhaitez, je peux :
- Ajouter un fichier `CHANGELOG.md`.
- Préparer un script de build ou une mini-API mock (JSON) pour tester les échanges.
