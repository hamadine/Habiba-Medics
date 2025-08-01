// ✅ DOM READY
document.addEventListener('DOMContentLoaded', () => {
  console.log("🧪 [DEBUG] Initialisation Habiba Medics (local only)");

  const debugElements = [
    'notes_contenu', 'save-notes', 'restore-notes',
    'notes_google_search', 'notes_symptom_analyze',
    'planning_alarm_time', 'set-planning-alarm',
    'theme-toggle', 'study-pdf', 'study-pdf-name',
    'studies-table-body', 'add-study-row',
    'install-trigger', 'install-banner', 'install-btn'
  ];

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

  const showNotif = (msg, type = 'info') => {
    if (!notification) return;
    notification.textContent = msg;
    notification.className = `toast ${type}`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 4000);
  };

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
  const imcInterpretation = document.getElementById('cli_imc_interpretation');

  if (poidsInput && tailleInput && imcOutput && imcInterpretation) {
    const calculIMC = () => {
      const poids = parseFloat(poidsInput.value);
      const taille = parseFloat(tailleInput.value) / 100;
      if (poids > 0 && taille > 0) {
        const imc = poids / (taille * taille);
        imcOutput.value = imc.toFixed(2);
        let interpretation = '';
        if (imc < 18.5) interpretation = "Insuffisance pondérale (maigreur)";
        else if (imc < 25) interpretation = "Corpulence normale";
        else if (imc < 30) interpretation = "Surpoids";
        else if (imc < 35) interpretation = "Obésité modérée";
        else if (imc < 40) interpretation = "Obésité sévère";
        else interpretation = "Obésité morbide";
        imcInterpretation.textContent = `💡 ${interpretation}`;
      } else {
        imcOutput.value = '';
        imcInterpretation.textContent = '';
      }
    };
    poidsInput.addEventListener('input', calculIMC);
    tailleInput.addEventListener('input', calculIMC);
  }

  // Notes : Sauvegarde locale uniquement
  saveNotes?.addEventListener('click', () => {
    if (!notes) return;
    localStorage.setItem('notes_backup', notes.value);
    showNotif("💾 Notes enregistrées localement !");
  });

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

  // Analyse Symptômes
  analyzeSymptomsBtn?.addEventListener('click', () => {
    const text = notes.value;
    const found = text.match(/\b(fievre|toux|fatigue|douleur)\b/gi) || [];
    symptomResults.innerHTML = found.length
      ? found.map(s => `<p>🔬 Symptôme : <strong>${s}</strong></p>`).join('')
      : '<p>Aucun symptôme détecté</p>';
  });

  // Recherche Google
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

  // Habiba Studies
  const pdfInput = document.getElementById('study-pdf');
  const pdfNameDisplay = document.getElementById('study-pdf-name');
  const tableBody = document.getElementById('studies-table-body');
  const resumeBtn = document.getElementById('open-resumer');
resumeBtn?.addEventListener('click', () => {
  const file = pdfInput?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      localStorage.setItem('resume_pdf_base64', e.target.result);
    };
    reader.readAsDataURL(file); // base64 encode
  } else {
    showNotif("⚠️ Aucun fichier PDF sélectionné", "error");
  }
});
  const addRowBtn = document.getElementById('add-study-row');

  pdfInput?.addEventListener('change', () => {
    const file = pdfInput.files[0];
    pdfNameDisplay.textContent = file ? `✅ Fichier sélectionné : ${file.name}` : '';
  });

  addRowBtn?.addEventListener('click', () => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" placeholder="Ex : Anatomie" class="input-field" /></td>
      <td><input type="text" placeholder="Description du cours" class="input-field" /></td>
      <td>
        <select class="input-field">
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="autre">Autre</option>
        </select>
      </td>
      <td><button class="btn-red remove-study">❌</button></td>
    `;
    tableBody.appendChild(row);
  });

  tableBody?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-study')) {
      e.target.closest('tr').remove();
    }
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
