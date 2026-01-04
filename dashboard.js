(function () {
  // Header/topbar logic reintegrée (langue, sidebar, auth)
  document.addEventListener('DOMContentLoaded', function () {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    

    // Lang dropdown
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown) {
      const toggle = langDropdown.querySelector('.lang-toggle');
      const menu = langDropdown.querySelector('.dropdown-menu');

      toggle && toggle.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('show'); });
      document.addEventListener('click', function (e) { if (!langDropdown.contains(e.target)) menu.classList.remove('show'); });
      menu && menu.addEventListener('click', function (e) { const opt = e.target.closest('.lang-option'); if (opt) { e.preventDefault(); changeLanguage(opt.dataset.lang); menu.classList.remove('show'); } });
    }

    function changeLanguage(lang) { console.log('Changement de langue vers:', lang); }

    const logoutBtn = document.getElementById('btnLogout');
    logoutBtn && logoutBtn.addEventListener('click', function () { if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) { try { localStorage.removeItem('mymanager_isAuthenticated'); } catch (e) {} window.location.href = 'login.html'; } });

    const sidebarToggle = document.getElementById('sidebarToggle');
    sidebarToggle && sidebarToggle.addEventListener('click', function () { const sidebar = document.querySelector('.sidebar'); sidebar && sidebar.classList.toggle('is-open'); });

    document.addEventListener('click', function (e) { const sidebar = document.querySelector('.sidebar'); const sidebarToggle = document.getElementById('sidebarToggle'); if (sidebar && sidebar.classList.contains('is-open') && !sidebar.contains(e.target) && (!sidebarToggle || !sidebarToggle.contains(e.target))) { sidebar.classList.remove('is-open'); } });

    const topbarUsernameEl = document.getElementById('topbarUsername');
    const dashboardUserNameEl = document.getElementById('dashboardUserName');
    function loadUsername() { try { const storedUsername = localStorage.getItem('mymanager_username') || 'admin'; topbarUsernameEl && (topbarUsernameEl.textContent = storedUsername); dashboardUserNameEl && (dashboardUserNameEl.textContent = storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1)); } catch (e) {} }
    loadUsername();

    // Active automatiquement le lien de navigation correspondant à la page courante
    (function setActiveNavLink() {
      try {
        const path = window.location.pathname || window.location.href;
        const currentFile = String(path).split('/').pop().toLowerCase();
        const links = document.querySelectorAll('.sidebar-nav .nav-link');
        links.forEach(link => {
          const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
          if (!href) return;
          if (href === currentFile || (currentFile === '' && href === 'dashboard.html')) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      } catch (e) { /* silent */ }
    })();

    // checkAuth disabled by default
  });
})();

