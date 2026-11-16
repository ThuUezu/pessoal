// Aplica o tema ANTES de pintar a tela (evita o "flash" claro no modo escuro).
// Fica num arquivo externo porque a política de segurança (CSP) não permite script inline.
(function () {
  try {
    var pref = localStorage.getItem('analy-theme') || 'auto';
    var dark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
