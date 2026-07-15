/* ============================================================
   Thésaurus CADER — Scripts
   ============================================================ */

/* ---- Liens externes (.ext-uri) via jQuery ---- */
$(document).ready(function () {
  $('.ext-uri').mouseover(function () { $(this).addClass('ext-link'); });
  $('.ext-uri').mouseout(function ()  { $(this).removeClass('ext-link'); });
  $('.ext-uri').click(function () {
    window.open($(this).attr('title'));
  });
});

/* ---- Bloquer le clic sur les éléments barrés (.alt) ---- */
document.addEventListener('click', function (e) {
  var extUri = e.target.closest('.ext-uri');
  if (extUri && extUri.querySelector('.alt')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

/* ---- Navbar : scroll vers section + bloquer autres liens ---- */
document.addEventListener('click', function (e) {
  var link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (link.closest('.navbar')) {
    var hash = decodeURIComponent((link.getAttribute('href') || '').split('#')[1] || '');
    if (hash) {
      var target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}, true);

/* ---- Highlight bouton navbar actif selon section visible ---- */
(function () {
  var SECTIONS = [
    'Thésaurus CADER : A-Z',
    'Thésaurus CADER',
    'Anglais (en)'
  ];
  var navItems = document.querySelectorAll('.navbar-fixed-bottom .nav.navbar-nav li');

  function setActive(index) {
    navItems.forEach(function (li, i) {
      li.classList.toggle('nav-active', i === index);
    });
  }

  setActive(0);

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var idx = SECTIONS.indexOf(entry.target.id);
        if (idx !== -1) setActive(idx);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -55% 0px' });

  SECTIONS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  navItems.forEach(function (li, i) {
    li.addEventListener('click', function () { setActive(i); });
  });
})();