// ============================================================================
// MI BIBLIO - Logique du Dashboard
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
  // Vérifier que l'on est bien sur le dashboard
  const dashboardMain = document.querySelector('.dashboard-main');
  if (!dashboardMain) return;

  // Données (simulées)
  const books = [
    { id: 1, title: 'Le Cycle de Fondation', author: 'Isaac Asimov', category: 'Science-fiction', available: true },
    { id: 2, title: '1984', author: 'George Orwell', category: 'Science-fiction', available: false },
    { id: 3, title: "L'Étranger", author: 'Albert Camus', category: 'Classique', available: true },
    { id: 4, title: "Harry Potter et l'Ordre du Phénix", author: 'J.K. Rowling', category: 'Fantasy', available: false },
    { id: 5, title: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien', category: 'Fantasy', available: true },
    { id: 6, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Essai', available: true },
    { id: 7, title: 'La Horde du Contrevent', author: 'Alain Damasio', category: 'Science-fiction', available: true },
    { id: 8, title: 'Petit Pays', author: 'Gaël Faye', category: 'Roman contemporain', available: false },
    { id: 9, title: 'Les Misérables', author: 'Victor Hugo', category: 'Classique', available: true },
    { id: 10, title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', category: 'Jeunesse', available: true }
  ];

  const membersByMonth = [4, 6, 5, 8, 10, 12, 11, 14, 13, 15, 16, 18];
  const loansByMonth = [25, 32, 28, 30, 35, 40, 38, 42, 39, 45, 48, 50];

  // Sélection d'éléments DOM importants
  const kpiTotalBooksEl = document.getElementById('kpiTotalBooks');
  const kpiActiveLoansEl = document.getElementById('kpiActiveLoans');
  const kpiMembersEl = document.getElementById('kpiMembers');
  const kpiLateLoansEl = document.getElementById('kpiLateLoans');
  const footerYearEl = document.getElementById('footerYear');

  const canvasBooksByCategory = document.getElementById('chartBooksByCategory');
  const canvasAvailability = document.getElementById('chartAvailability');
  const canvasBooksByCategoryAlt = document.getElementById('chartBooksByCategoryAlt');
  const canvasLoansByMonth = document.getElementById('chartLoansByMonth');
  const canvasNewMembers = document.getElementById('chartNewMembers');

  // Calcul des statistiques
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.available).length;
  const borrowedBooks = totalBooks - availableBooks;
  const activeLoans = borrowedBooks;
  const lateLoans = Math.round(activeLoans * 0.2);
  const totalMembers = membersByMonth.reduce((s, v) => s + v, 0);
  const availabilityRate = totalBooks ? Math.round((availableBooks / totalBooks) * 100) : 0;

  // Mise à jour des KPI (batch)
  const updates = [
    { el: kpiTotalBooksEl, value: totalBooks },
    { el: kpiActiveLoansEl, value: activeLoans },
    { el: kpiMembersEl, value: totalMembers },
    { el: kpiLateLoansEl, value: lateLoans }
  ];
  updates.forEach(u => u.el && (u.el.textContent = String(u.value)));

  footerYearEl && (footerYearEl.textContent = String(new Date().getFullYear()));

  // Initialisation des graphiques (lazy + non bloquant)
  function initCharts() {
    if (initCharts._done) return;
    initCharts._done = true;

    if (typeof window.Chart === 'undefined') {
      console.warn("Chart.js n'est pas chargé");
      return;
    }

    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    if (canvasBooksByCategory instanceof HTMLCanvasElement || canvasBooksByCategoryAlt instanceof HTMLCanvasElement) {
      // Calcul unique des données par catégorie
      const booksByCategoryMap = books.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + 1; return acc; }, {});
      const categoryLabels = Object.keys(booksByCategoryMap);
      const categoryData = categoryLabels.map(l => booksByCategoryMap[l]);
      const palette = ['#4f46e5', '#22c55e', '#f97316', '#0ea5e9', '#ec4899', '#facc15'];
      const colors = categoryLabels.map((_, i) => palette[i % palette.length]);

      // Pie (existante)
      if (canvasBooksByCategory instanceof HTMLCanvasElement) {
        new Chart(canvasBooksByCategory, {
          type: 'pie',
          data: { labels: categoryLabels, datasets: [{ data: categoryData, backgroundColor: colors }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } } }
        });
      }

      // Barres horizontales (nouveau)
      if (canvasBooksByCategoryAlt instanceof HTMLCanvasElement) {
        new Chart(canvasBooksByCategoryAlt, {
          type: 'bar',
          data: { labels: categoryLabels, datasets: [{ data: categoryData, backgroundColor: colors, borderRadius: 6 }] },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'nearest' } },
            scales: { x: { beginAtZero: true } }
          }
        });
      }
    }

      // Doughnut chart : disponibilité (disponibles vs empruntés)
      if (canvasAvailability instanceof HTMLCanvasElement) {
        new Chart(canvasAvailability, {
          type: 'doughnut',
          data: {
            labels: ['Disponibles', 'Empruntés'],
            datasets: [{ data: [availableBooks, borrowedBooks], backgroundColor: ['#22c55e', '#ef4444'] }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: { legend: { position: 'bottom' } }
          },
          plugins: [{
            id: 'center-text',
            afterDraw: (chart) => {
              const {ctx, chartArea: {left, right, top, bottom}} = chart;
              ctx.save();
              ctx.fillStyle = '#374151';
              ctx.font = '600 18px Inter, Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              const cx = (left + right) / 2;
              const cy = (top + bottom) / 2;
              ctx.fillText(availabilityRate + '%', cx, cy);
              ctx.restore();
            }
          }]
        });
      }

    if (canvasLoansByMonth instanceof HTMLCanvasElement) {
      new Chart(canvasLoansByMonth, {
        type: 'bar',
        data: { labels: monthLabels, datasets: [{ label: 'Emprunts', data: loansByMonth, backgroundColor: '#4f46e5', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } } }
      });
    }

    if (canvasNewMembers instanceof HTMLCanvasElement) {
      new Chart(canvasNewMembers, {
        type: 'line',
        data: { labels: monthLabels, datasets: [{ label: 'Nouveaux adhérents', data: membersByMonth, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', tension: 0.35, fill: true, pointRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } } }
      });
    }
  }

  // Observateur : initialise les charts lorsque la section devient visible
  const chartsSection = document.querySelector('.charts-section');
  if (chartsSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => { if (entry.isIntersecting) { initCharts(); o.disconnect(); } });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });
    obs.observe(chartsSection);
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(initCharts, { timeout: 1000 });
  } else {
    setTimeout(initCharts, 500);
  }
});