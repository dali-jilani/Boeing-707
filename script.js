/* ============================================================
   C-ADER — Boeing 707 — script.js
   Musee de l'Air et de l'Espace
   ============================================================ */

(() => {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR — transparent ↔ solid on scroll
     ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('hero');

  function updateNavbar() {
    if (!navbar || !heroSection) return;
    const threshold = heroSection.offsetHeight - 80;
    navbar.classList.toggle('scrolled', window.scrollY > threshold);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ----------------------------------------------------------
     2. SCROLL REVEAL — IntersectionObserver
     ---------------------------------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }

  /* ----------------------------------------------------------
     3. POPOVER + MODAL
     ---------------------------------------------------------- */
  const pop = document.getElementById('hoverPopover');
  const popImg = document.getElementById('popImg');
  const popCaption = document.getElementById('popCaption');

  const imgModal = document.getElementById('imgModal');
  const imgViewer = document.getElementById('imgViewer');
  const imgTitle = document.getElementById('imgTitle');
  const imgCaption = document.getElementById('imgCaption');

  document.getElementById('closeImgModal').addEventListener('click', () => imgModal.close());

  function movePopover(e) {
    const w = pop.offsetWidth || 340;
    const h = pop.offsetHeight || 260;
    let x = e.clientX + 16;
    let y = e.clientY + 16;
    if (x + w > window.innerWidth) x = e.clientX - w - 16;
    if (y + h > window.innerHeight) y = e.clientY - h - 16;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }

  function showPopover(el, e) {
    popImg.src = el.dataset.src;
    popCaption.textContent = el.dataset.caption || '';
    pop.style.display = 'block';
    movePopover(e);
  }

  function hidePopover() {
    pop.style.display = 'none';
    popImg.src = '';
  }

  function openModal(el) {
    imgViewer.src = el.dataset.src;
    imgTitle.textContent = el.dataset.title || 'Archive';
    imgCaption.textContent = el.dataset.caption || '';
    imgModal.showModal();
  }

  // Hotspots
  document.querySelectorAll('.hotspot').forEach(h => {
    h.addEventListener('mouseenter', e => showPopover(h, e));
    h.addEventListener('mousemove', e => movePopover(e));
    h.addEventListener('mouseleave', hidePopover);
    h.addEventListener('click', () => openModal(h));
  });

  // Archive links and image containers
  document.querySelectorAll('.open-archive').forEach(link => {
    if (link.tagName === 'A') {
      link.addEventListener('mouseenter', e => showPopover(link, e));
      link.addEventListener('mousemove', e => movePopover(e));
      link.addEventListener('mouseleave', hidePopover);
    }
    link.addEventListener('click', e => {
      e.preventDefault();
      openModal(link);
    });
    // Keyboard accessibility
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(link);
      }
    });
  });

  window.addEventListener('scroll', hidePopover, { passive: true });

  /* ----------------------------------------------------------
     4. COUNTER ANIMATION — spec cards
     ---------------------------------------------------------- */
  function animateCounter(el, target, duration) {
    const isFloat = String(target).includes('.');
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;
      el.textContent = isFloat ? current.toFixed(2) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.dataset.count);
        animateCounter(entry.target, target, 1600);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ----------------------------------------------------------
     5. WEATHER API — Open-Meteo
     ---------------------------------------------------------- */
  const WMO_LABELS = {
    0: ['Ciel degage', '☀️'], 1: ['Peu nuageux', '🌤️'],
    2: ['Partiellement nuageux', '⛅'], 3: ['Couvert', '☁️'],
    45: ['Brouillard', '🌫️'], 48: ['Brouillard givrant', '🌫️'],
    51: ['Bruine legere', '🌦️'], 53: ['Bruine', '🌦️'], 55: ['Bruine dense', '🌧️'],
    61: ['Pluie legere', '🌦️'], 63: ['Pluie', '🌧️'], 65: ['Pluie forte', '🌧️'],
    71: ['Neige legere', '🌨️'], 73: ['Neige', '❄️'], 75: ['Neige forte', '❄️'],
    80: ['Averses', '🌦️'], 81: ['Averses moderes', '🌧️'], 82: ['Averses violentes', '⛈️'],
    95: ['Orage', '⛈️'], 96: ['Orage / grele', '⛈️'], 99: ['Orage / forte grele', '⛈️']
  };

  async function loadWeather() {
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=48.953&longitude=2.430&current=temperature_2m,relative_humidity_2m,dew_point_2m,weather_code,wind_speed_10m';
      const res = await fetch(url);
      const data = await res.json();
      const c = data.current;

      const wmo = WMO_LABELS[c.weather_code] || ['--', '🌡️'];
      document.getElementById('weatherIcon').textContent = wmo[1];
      document.getElementById('weatherDesc').textContent = wmo[0];
      document.getElementById('weatherTemp').textContent = c.temperature_2m + ' °C';
      document.getElementById('weatherHum').textContent = c.relative_humidity_2m + ' %';
      document.getElementById('weatherDew').textContent = c.dew_point_2m + ' °C';
      document.getElementById('weatherWind').textContent = c.wind_speed_10m + ' km/h';

      // Humidity gauge
      const humGauge = document.getElementById('humGauge');
      humGauge.style.width = c.relative_humidity_2m + '%';
      if (c.relative_humidity_2m < 60) humGauge.style.background = '#4caf50';
      else if (c.relative_humidity_2m < 80) humGauge.style.background = '#ff9800';
      else humGauge.style.background = '#f44336';
    } catch {
      document.getElementById('weatherDesc').textContent = 'Donnees indisponibles';
    }
  }

  /* ----------------------------------------------------------
     6. AIR QUALITY API — Open-Meteo
     ---------------------------------------------------------- */
  function aqiColor(val) {
    if (val <= 20) return { bg: '#4caf50', label: 'Bon' };
    if (val <= 40) return { bg: '#8bc34a', label: 'Correct' };
    if (val <= 60) return { bg: '#ff9800', label: 'Moyen' };
    if (val <= 80) return { bg: '#ff5722', label: 'Mediocre' };
    if (val <= 100) return { bg: '#f44336', label: 'Mauvais' };
    return { bg: '#9c27b0', label: 'Tres mauvais' };
  }

  function setGauge(id, value, max) {
    const el = document.getElementById(id);
    if (!el) return;
    const pct = Math.min(100, (value / max) * 100);
    el.style.width = pct + '%';
    el.style.background = aqiColor(pct).bg;
  }

  async function loadAirQuality() {
    try {
      const url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=48.953&longitude=2.430&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone';
      const res = await fetch(url);
      const data = await res.json();
      const c = data.current;

      const aqi = c.european_aqi;
      const info = aqiColor(aqi);
      const badge = document.getElementById('aqiBadge');
      badge.textContent = info.label;
      badge.style.background = info.bg;
      badge.style.color = '#fff';

      document.getElementById('aqiValue').textContent = aqi;
      setGauge('aqiGauge', aqi, 100);

      document.getElementById('aqiPM10').textContent = c.pm10 + ' µg/m³';
      setGauge('pm10Gauge', c.pm10, 80);

      document.getElementById('aqiPM25').textContent = c.pm2_5 + ' µg/m³';
      setGauge('pm25Gauge', c.pm2_5, 50);

      document.getElementById('aqiNO2').textContent = c.nitrogen_dioxide + ' µg/m³';
      setGauge('no2Gauge', c.nitrogen_dioxide, 200);

      document.getElementById('aqiO3').textContent = c.ozone + ' µg/m³';
      setGauge('o3Gauge', c.ozone, 180);
    } catch {
      document.getElementById('aqiBadge').textContent = 'Donnees indisponibles';
    }
  }

  /* ----------------------------------------------------------
     7. WIKIPEDIA API — French extract
     ---------------------------------------------------------- */
  async function loadWikipedia() {
    try {
      const url = 'https://fr.wikipedia.org/api/rest_v1/page/summary/Boeing_707';
      const res = await fetch(url);
      const data = await res.json();

      document.getElementById('wikiTitle').textContent = data.title || 'Boeing 707';
      document.getElementById('wikiExtract').textContent = data.extract || 'Donnees indisponibles.';

      if (data.thumbnail && data.thumbnail.source) {
        document.getElementById('wikiImg').src = data.thumbnail.source;
        document.getElementById('wikiImg').alt = data.title;
      }
      if (data.content_urls && data.content_urls.desktop) {
        document.getElementById('wikiLink').href = data.content_urls.desktop.page;
      }
    } catch {
      document.getElementById('wikiExtract').textContent = 'Donnees indisponibles.';
    }
  }

  /* ----------------------------------------------------------
     8. INIT
     ---------------------------------------------------------- */
  loadWeather();
  loadAirQuality();
  loadWikipedia();

})();