
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorElement = document.getElementById('loginError');
  const btnLogin = document.getElementById('btnLogin');

  if (!form || !usernameInput || !passwordInput || !errorElement || !btnLogin) return;

  usernameInput.focus();

  // Raccourci : Entrée dans le champ nom d'utilisateur -> focus sur mot de passe
  usernameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInput.focus();
    }
  });

  // Basculer automatiquement si l'utilisateur s'arrête de taper (inactivité courte)
  (function () {
    let idleTimer = null;
    usernameInput.addEventListener('input', function () {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        if (document.activeElement === usernameInput && usernameInput.value.trim().length >= 3) {
          passwordInput.focus();
        }
      }, 800); // 800ms d'inactivité
    });
  })();

  function showError(text) {
    errorElement.textContent = text;
  }

  function setButtonLoading(loading) {
    btnLogin.disabled = loading;
    btnLogin.setAttribute('aria-busy', loading ? 'true' : 'false');
    btnLogin.textContent = loading ? 'Connexion…' : 'Se connecter';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    showError('');

    if (!username || !password) {
      showError("Veuillez renseigner le nom d'utilisateur et le mot de passe.");
      return;
    }

    // Indicateur de traitement léger (simule une requête réseau)
    setButtonLoading(true);

    setTimeout(() => {
      const EXPECTED_USERNAME = 'admin';
      const EXPECTED_PASSWORD = 'admin';

      const valid = username === EXPECTED_USERNAME && password === EXPECTED_PASSWORD;

      if (!valid) {
        showError('Identifiants incorrects. Utilisez admin / admin pour la démonstration.');
        passwordInput.value = '';
        passwordInput.focus();
        setButtonLoading(false);
        return;
      }

      try {
        localStorage.setItem('mymanager_isAuthenticated', 'true');
        localStorage.setItem('mymanager_username', username);
      } catch (e) {
        console.warn('Impossible d\'utiliser localStorage :', e);
      }

      // Redirection
      window.location.href = 'dashboard.html';
    }, 350);
  });
});

