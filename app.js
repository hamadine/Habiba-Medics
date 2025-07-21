document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('button[data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const toggleTheme = document.getElementById('theme-toggle');
  const notification = document.getElementById('notification');
  const body = document.body;
  const alarmAudio = new Audio('sounds/beep.mp3');

  function playAlarm() {
    alarmAudio.currentTime = 0;
    alarmAudio.play().catch(err => console.warn('Alarm error:', err));
  }

  function activateTab(id) {
    tabContents.forEach(c => c.classList.add('hidden'));
    tabButtons.forEach(b => b.classList.remove('active-tab'));
    const content = document.getElementById(id);
    const btn = [...tabButtons].find(b => b.dataset.target === id);
    if (content) content.classList.remove('hidden');
    if (btn) {
      btn.classList.add('active-tab');
      const icon = btn.querySelector('.tab-icon');
      if (icon) {
        icon.classList.add('animate-wiggle');
        setTimeout(() => icon.classList.remove('animate-wiggle'), 1000);
      }
    }
  }

  tabButtons.forEach(btn => btn.addEventListener('click', () => {
    activateTab(btn.dataset.target);
    navMenu?.classList.add('hidden');
  }));
  if (tabButtons.length) activateTab(tabButtons[0].dataset.target);

  navToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('hidden');
    navToggle.querySelector('svg')?.classList.toggle('rotate-180');
  });

  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu?.classList.add('hidden');
      navToggle.querySelector('svg')?.classList.remove('rotate-180');
    }
  });

  if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');
  toggleTheme?.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  function showNotif(msg, type = 'success') {
    notification.textContent = msg;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3500);
  }

  ['gen', 'cli'].forEach(prefix => {
    const form = document.getElementById(`form-${prefix}`);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = {};
      form.querySelectorAll('input,textarea').forEach(el => data[el.id] = el.value);
      localStorage.setItem(`formData_${prefix}`, JSON.stringify(data));
      showNotif('✅ Données sauvegardées');
    });
    const saved = localStorage.getItem(`formData_${prefix}`);
    if (saved) Object.entries(JSON.parse(saved)).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  });

  const notes = document.getElementById('notes-area');
  const saveNotes = document.getElementById('save-notes');
  if (notes && saveNotes) {
    notes.value = localStorage.getItem('notes') || '';
    saveNotes.addEventListener('click', () => {
      localStorage.setItem('notes', notes.value);
      showNotif('📒 Notes sauvegardées');
    });
  }

  setTimeout(() => {
    showNotif('⏰ Pensez à vérifier l’inventaire !', 'info');
    playAlarm();
  }, 60000);

  const alarmInput = document.getElementById('alarm-time');
  const alarmBtn = document.getElementById('set-alarm');
  if (alarmInput && alarmBtn) {
    alarmBtn.addEventListener('click', () => {
      const time = alarmInput.value;
      if (!time) return showNotif('⚠️ Entrez une heure valide', 'error');
      const [h, m] = time.split(':').map(Number);
      const now = new Date();
      let alarmAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      if (alarmAt < now) alarmAt.setDate(alarmAt.getDate() + 1);
      setTimeout(() => {
        showNotif(`⏰ Alarme de ${time} !`, 'success');
        playAlarm();
      }, alarmAt - now);
      showNotif(`⏱️ Alarme réglée à ${time}`, 'success');
    });
  }

  const cdDisplay = document.getElementById('countdown');
  const cdStart = document.getElementById('start-timer');
  const cdReset = document.getElementById('reset-timer');
  const canvas = document.getElementById('timerChart');
  let chart, cdInterval, totalSec;

  if (canvas && cdDisplay && cdStart && cdReset) {
    chart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [0, 100],
          backgroundColor: ['#34d399', '#e5e7eb']
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    cdStart.addEventListener('click', () => {
      const sec = parseInt(prompt('Durée en secondes ?'), 10);
      if (!sec || sec <= 0) return showNotif('⚠️ Valeur invalide', 'error');
      totalSec = sec;
      let rem = sec;
      clearInterval(cdInterval);
      updateChart(rem);
      cdInterval = setInterval(() => {
        rem--;
        updateChart(rem);
        cdDisplay.textContent = rem > 0 ? `Temps restant : ${rem}s` : 'Terminé';
        if (rem <= 0) {
          clearInterval(cdInterval);
          playAlarm();
          showNotif('✔️ Timer terminé', 'success');
        }
      }, 1000);
    });

    cdReset.addEventListener('click', () => {
      clearInterval(cdInterval);
      cdDisplay.textContent = 'Réinitialisé';
      chart.data.datasets[0].data = [0, 100];
      chart.update();
      showNotif('🔄 Timer réinitialisé');
    });

    function updateChart(remaining) {
      const elapsed = totalSec - remaining;
      chart.data.datasets[0].data = [elapsed, remaining];
      chart.update();
    }
  }

  const exportChart = document.getElementById('export-chart');
  if (exportChart && canvas) {
    exportChart.addEventListener('click', () => {
      html2pdf().set({
        margin: 10,
        filename: 'graph_timer.pdf',
        html2canvas: { scale: 2 }
      }).from(canvas).save();
    });
  }

  const searchBtn = document.getElementById('search-symptoms');
  const resultArea = document.getElementById('symptom-results');
  if (searchBtn && resultArea && notes) {
    searchBtn.addEventListener('click', () => {
      const text = notes.value;
      const found = text.match(/\b(fievre|toux|fatigue|douleur)\b/gi) || [];
      resultArea.innerHTML = found.length
        ? found.map(s => `<p>🔬 Symptôme : <strong>${s}</strong></p>`).join('')
        : '<p>Aucun symptôme détecté</p>';
    });
  }

  const googleSearchBtn = document.getElementById('google-search-notes');
  if (googleSearchBtn && notes) {
    googleSearchBtn.addEventListener('click', () => {
      const text = notes.value.trim();
      if (!text) {
        showNotif('⚠️ La zone de notes est vide.', 'error');
        return;
      }
      const query = encodeURIComponent(text);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    });
  }
});

// Export PDF général
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

// Impression
function imprimerDossier() {
  window.print();
    }
