document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(tabName) {
    tabContents.forEach(content => {
      content.classList.add('hidden');
      content.classList.remove('block');
    });

    tabButtons.forEach(btn => {
      btn.classList.remove('active-tab');
    });

    const activeContent = document.getElementById(tabName);
    if (activeContent) {
      activeContent.classList.remove('hidden');
      activeContent.classList.add('block');
    }

    const activeBtn = Array.from(tabButtons).find(btn =>
      btn.textContent.trim().toLowerCase() === tabName.toLowerCase()
    );

    if (activeBtn) {
      activeBtn.classList.add('active-tab');
    }
  }

  // Bind events
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.textContent.trim().toLowerCase();
      activateTab(tabName);
    });
  });

  // Initial activation
  if (tabButtons.length) {
    const defaultTab = tabButtons[0].textContent.trim().toLowerCase();
    activateTab(defaultTab);
  }
});
