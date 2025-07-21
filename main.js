document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn, [data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const toggleTheme = document.getElementById('theme-toggle');
  const notification = document.getElementById('notification');
  const body = document.body;

  // === Onglet dynamique avec data-target
  function activateTab(targetId) {
    tabContents.forEach(content => {
      content.classList.add('hidden');
      content.classList.remove('block');
    });

    tabButtons.forEach(btn => {
      btn.classList.remove('active-tab');
    });

    const activeContent = document.getElementById(targetId);
    if (activeContent) {
      activeContent.classList.remove('hidden');
      activeContent.classList.add('block');
    }

    tabButtons.forEach(btn => {
      if (btn.dataset.target === targetId) {
        btn.classList.add('active-tab');
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target) activateTab(target);
    });
  });

  const firstBtn = [...tabButtons].find(btn => btn.dataset.target);
  if (firstBtn) activateTab(firstBtn.dataset.target);

  // === Menu déroulant
  navToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('hidden');
    navToggle.querySelector('svg')?.classList.toggle('rotate-180');
  });

  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.add('hidden');
      navToggle.querySelector('svg')?.classList.remove('rotate-180');
    }
  });

  // === Thème sombre
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') body.classList.add('dark');

  toggleTheme?.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // === Notification
  function showNotif(message, type = 'success') {
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white bg-${type === 'success' ? 'green' : 'red'}-500`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
  }

  // === Sauvegarde formulaires
  ['gen', 'cli'].forEach(prefix => {
    const form = document.getElementById(`form-${prefix}`);
    form?.addEventListener('submit', e => {
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

// === Impression simple
function imprimerDossier() {
  window.print();
}

// === Export PDF avec html2pdf.js
function exportPDF() {
  const visibleForm = [...document.querySelectorAll('.tab-content')]
    .find(sec => !sec.classList.contains('hidden') && sec.querySelector('form'));
  const contentToExport = visibleForm?.querySelector('div[id^="export-area"]');

  if (!contentToExport) return;

  const opt = {
    margin: 10,
    filename: 'dossier_patient.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(contentToExport).save();
}
