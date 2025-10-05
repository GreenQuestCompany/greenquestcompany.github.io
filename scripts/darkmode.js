const darkmode_btn = document.getElementById("darkmode-toggle");
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

darkmode_btn.addEventListener("click", () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(
        'darkMode',
        document.body.classList.contains('dark-mode') ? 'dark' : 'light'
    );
});

function loadDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'dark' || (saved === null && prefersDark)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

loadDarkMode();