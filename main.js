document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const targetId = button.textContent.trim().toLowerCase();

      // Désactiver tous les onglets
      tabButtons.forEach(btn => btn.classList.remove('active-tab'));
      tabContents.forEach(content => content.classList.add('hidden'));

      // Activer l'onglet cliqué
      button.classList.add('active-tab');
      const contentToShow = document.getElementById(targetId);
      if (contentToShow) {
        contentToShow.classList.remove('hidden');
        contentToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Activer automatiquement le premier onglet au chargement
  const defaultTab = document.querySelector('.tab-btn');
  if (defaultTab) defaultTab.click();
});
