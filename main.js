document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('button[data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const toggleTheme = document.getElementById('theme-toggle');
  const notification = document.getElementById('notification');
  const body = document.body;

  // 🧭 Activation d'un onglet
  function activateTab(targetId) {
    tabContents.forEach(content => {
      content.classList.add('hidden');
      content.classList.remove('block');
    });

    tabButtons.forEach(btn => btn.classList.remove('active-tab'));

    const activeContent = document.getElementById(targetId);
    if (activeContent) {
      activeContent.classList.remove('hidden');
      activeContent.classList.add('block');
    }

    const activeButton = [...tabButtons].find(btn => btn.dataset.target === targetId);
    if (activeButton) activeButton.classList.add('active-tab');
  }

  // 🎯 Onglet par défaut
  if (tabButtons.length > 0) activateTab(tabButtons[0].dataset.target);

  // 🖱️ Gestion des clics sur les boutons d'onglet
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.target));
  });

  // === MENU DÉROULANT SECTIONS ===
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
      navToggle.querySelector('svg')?.classList.toggle('rotate-180');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.add('hidden');
        navToggle.querySelector('svg')?.classList.remove('rotate-180');
      }
    });

    const menuButtons = navMenu.querySelectorAll('button[data-target]');
    menuButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        activateTab(target);
        navMenu.classList.add('hidden');
        menuButtons.forEach(b => b.classList.remove('active-tab'));
        btn.classList.add('active-tab');
      });
    });
  }

  // 🎨 Gestion thème clair/sombre
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') body.classList.add('dark');

  toggleTheme.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // 🔔 Notifications visuelles
  function showNotif(msg, type = 'success') {
    notification.textContent = msg;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
  }

  // 💾 Formulaires : sauvegarde locale (renseignements généraux et cliniques)
  ['gen', 'cli'].forEach(prefix => {
    const form = document.getElementById(`form-${prefix}`);
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = {};
      form.querySelectorAll('input,textarea').forEach(el => data[el.id] = el.value);
      localStorage.setItem(`formData_${prefix}`, JSON.stringify(data));
      showNotif('Données sauvegardées');
    });

    const saved = localStorage.getItem(`formData_${prefix}`);
    if (saved) {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      });
    }
  });
});

// 📄 Export PDF
function exportPDF() {
  const visibleSection = [...document.querySelectorAll('.tab-content')]
    .find(sec => !sec.classList.contains('hidden') && sec.querySelector('form'));

  if (!visibleSection) return;

  const exportArea = visibleSection.querySelector('div[id^="export-area"]');
  if (!exportArea) return;

  html2pdf().set({
    margin:       10,
    filename:     'dossier_patient.pdf',
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(exportArea).save();
}

// 🖨️ Impression rapide
function imprimerDossier() {
  window.print();
}
