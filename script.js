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
     8. MODEL 3D — Couleurs par partie (patch GLB vertex colors)
     ---------------------------------------------------------- */
  /*
   * Technique : injection de l'attribut COLOR_0 (couleurs par sommet)
   * directement dans le binaire GLB.
   *
   * Livrée Air France Boeing 707 — années 1960-70 :
   *
   *   Fuselage haut  (ry > 0.38)          bleu AF     #1A4799 / [0.10, 0.28, 0.60]
   *   Fuselage bas   (default)             alu poli    #BFC3CC / [0.75, 0.76, 0.80]
   *   Derive (rx < 0.07, ry > 0.62)       bleu marine #0F2A55 / [0.06, 0.17, 0.33]
   *   Ailes  (rx > 0.09, ry < 0.42)       alu renf.   #B2B6C2 / [0.70, 0.71, 0.76]
   *   Moteurs (rx 0.13-0.90, ry < 0.27)   graphite    #383838 / [0.22, 0.22, 0.22]
   *   Train   (ry < 0.06)                 acier       #484848 / [0.28, 0.28, 0.29]
   *
   * Le GLB est reprocesse en memoire, sans serveur ni fichier externe.
   */

  async function patchGLBColors(dataUrl) {
    // Decode base64 data URL → ArrayBuffer
    const buffer = await fetch(dataUrl).then(r => r.arrayBuffer());
    const view   = new DataView(buffer);

    // GLB header: magic(4) version(4) length(4)
    // JSON chunk: length(4) type(4) data[...]
    // BIN  chunk: length(4) type(4) data[...]
    const jsonChunkLen   = view.getUint32(12, true);
    const binChunkOffset = 20 + jsonChunkLen;
    const binDataLen     = view.getUint32(binChunkOffset, true);
    const binDataStart   = binChunkOffset + 8;

    const json = JSON.parse(
      new TextDecoder().decode(new Uint8Array(buffer, 20, jsonChunkLen))
    );

    // Find POSITION accessor → get vertex positions
    const posIdx = json.meshes[0].primitives[0].attributes.POSITION;
    const posAcc = json.accessors[posIdx];
    const posBv  = json.bufferViews[posAcc.bufferView];
    const nVerts = posAcc.count;
    const pos    = new Float32Array(
      buffer, binDataStart + (posBv.byteOffset || 0), nVerts * 3
    );

    // Spatial boundaries from accessor metadata (VEC3 min/max)
    const minX = posAcc.min[0], maxX = posAcc.max[0];
    const minY = posAcc.min[1], maxY = posAcc.max[1];
    const cxModel = (minX + maxX) * 0.5;   // wingspan center
    const hw      = (maxX - minX) * 0.5;   // half-wingspan
    const hModel  = maxY - minY;            // total height

    // Assign one RGB color per vertex — livrée Air France Boeing 707
    const colorArr = new Float32Array(nVerts * 3);

    for (let i = 0; i < nVerts; i++) {
      const x  = pos[i * 3];
      const y  = pos[i * 3 + 1];
      const rx = Math.abs(x - cxModel) / hw; // 0 = fuselage center, 1 = wingtip
      const ry = (y - minY) / hModel;         // 0 = bottom (gear), 1 = top

      let r, g, b;

      if (ry < 0.06) {
        // Train d'atterrissage — acier industriel sombre
        r = 0.28; g = 0.28; b = 0.29;

      } else if (rx > 0.13 && rx < 0.90 && ry < 0.27) {
        // Nacelles moteurs JT3D — graphite/anthracite
        r = 0.22; g = 0.22; b = 0.22;

      } else if (rx > 0.09 && ry < 0.42) {
        // Ailes — aluminium renforce, poli (ventre gris argent)
        r = 0.70; g = 0.71; b = 0.76;

      } else if (rx < 0.07 && ry > 0.62) {
        // Derive verticale — bleu marine profond Air France
        r = 0.06; g = 0.17; b = 0.33;

      } else if (ry > 0.38) {
        // Fuselage superieur — bleu Air France (#1A4799)
        r = 0.10; g = 0.28; b = 0.60;

      } else {
        // Fuselage inferieur / ventre — aluminium poli
        r = 0.75; g = 0.76; b = 0.80;
      }

      colorArr[i * 3]     = r;
      colorArr[i * 3 + 1] = g;
      colorArr[i * 3 + 2] = b;
    }

    // Append color bytes after existing binary data
    const colorBytes   = new Uint8Array(colorArr.buffer);
    const oldBin       = new Uint8Array(buffer, binDataStart, binDataLen);
    const newBinRaw    = binDataLen + colorBytes.length;
    const newBinPad    = Math.ceil(newBinRaw / 4) * 4;
    const newBin       = new Uint8Array(newBinPad); // zero-padded
    newBin.set(oldBin, 0);
    newBin.set(colorBytes, binDataLen);

    // Register new bufferView + accessor for COLOR_0
    json.bufferViews.push({ buffer: 0, byteOffset: binDataLen, byteLength: colorBytes.length });
    json.accessors.push({
      bufferView: json.bufferViews.length - 1,
      componentType: 5126,   // FLOAT
      count: nVerts,
      type: 'VEC3',
      normalized: false
    });
    json.meshes[0].primitives[0].attributes.COLOR_0 = json.accessors.length - 1;

    // Update PBR material
    // baseColorFactor = [1,1,1,1] → vertex colors render without tint
    const mat = json.materials[0].pbrMetallicRoughness;
    mat.baseColorFactor  = [1.0, 1.0, 1.0, 1.0];  // vertex colors render pure
    mat.metallicFactor   = 0.45;   // peinture laquee + zones metal (balance)
    mat.roughnessFactor  = 0.38;   // semi-lisse : peinture avion + alu poli
    json.materials[0].emissiveFactor = [0.05, 0.05, 0.06]; // ambient fill → no black faces

    // Update buffer declared size
    json.buffers[0].byteLength = newBinPad;

    // Re-encode JSON chunk (must be padded to 4-byte boundary with 0x20 spaces)
    const jsonEnc    = new TextEncoder().encode(JSON.stringify(json));
    const jsonPad    = Math.ceil(jsonEnc.length / 4) * 4;
    const jsonBytes  = new Uint8Array(jsonPad).fill(0x20);
    jsonBytes.set(jsonEnc);

    // Assemble final GLB binary
    const totalLen = 12 + 8 + jsonPad + 8 + newBinPad;
    const glb      = new Uint8Array(totalLen);
    const dv       = new DataView(glb.buffer);

    dv.setUint32(0, 0x46546C67, true); // magic "glTF"
    dv.setUint32(4, 2,          true); // version 2
    dv.setUint32(8, totalLen,   true);

    dv.setUint32(12, jsonPad,    true);
    dv.setUint32(16, 0x4E4F534A, true); // chunk type "JSON"
    glb.set(jsonBytes, 20);

    const bs = 20 + jsonPad;
    dv.setUint32(bs,     newBinPad,    true);
    dv.setUint32(bs + 4, 0x004E4942,  true); // chunk type "BIN\0"
    glb.set(newBin, bs + 8);

    // Convert to base64 in chunks to avoid stack overflow on large arrays
    let b64str = '';
    const CHUNK = 8192;
    for (let i = 0; i < glb.length; i += CHUNK) {
      b64str += String.fromCharCode(...glb.subarray(i, Math.min(i + CHUNK, glb.length)));
    }
    return 'data:model/gltf-binary;base64,' + btoa(b64str);
  }

  const mv = document.querySelector('#hero model-viewer');
  if (mv) {
    const originalSrc = mv.getAttribute('src');
    let colorPatched  = false;

    // Apply vertex-color patch (async — processes GLB binary in memory)
    if (originalSrc && originalSrc.startsWith('data:model/gltf-binary;base64,')) {
      patchGLBColors(originalSrc)
        .then(newSrc => {
          colorPatched = true;
          mv.setAttribute('src', newSrc); // triggers model reload with vertex colors
        })
        .catch(e => console.warn('[Boeing707] Vertex color patch failed:', e));
    }

    // Fallback via material API (runs on first load while patch is processing,
    // and is skipped on the second load once the patch has applied vertex colors)
    mv.addEventListener('load', () => {
      if (colorPatched) return;
      const model = mv.model;
      if (!model?.materials?.length) return;
      model.materials.forEach(mat => {
        mat.pbrMetallicRoughness.setBaseColorFactor([0.10, 0.28, 0.60, 1.0]); // bleu Air France
        mat.pbrMetallicRoughness.setMetallicFactor(0.45);
        mat.pbrMetallicRoughness.setRoughnessFactor(0.38);
        mat.setEmissiveFactor([0.05, 0.05, 0.06]);
      });
    });
  }

  /* ----------------------------------------------------------
     9. INIT
     ---------------------------------------------------------- */
  loadWeather();
  loadWikipedia();

})();