// ✅ Import des modules Firebase
import { signInAnon } from './js/firebase-auth.js';
import { getUserNotes, saveUserNotes } from './js/firebase-notes.js';

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', async () => {
  const tabButtons = document.querySelectorAll('button[data-target]');
  const tabContents = document.querySelectorAll('.tab-content');
  const notification = document.getElementById('notification');
  const body = document.body;
  const toggleTheme = document.getElementById('theme-toggle');
  const notes = document.getElementById('notes_contenu');
  const saveNotes = document.getElementById('save-notes');
  const restoreNotes = document.getElementById('restore-notes');
  const symptomResults = document.getElementById('notes_symptom_results');
  const googleSearchBtn = document.getElementById('notes_google_search');
  const analyzeSymptomsBtn = document.getElementById('notes_symptom_analyze');
  const alarmInput = document.getElementById('planning_alarm_time');
  const alarmBtn = document.getElementById('set-planning-alarm');
  const alarmAudio = new Audio('sounds/beep.mp3');

  function showNotif(msg, type = 'info') {
    if (!notification) return;
    notification.textContent = msg;
    notification.className = `toast ${type}`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 4000);
  }

  // Onglets
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
  if (tabButtons.length) {
    const first = tabButtons[0];
    first.classList.add('active');
    document.getElementById(first.dataset.target).classList.add('active');
  }

  // Thème
  if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');
  toggleTheme?.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  // IMC
  const poidsInput = document.getElementById('cli_poids');
  const tailleInput = document.getElementById('cli_taille');
  const imcOutput = document.getElementById('cli_imc');
  if (poidsInput && tailleInput && imcOutput) {
    const calculIMC = () => {
      const poids = parseFloat(poidsInput.value);
      const taille = parseFloat(tailleInput.value) / 100;
      imcOutput.value = poids > 0 && taille > 0 ? (poids / (taille * taille)).toFixed(2) : '';
    };
    poidsInput.addEventListener('input', calculIMC);
    tailleInput.addEventListener('input', calculIMC);
  }

  // 🔐 Firebase Auth
  let uid;
  try {
    uid = await signInAnon();
    const savedNotes = await getUserNotes(uid);
    notes.value = savedNotes || localStorage.getItem('notes_backup') || '';
    if (savedNotes) showNotif("☁️ Notes récupérées du cloud");
    else if (notes.value) showNotif("🗃️ Récupérées en local");
  } catch {
    showNotif("❌ Connexion Firebase échouée", "error");
  }

  // Sauvegarde notes
  saveNotes?.addEventListener('click', async () => {
    if (!uid || !notes) return;
    saveNotes.disabled = true;
    const content = notes.value;
    localStorage.setItem('notes_backup', content);
    try {
      await saveUserNotes(uid, content);
      showNotif("✅ Sauvegardées dans le cloud !");
    } catch {
      showNotif("❌ Erreur de sauvegarde", "error");
    }
    saveNotes.disabled = false;
  });

  // Restaurer
  restoreNotes?.addEventListener('click', () => {
    const backup = localStorage.getItem('notes_backup');
    if (backup) {
      notes.value = backup;
      notes.classList.add("local-warning");
      showNotif("📦 Notes restaurées");
      setTimeout(() => notes.classList.remove("local-warning"), 3000);
    } else {
      showNotif("⚠️ Aucune sauvegarde trouvée", "error");
    }
  });

  // Symptômes
  analyzeSymptomsBtn?.addEventListener('click', () => {
    const text = notes.value;
    const found = text.match(/\b(fievre|toux|fatigue|douleur)\b/gi) || [];
    symptomResults.innerHTML = found.length
      ? found.map(s => `<p>🔬 Symptôme : <strong>${s}</strong></p>`).join('')
      : '<p>Aucun symptôme détecté</p>';
  });

  // Google
  googleSearchBtn?.addEventListener('click', () => {
    const q = notes.value.trim();
    if (!q) return showNotif('⚠️ Zone vide', 'error');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  });

  // Alarme
  alarmBtn?.addEventListener('click', () => {
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
      alarmAudio.play().catch(e => console.warn('🔇 Son non lu :', e));
    }, delay);
  });

  // PDF liste
  document.getElementById('open-pdf-library')?.addEventListener('click', () => {
    document.getElementById('pdf-list').innerHTML = `
      <ul>
        <li><a href="pdfs/anatomie.pdf" target="_blank">📄 Anatomie</a></li>
        <li><a href="pdfs/physiologie.pdf" target="_blank">📄 Physiologie</a></li>
        <li><a href="pdfs/pharmacologie.pdf" target="_blank">📄 Pharmacologie</a></li>
      </ul>`;
  });

  // PDF résumé (simulé)
  document.getElementById('summarize-pdf')?.addEventListener('click', () => {
    const input = document.getElementById('pdf-upload');
    if (!input || !input.files.length) return showNotif('⚠️ Aucun PDF', 'error');
    const file = input.files[0];
    if (!file.type.includes('pdf')) return showNotif('⚠️ Pas un PDF', 'error');
    showNotif('📡 Envoi en cours...', 'info');
    setTimeout(() => {
      document.getElementById('pdf-summary').innerHTML = `
        <h4>Résumé du cours :</h4>
        <p><strong>Sujet :</strong> Système nerveux humain</p>
        <p>Le système nerveux central régule les fonctions vitales...</p>`;
      showNotif('✅ Résumé prêt !', 'success');
    }, 3000);
  });

  // Animation boutons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 600);
    });
  });

  // 📲 PWA install
  let deferredPrompt;
  const installTrigger = document.getElementById('install-trigger');
  const installBanner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installTrigger?.classList.remove('hidden');
    installBanner?.classList.remove('hidden');
  });
  installTrigger?.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') showNotif('📲 Installé !', 'success');
      deferredPrompt = null;
    });
  });
  installBtn?.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(result => {
      if (result.outcome === 'accepted') showNotif('📦 Ajoutée à l’écran !', 'success');
      installBanner?.classList.add('hidden');
      deferredPrompt = null;
    });
  });
});
