// ============================================================================
// MyManager - Logique de la page de connexion (JavaScript VANILLA)
// - Vérifie les identifiants saisis (username / password)
// - Affiche un message d'erreur en cas de problème
// - Sauvegarde une "session" simple dans localStorage
// - Redirige vers ASLdashboard.html en cas de succès
// ============================================================================

// On attend que tout le HTML soit chargé avant d'accéder aux éléments
document.addEventListener("DOMContentLoaded", function () {
  // Récupération des éléments du formulaire
  var form = document.getElementById("loginForm");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var errorElement = document.getElementById("loginError");

  // Sécurité : si la structure HTML change et que les éléments n'existent plus,
  // on évite d'exécuter la logique pour ne pas casser la page.
  if (!form || !usernameInput || !passwordInput || !errorElement) {
    return;
  }

  // Focus automatique sur le champ "username" pour améliorer l'expérience
  usernameInput.focus();

  // Gestion de la soumission du formulaire
  form.addEventListener("submit", function (event) {
    // Empêche le rechargement de la page
    event.preventDefault();

    // On récupère les valeurs saisies et on enlève les espaces inutiles
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // On nettoie l'ancien message d'erreur
    errorElement.textContent = "";

    // 1) Vérifications simples des champs
    if (!username || !password) {
      errorElement.textContent =
        "Veuillez renseigner le nom d'utilisateur et le mot de passe.";
      return;
    }

    // 2) Vérification des identifiants attendus
    var EXPECTED_USERNAME = "admin";
    var EXPECTED_PASSWORD = "admin";

    var areCredentialsValid =
      username === EXPECTED_USERNAME && password === EXPECTED_PASSWORD;

    if (!areCredentialsValid) {
      // Identifiants incorrects : on informe l'utilisateur
      errorElement.textContent =
        "Identifiants incorrects. Utilisez admin / admin pour la démonstration.";

      // On efface le mot de passe et on remet le focus dessus
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    // 3) Identifiants corrects : on simule une session avec localStorage
    try {
      // On enregistre un simple "flag" de connexion
      localStorage.setItem("mymanager_isAuthenticated", "true");
      localStorage.setItem("mymanager_username", username);

      // Optionnel : on pourrait stocker une heure de connexion ou un rôle
      // localStorage.setItem("mymanager_role", "admin");
    } catch (error) {
      // Si le stockage local est désactivé, on ignore l'erreur
      // La redirection se fera quand même.
      console.warn("Impossible d'utiliser localStorage :", error);
    }

    // 4) Redirection vers le dashboard
    window.location.href = "ASLdashboard.html";
  });
});


