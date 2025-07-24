document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('button[data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const notification = document.getElementById('notification');
  const body = document.body;
  const toggleTheme = document.getElementById('theme-toggle');
  const notes = document.getElementById('notes_contenu');
  const saveNotes = document.getElementById('notes_save');
  const symptomResults = document.getElementById('notes_symptom_results');
  const googleSearchBtn = document.getElementById('notes_google_search');
  const analyzeSymptomsBtn = document.getElementById('notes_symptom_analyze');
  const alarmInput = document.getElementById('planning_alarm_time');
  const alarmBtn = document.getElementById('set-planning-alarm');
  const alarmAudio = new Audio('sounds/beep.mp3');

  // Navigation par onglets
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      tabContents.forEach(sec => sec.classList.remove('active', 'hidden'));
      tabButtons.forEach(b => b.classList.remove('active'));

      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
      }
      btn.classList.add('active');
    });
  });

  // Active par défaut le premier onglet
  if (tabButtons.length) {
    const first = tabButtons[0];
    first.classList.add('active');
    document.getElementById(first.dataset.target).classList.add('active');
  }
  // Gestion du thème sombre
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark');
  }

  toggleTheme?.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // Affichage des notifications
  function showNotif(msg, type = 'info') {
    if (!notification) return;
    notification.textContent = msg;
    notification.className = `toast ${type}`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 4000);
  }
  const poidsInput = document.getElementById('cli_poids');
  const tailleInput = document.getElementById('cli_taille');
  const imcOutput = document.getElementById('cli_imc');

  if (poidsInput && tailleInput && imcOutput) {
    const calculIMC = () => {
      const poids = parseFloat(poidsInput.value);
      const taille = parseFloat(tailleInput.value) / 100;

      if (poids > 0 && taille > 0) {
        imcOutput.value = (poids / (taille * taille)).toFixed(2);
      } else {
        imcOutput.value = '';
      }
    };
    poidsInput.addEventListener('input', calculIMC);
    tailleInput.addEventListener('input', calculIMC);
  }
  if (notes && saveNotes) {
    notes.value = localStorage.getItem('notes') || '';
    saveNotes.addEventListener('click', () => {
      localStorage.setItem('notes', notes.value);
      showNotif('📒 Notes sauvegardées', 'success');
    });
  }

  if (analyzeSymptomsBtn && symptomResults && notes) {
    analyzeSymptomsBtn.addEventListener('click', () => {
      const text = notes.value;
      const found = text.match(/\b(fievre|toux|fatigue|douleur)\b/gi) || [];
      symptomResults.innerHTML = found.length
        ? found.map(s => `<p>🔬 Symptôme : <strong>${s}</strong></p>`).join('')
        : '<p>Aucun symptôme détecté</p>';
    });
  }

  if (googleSearchBtn && notes) {
    googleSearchBtn.addEventListener('click', () => {
      const q = notes.value.trim();
      if (!q) return showNotif('⚠️ Zone vide', 'error');
      window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
    });
  }
  if (alarmInput && alarmBtn) {
    alarmBtn.addEventListener('click', () => {
      const time = alarmInput.value;
      if (!time) return showNotif('⚠️ Heure invalide', 'error');

      const [h, m] = time.split(':').map(Number);
      const now = new Date();
      let alarmAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      if (alarmAt < now) alarmAt.setDate(alarmAt.getDate() + 1);

      const delay = alarmAt - now;
      showNotif(`⏱️ Alarme réglée à ${time}`, 'success');

      setTimeout(() => {
        showNotif(`⏰ Alarme de ${time} !`, 'success');
        alarmAudio.play().catch(e => console.warn('Alarme non jouée'));
      }, delay);
    });
  }
  // 📂 Affichage dynamique de la bibliothèque PDF
  document.getElementById('open-pdf-library')?.addEventListener('click', () => {
    document.getElementById('pdf-list').innerHTML = `
      <ul>
        <li><a href="pdfs/anatomie.pdf" target="_blank">📄 Anatomie</a></li>
        <li><a href="pdfs/physiologie.pdf" target="_blank">📄 Physiologie</a></li>
        <li><a href="pdfs/pharmacologie.pdf" target="_blank">📄 Pharmacologie</a></li>
      </ul>
    `;
  });

  // 🤖 Résumé automatique du fichier PDF
  document.getElementById('summarize-pdf')?.addEventListener('click', async () => {
    const input = document.getElementById('pdf-upload');
    if (!input || !input.files || !input.files.length) {
      showNotif('⚠️ Aucun fichier PDF sélectionné', 'error');
      return;
    }

    const file = input.files[0];
    if (!file.type.includes('pdf')) {
      showNotif('⚠️ Le fichier sélectionné n’est pas un PDF', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    showNotif('📡 Envoi du PDF en cours...', 'info');

    // Simule l’appel à une API Laravel
    setTimeout(() => {
      document.getElementById('pdf-summary').innerHTML = `
        <h4>Résumé du cours :</h4>
        <p><strong>Sujet :</strong> Système nerveux humain</p>
        <p>Le système nerveux est divisé en système central et périphérique. Il coordonne les fonctions vitales, les réactions motrices, et le traitement des signaux sensoriels...</p>
      `;
      showNotif('✅ Résumé généré avec succès', 'success');
    }, 3000);
  });

}); // Fin du DOMContentLoaded
let deferredPrompt;
const banner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (banner) banner.classList.remove('hidden');
});

installBtn?.addEventListener('click', () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') {
      console.log("✅ Installation acceptée");
    } else {
      console.log("❌ Installation refusée");
    }
    banner.classList.add('hidden');
    deferredPrompt = null;
  });
});
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🟢 beforeinstallprompt déclenché');
  e.preventDefault();
  deferredPrompt = e;
  banner.classList.remove('hidden');
});
