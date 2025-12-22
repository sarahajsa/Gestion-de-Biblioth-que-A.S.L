// ============================================================================
// MyManager - Logique du Dashboard (JavaScript VANILLA)
// - Données simulées pour livres, adhérents, emprunts
// - Calcul et injection des KPI
// - Initialisation des 5 graphiques Chart.js
// - Interaction basique : sidebar mobile, bouton logout
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------------------------
  // 1. Sécurité : vérifier que l'on est bien sur le dashboard
  // -------------------------------------------------------------------------
  var dashboardMain = document.querySelector(".dashboard-main");
  if (!dashboardMain) {
    // Si la structure n'est pas celle du dashboard, on ne fait rien.
    return;
  }

  // -------------------------------------------------------------------------
  // 2. Données simulées
  // -------------------------------------------------------------------------

  // Livres de la bibliothèque
  var books = [
    {
      id: 1,
      title: "Le Cycle de Fondation",
      author: "Isaac Asimov",
      category: "Science-fiction",
      available: true,
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      category: "Science-fiction",
      available: false,
    },
    {
      id: 3,
      title: "L'Étranger",
      author: "Albert Camus",
      category: "Classique",
      available: true,
    },
    {
      id: 4,
      title: "Harry Potter et l'Ordre du Phénix",
      author: "J.K. Rowling",
      category: "Fantasy",
      available: false,
    },
    {
      id: 5,
      title: "Le Seigneur des Anneaux",
      author: "J.R.R. Tolkien",
      category: "Fantasy",
      available: true,
    },
    {
      id: 6,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      category: "Essai",
      available: true,
    },
    {
      id: 7,
      title: "La Horde du Contrevent",
      author: "Alain Damasio",
      category: "Science-fiction",
      available: true,
    },
    {
      id: 8,
      title: "Petit Pays",
      author: "Gaël Faye",
      category: "Roman contemporain",
      available: false,
    },
    {
      id: 9,
      title: "Les Misérables",
      author: "Victor Hugo",
      category: "Classique",
      available: true,
    },
    {
      id: 10,
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      category: "Jeunesse",
      available: true,
    },
  ];

  // Adhérents (uniquement pour simuler l'évolution sur 12 mois)
  var membersByMonth = [
    4, 6, 5, 8, 10, 12, 11, 14, 13, 15, 16, 18,
  ]; // nouveaux adhérents / mois

  // Emprunts par mois (12 mois)
  var loansByMonth = [25, 32, 28, 30, 35, 40, 38, 42, 39, 45, 48, 50];

  // Activité récente simulée
  var recentActivities = [
    {
      label: "Nouveau livre ajouté : « La Horde du Contrevent »",
      time: "Il y a 5 min",
    },
    {
      label: "Emprunt : « 1984 » par Martin Dupont",
      time: "Il y a 22 min",
    },
    {
      label: "Retour : « Le Seigneur des Anneaux »",
      time: "Il y a 1 h",
    },
    {
      label: "Nouvel adhérent inscrit : Sarah Martin",
      time: "Aujourd'hui",
    },
    {
      label: "Catégorie mise à jour : Science-fiction",
      time: "Hier",
    },
  ];

  // -------------------------------------------------------------------------
  // 3. Récupération des éléments du DOM
  // -------------------------------------------------------------------------

  // KPI
  var kpiTotalBooksEl = document.getElementById("kpiTotalBooks");
  var kpiActiveLoansEl = document.getElementById("kpiActiveLoans");
  var kpiMembersEl = document.getElementById("kpiMembers");
  var kpiLateLoansEl = document.getElementById("kpiLateLoans");
  var kpiAvailabilityEl = document.getElementById("kpiAvailability");

  // Nom de l'utilisateur (topbar + titre)
  var topbarUsernameEl = document.getElementById("topbarUsername");
  var dashboardUserNameEl = document.getElementById("dashboardUserName");

  // Panneau "sélection du jour"
  var featuredBookTitleEl = document.getElementById("featuredBookTitle");
  var featuredBookAuthorEl = document.getElementById("featuredBookAuthor");
  var featuredBookDescriptionEl = document.getElementById(
    "featuredBookDescription"
  );

  // Listes de livres
  var popularBooksListEl = document.getElementById("popularBooksList");
  var newBooksListEl = document.getElementById("newBooksList");

  // Activité récente
  var recentActivityListEl = document.getElementById("recentActivityList");

  // Footer
  var footerYearEl = document.getElementById("footerYear");

  // Sidebar / boutons
  var sidebarEl = document.querySelector(".sidebar");
  var sidebarToggleBtn = document.getElementById("sidebarToggle");
  var btnLogout = document.getElementById("btnLogout");
  var btnGoToBooks = document.getElementById("btnGoToBooks");

  // Canvases Chart.js
  var canvasBooksByCategory = document.getElementById("chartBooksByCategory");
  var canvasLoansByMonth = document.getElementById("chartLoansByMonth");
  var canvasNewMembers = document.getElementById("chartNewMembers");
  var canvasAvailability = document.getElementById("chartNewMembersAvailability"); // volontairement faux ? -> non, voir plus bas
  var canvasBooksByAuthor = document.getElementById("chartVisits");

  // Dans ASLdashboard.html, les IDs sont :
  // - chartBooksByCategory
  // - chartLoansByMonth
  // - chartNewMembers
  // Pour les deux autres graphiques demandés dans ce fichier, nous allons
  // réutiliser les cartes existantes en ajoutant les canvas si besoin :
  var availabilityCanvasId = "chartAvailability";
  var booksByAuthorCanvasId = "chartBooksByAuthor";

  // Création dynamique des deux canvas manquants si absent dans le HTML actuel
  if (!document.getElementById(availabilityCanvasId)) {
    var chartsSection = document.querySelector(".charts-section");
    if (chartsSection) {
      var availabilityCard = document.createElement("div");
      availabilityCard.className = "chart-card";

      var title = document.createElement("h3");
      title.className = "chart-title";
      title.textContent = "Disponibilité des livres";

      var canvas = document.createElement("canvas");
      canvas.id = availabilityCanvasId;

      availabilityCard.appendChild(title);
      availabilityCard.appendChild(canvas);
      chartsSection.appendChild(availabilityCard);
    }
  }

  if (!document.getElementById(booksByAuthorCanvasId)) {
    var chartsSection2 = document.querySelector(".charts-section");
    if (chartsSection2) {
      var authorsCard = document.createElement("div");
      authorsCard.className = "chart-card";

      var titleAuthors = document.createElement("h3");
      titleAuthors.className = "chart-title";
      titleAuthors.textContent = "Livres par auteur (Histogramme)";

      var canvasAuthors = document.createElement("canvas");
      canvasAuthors.id = booksByAuthorCanvasId;

      authorsCard.appendChild(titleAuthors);
      authorsCard.appendChild(canvasAuthors);
      chartsSection2.appendChild(authorsCard);
    }
  }

  var canvasAvailabilityDom = document.getElementById(availabilityCanvasId);
  var canvasBooksByAuthorDom = document.getElementById(booksByAuthorCanvasId);

  // -------------------------------------------------------------------------
  // 4. Gestion du nom d'utilisateur depuis le "login"
  // -------------------------------------------------------------------------

  var storedUsername = null;
  try {
    storedUsername = localStorage.getItem("mymanager_username");
  } catch (error) {
    storedUsername = null;
  }

  var usernameToDisplay = storedUsername || "admin";

  if (topbarUsernameEl) {
    topbarUsernameEl.textContent = usernameToDisplay;
  }
  if (dashboardUserNameEl) {
    dashboardUserNameEl.textContent =
      usernameToDisplay.charAt(0).toUpperCase() + usernameToDisplay.slice(1);
  }

  // -------------------------------------------------------------------------
  // 5. Calcul des statistiques de base
  // -------------------------------------------------------------------------

  var totalBooks = books.length;
  var availableBooks = books.filter(function (b) {
    return b.available;
  }).length;
  var borrowedBooks = totalBooks - availableBooks;

  var activeLoans = borrowedBooks; // Hypothèse simple : 1 livre non disponible = 1 emprunt actif
  var lateLoans = Math.round(activeLoans * 0.2); // 20% des emprunts en retard (simulation)

  var totalMembers = membersByMonth.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  var availabilityRate = totalBooks
    ? Math.round((availableBooks / totalBooks) * 100)
    : 0;

  // -------------------------------------------------------------------------
  // 6. Injection des KPI dans la page
  // -------------------------------------------------------------------------

  if (kpiTotalBooksEl) kpiTotalBooksEl.textContent = String(totalBooks);
  if (kpiActiveLoansEl) kpiActiveLoansEl.textContent = String(activeLoans);
  if (kpiMembersEl) kpiMembersEl.textContent = String(totalMembers);
  if (kpiLateLoansEl) kpiLateLoansEl.textContent = String(lateLoans);
  if (kpiAvailabilityEl) kpiAvailabilityEl.textContent = availabilityRate + "%";

  if (footerYearEl) {
    footerYearEl.textContent = String(new Date().getFullYear());
  }

  // -------------------------------------------------------------------------
  // 7. Remplissage du panneau "sélection du jour" + listes
  // -------------------------------------------------------------------------

  // Sélection du jour : on prend le premier livre non disponible (souvent populaire)
  var featuredBook =
    books.find(function (b) {
      return !b.available;
    }) || books[0];

  if (featuredBookTitleEl) {
    featuredBookTitleEl.textContent = featuredBook.title;
  }
  if (featuredBookAuthorEl) {
    featuredBookAuthorEl.textContent =
      featuredBook.author + " • " + featuredBook.category;
  }
  if (featuredBookDescriptionEl) {
    featuredBookDescriptionEl.textContent =
      "Ouvrage mis en avant aujourd'hui dans votre bibliothèque. Utilisez cette section pour suivre les titres clés et préparer vos recommandations aux lecteurs.";
  }

  // Liste des livres populaires (on choisit les non disponibles pour simuler la popularité)
  if (popularBooksListEl) {
    books
      .filter(function (b) {
        return !b.available;
      })
      .slice(0, 4)
      .forEach(function (book) {
        var li = document.createElement("li");
        var titleSpan = document.createElement("span");
        titleSpan.textContent = book.title;

        var metaSpan = document.createElement("span");
        metaSpan.textContent = book.author;
        metaSpan.style.color = "#6b7280";
        metaSpan.style.fontSize = "0.8rem";

        li.appendChild(titleSpan);
        li.appendChild(metaSpan);
        popularBooksListEl.appendChild(li);
      });
  }

  // Nouvelles acquisitions (on simule simplement avec les 4 derniers livres)
  if (newBooksListEl) {
    books
      .slice(-4)
      .forEach(function (book) {
        var li = document.createElement("li");
        var titleSpan = document.createElement("span");
        titleSpan.textContent = book.title;

        var metaSpan = document.createElement("span");
        metaSpan.textContent = book.category;
        metaSpan.style.color = "#6b7280";
        metaSpan.style.fontSize = "0.8rem";

        li.appendChild(titleSpan);
        li.appendChild(metaSpan);
        newBooksListEl.appendChild(li);
      });
  }

  // Activité récente
  if (recentActivityListEl) {
    recentActivities.forEach(function (activity) {
      var li = document.createElement("li");

      var labelSpan = document.createElement("span");
      labelSpan.textContent = activity.label;

      var timeSpan = document.createElement("span");
      timeSpan.textContent = activity.time;
      timeSpan.style.color = "#9ca3af";

      li.appendChild(labelSpan);
      li.appendChild(timeSpan);
      recentActivityListEl.appendChild(li);
    });
  }

  // -------------------------------------------------------------------------
  // 8. Initialisation des graphiques Chart.js
  // -------------------------------------------------------------------------

  // Petite fonction utilitaire pour vérifier que Chart.js est disponible
  function hasChartJs() {
    return typeof window.Chart !== "undefined";
  }

  if (!hasChartJs()) {
    // Si Chart.js n'est pas chargé, on s'arrête là pour la partie graphique.
    return;
  }

  // Labels des mois pour les graphiques
  var monthLabels = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  // --- Pie chart : livres par catégorie ------------------------------------
  if (canvasBooksByCategory instanceof HTMLCanvasElement) {
    var booksByCategoryMap = {};
    books.forEach(function (book) {
      var key = book.category;
      booksByCategoryMap[key] = (booksByCategoryMap[key] || 0) + 1;
    });

    var categoryLabels = Object.keys(booksByCategoryMap);
    var categoryData = categoryLabels.map(function (label) {
      return booksByCategoryMap[label];
    });

    new Chart(canvasBooksByCategory, {
      type: "pie",
      data: {
        labels: categoryLabels,
        datasets: [
          {
            data: categoryData,
            backgroundColor: [
              "#4f46e5",
              "#22c55e",
              "#f97316",
              "#0ea5e9",
              "#ec4899",
              "#facc15",
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12 },
          },
        },
      },
    });
  }

  // --- Bar chart : emprunts par mois ---------------------------------------
  if (canvasLoansByMonth instanceof HTMLCanvasElement) {
    new Chart(canvasLoansByMonth, {
      type: "bar",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Emprunts",
            data: loansByMonth,
            backgroundColor: "#4f46e5",
            borderRadius: 6,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 10 },
          },
        },
      },
    });
  }

  // --- Line chart : évolution des adhérents --------------------------------
  if (canvasNewMembers instanceof HTMLCanvasElement) {
    new Chart(canvasNewMembers, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Nouveaux adhérents",
            data: membersByMonth,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.15)",
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 2 },
          },
        },
      },
    });
  }

  // --- Donut chart : livres disponibles / empruntés ------------------------
  if (canvasAvailabilityDom instanceof HTMLCanvasElement) {
    new Chart(canvasAvailabilityDom, {
      type: "doughnut",
      data: {
        labels: ["Disponibles", "Empruntés"],
        datasets: [
          {
            data: [availableBooks, borrowedBooks],
            backgroundColor: ["#22c55e", "#f97316"],
          },
        ],
      },
      options: {
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // --- Histogramme (bar) : livres par auteur -------------------------------
  if (canvasBooksByAuthorDom instanceof HTMLCanvasElement) {
    var booksByAuthorMap = {};
    books.forEach(function (book) {
      var key = book.author;
      booksByAuthorMap[key] = (booksByAuthorMap[key] || 0) + 1;
    });

    var authorLabels = Object.keys(booksByAuthorMap);
    var authorData = authorLabels.map(function (label) {
      return booksByAuthorMap[label];
    });

    new Chart(canvasBooksByAuthorDom, {
      type: "bar", // Histogramme équivalent
      data: {
        labels: authorLabels,
        datasets: [
          {
            label: "Nombre de livres",
            data: authorData,
            backgroundColor: "#0ea5e9",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // 9. Interactions : sidebar mobile, bouton logout, CTA "Gérer les livres"
  // -------------------------------------------------------------------------

  if (sidebarEl && sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", function () {
      sidebarEl.classList.toggle("is-open");
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      try {
        localStorage.removeItem("mymanager_isAuthenticated");
        localStorage.removeItem("mymanager_username");
      } catch (error) {
        // Ignorer les erreurs de localStorage
      }
      window.location.href = "ASLlogin.html";
    });
  }

  if (btnGoToBooks) {
    btnGoToBooks.addEventListener("click", function () {
      window.location.href = "books.html";
    });
  }
});



