document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('button[data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const toggleTheme = document.getElementById('theme-toggle');
  const notification = document.getElementById('notification');
  const body = document.body;

  // 🔄 Active a tab
  function activateTab(targetId) {
    tabContents.forEach(content => {
      content.classList.add('hidden');
    });

    tabButtons.forEach(btn => btn.classList.remove('active-tab'));

    const activeContent = document.getElementById(targetId);
    const activeButton = [...tabButtons].find(btn => btn.dataset.target === targetId);

    if (activeContent) activeContent.classList.remove('hidden');
    if (activeButton) activeButton.classList.add('active-tab');
  }

  // 🌘 Light/Dark mode
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') body.classList.add('dark');

  toggleTheme.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // 📋 Tab switching via menu or buttons
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.target;
      activateTab(tab);
      navMenu.classList.add('hidden');
    });
  });

  if (tabButtons.length) activateTab(tabButtons[0].dataset.target);

  // 📂 Menu toggle
  navToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('hidden');
    navToggle.querySelector('svg')?.classList.toggle('rotate-180');
  });

  document.addEventListener('click', e => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navMenu.classList.add('hidden');
      navToggle.querySelector('svg')?.classList.remove('rotate-180');
    }
  });

  // 🔔 Notification function
  function showNotif(msg, type = 'success') {
    notification.textContent = msg;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
  }

  // 💾 Save forms (gen, cli)
  ['gen', 'cli'].forEach(prefix => {
    const form = document.getElementById(`form-${prefix}`);
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = {};
      form.querySelectorAll('input,textarea').forEach(el => data[el.id] = el.value);
      localStorage.setItem(`formData_${prefix}`, JSON.stringify(data));
      showNotif('Données sauvegardées ✅');
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

  // ✏️ Notes section
  const notesArea = document.getElementById('notes-area');
  const saveNotesBtn = document.getElementById('save-notes');
  if (notesArea && saveNotesBtn) {
    const savedNote = localStorage.getItem('notes');
    if (savedNote) notesArea.value = savedNote;

    saveNotesBtn.addEventListener('click', () => {
      localStorage.setItem('notes', notesArea.value);
      showNotif('Notes enregistrées 📒');
    });
  }
});

// 📄 Export PDF
function exportPDF() {
  const visibleSection = [...document.querySelectorAll('.tab-content')]
    .find(sec => !sec.classList.contains('hidden') && sec.querySelector('form'));

  if (!visibleSection) return;

  const exportArea = visibleSection.querySelector('div[id^="export-area"]');
  if (!exportArea) return;

  html2pdf().set({
    margin: 10,
    filename: 'dossier_patient.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(exportArea).save();
}

// 🖨️ Imprimer
function imprimerDossier() {
  window.print();
}
