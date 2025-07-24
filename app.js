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
        alarmAudio.play().catch(e => console.warn('🔇 Son non lu :', e));
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

  // ✨ Animation de clic sur tous les boutons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 600);
    });
  });
});
// ================================
// 📦 Initialisation Firebase
// ================================
document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBalIy0kTC0a_ZjxNMmn1ZUfznO3kZYk6w",
    authDomain: "habibamedics.firebaseapp.com",
    projectId: "habibamedics",
    storageBucket: "habibamedics.appspot.com",
    messagingSenderId: "727036841121",
    appId: "1:727036841121:web:50dc1a0099b1119858f4e0",
    measurementId: "G-LH90ZZ1C8M"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const notes = document.getElementById("notes_contenu");
  const saveNotes = document.getElementById("save-notes");
  const restoreNotes = document.getElementById("restore-notes");
  const notification = document.getElementById("notification");

  firebase.auth().signInAnonymously().then(() => {
    const user = firebase.auth().currentUser;
    const uid = user.uid;

    db.collection("notes").doc(uid).get().then(doc => {
      if (doc.exists) {
        notes.value = doc.data().contenu;
        showNotif("☁️ Notes récupérées depuis le cloud !");
      } else {
        const backup = localStorage.getItem('notes_backup');
        if (backup) {
          notes.value = backup;
          notes.classList.add('local-warning');
          showNotif("🗃️ Récupération depuis la sauvegarde locale", "info");
          setTimeout(() => notes.classList.remove("local-warning"), 3000);
        } else {
          notes.placeholder = "📝 Aucune note enregistrée pour l’instant.";
          showNotif("ℹ️ Aucune note trouvée pour ce compte.", "info");
        }
      }
    });

    saveNotes?.addEventListener('click', () => {
      const originalText = saveNotes.innerHTML;
      saveNotes.disabled = true;
      saveNotes.innerHTML = "⏳ Sauvegarde...";

      db.collection("notes").doc(uid).set({ contenu: notes.value })
        .then(() => {
          showNotif("✅ Notes sauvegardées dans le cloud !");
          saveNotes.innerHTML = "✅ Sauvegardé !";
          saveNotes.classList.add("animate-pulse");
          setTimeout(() => {
            saveNotes.classList.remove("animate-pulse");
            saveNotes.innerHTML = originalText;
            saveNotes.disabled = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("❌ Erreur de sauvegarde :", err);
          showNotif("❌ Échec de la sauvegarde", "error");
          saveNotes.innerHTML = originalText;
          saveNotes.disabled = false;
        });

      localStorage.setItem('notes_backup', notes.value);
    });

    restoreNotes?.addEventListener('click', () => {
      const backup = localStorage.getItem('notes_backup');
      if (backup) {
        notes.value = backup;
        notes.classList.add("local-warning");
        showNotif("📦 Notes restaurées depuis la sauvegarde locale", "info");
        setTimeout(() => notes.classList.remove("local-warning"), 3000);
      } else {
        showNotif("⚠️ Aucune sauvegarde locale trouvée", "error");
      }
    });

  }).catch(error => {
    console.error("❌ Auth anonyme Firebase échouée :", error);
    showNotif("❌ Échec connexion Firebase", "error");
  });
});

// 📲 Support PWA - Installation
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
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') {
      showNotif('📲 Application installée avec succès !', 'success');
    }
    deferredPrompt = null;
  });
});

installBtn?.addEventListener('click', () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') {
      showNotif('📦 Application ajoutée à votre écran d’accueil !', 'success');
    }
    installBanner?.classList.add('hidden');
    deferredPrompt = null;
  });
});
