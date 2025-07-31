window.addEventListener('load', function () {
  const loadingScreen = document.getElementById('loading');
  if (!loadingScreen) return;

  setTimeout(() => {
    loadingScreen.style.opacity = '0';

    loadingScreen.addEventListener('transitionend', function handleTransitionEnd() {
      loadingScreen.remove();
    }, { once: true });
  }, 500);
});

// Variables globales
let magnifyingGlass = null;
let islandCartoonLayer = null;
let borderCartoonLayer = null;
let revealLocked = false;
let animPhase = 'initial';
let lastMouseLatLng = null;
let lastCursor = null;
let hoverIsland = null;
let currentCircleSize = null;
let mainIslandCode = hoverIsland ? hoverIsland.code : "FM";
const mainColor = "#1f77b4";
const mutedColor = "#bbb";

// Listing des îles observées
const pacificIslands = {
  "Îles Cook": [-21.2330, -159.7670, 60000, "CK"],
  "Fidji": [-17.7134, 179, 220000, "FJ"],
  "États fédérés de Micronésie": [6.9248, 157.3, 680000, "FM"],
  "Kiribati": [1.3278, 172.9769, 70000, "KI"],
  "Îles Marshall": [7.1164, 170, 350000, "MH"],
  "Nouvelle-Calédonie": [-21.8, 165.5, 250000, "NC"],
  "Nauru": [-0.5228, 166.9315, 50000, "NR"],
  "Niue": [-19.0544, -169.8672, 70000, "NU"],
  "Polynésie française": [-17.6797, -149.4068, 70000, "PF"],
  "Papouasie-Nouvelle-Guinée": [-6.3150, 148.1, 850000, "PG"],
  "Palaos": [7.5149, 134.5825, 120000, "PW"],
  "Salomon": [-9.6457, 161.6, 650000, "SB"],
  "Tonga": [-21.1789, -175.1982, 70000, "TO"],
  "Tuvalu": [-8.8, 179, 150000, "TV"],
  "Vanuatu": [-16.7, 169, 400000, "VU"],
  "Samoa": [-13.7590, -172.1046, 70000, "WS"]
};

// Carte principale
//DEF
const map = L.map('map', {
  center: [-6, 173.1185],
  zoom: 5,
  zoomControl: false,
  dragging: false,
  touchZoom: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
});

const graphs = document.getElementById('graphs');

// Tuiles pour carte principale
var baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: '&copy; OpenStreetMap contributors',
  maxNativeZoom: 17,
  maxZoom: 7,
  minZoom: 5,
  opacity: 0.7
}).addTo(map);

// Déplacements limités à l'écran initial
map.setMaxBounds(map.getBounds());

// Tuiles pour le zoom
const zoomLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
});


// Récupération îles geoJson
fetch('https://kickout-app.fr/pacific_dataviz_challenge/iles_pacifique.geojson')
.then(response => response.json())
.then(data => {
  // Fonction récursive pour normaliser toutes les longitudes
  function normalizeGeoJSONCoords(geometry) {
    if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
      geometry.coordinates = geometry.coordinates.map(ring =>
        ring.map(([lon, lat]) => [
          lon < 0 ? lon + 360 : lon,
          lat
        ])
      );
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates = geometry.coordinates.map(polygon =>
        polygon.map(ring =>
          ring.map(([lon, lat]) => [
            lon < 0 ? lon + 360 : lon,
            lat
          ])
        )
      );
    } else if (geometry.type === "Point") {
      let [lon, lat] = geometry.coordinates;
      geometry.coordinates = [lon < 0 ? lon + 360 : lon, lat];
    } else if (geometry.type === "MultiPoint" || geometry.type === "LineString") {
      geometry.coordinates = geometry.coordinates.map(([lon, lat]) => [
        lon < 0 ? lon + 360 : lon,
        lat
      ]);
    }
  }

  // Appliquer la normalisation
  requestAnimationFrame(() => {
    data.features.forEach(feature => {
      normalizeGeoJSONCoords(feature.geometry);
    });
  });

  // Ajouter à la carte
  islandCartoonLayer = L.geoJSON(data, {
    style: {
      color: '#000',
      weight: 3,
      dashArray: '6,3',
      fillOpacity: 0.8,
      className: 'island-feature'
    }
  }).addTo(map);

  borderCartoonLayer = L.geoJSON(data, {
    style: {},
    onEachFeature: (feature, layer) => {}
  });

  // Ajouter la loupe
  magnifyingGlass = L.magnifyingGlass({
    layers: [zoomLayer, borderCartoonLayer],
    radius: 110,
    zoomOffset: 2
  }).addTo(map);
});

// Correction bug îles décalées => Normaliser sur 360°
function normalizeLongitude(lon) {
  return lon < 0 ? lon + 360 : lon;
}

// Liste FINALE îles
const islandList = Object.entries(pacificIslands).map(([name, [lat, lon, radius, code]]) => ({
  name,
  lat,
  lon: normalizeLongitude(lon),
  originalLon: lon, // Au cas ou ..
  radius,
  code
}));

map.whenReady(() => {
  islandList.forEach(island => {
    const lat = island.lat;
    const lon = island.originalLon;

    // Ajouter cercle île avec radius
    L.circle([island.lat, island.lon], {
      color: 'white',
      fillColor: '#FFF',
      fillOpacity: 0.2,
      opacity: 0.2,
      radius: island.radius
    }).addTo(map);

    // Calcul du rayon en pixels
    const center = map.latLngToLayerPoint([island.lat, island.originalLon]);
    const edgeLatLng = L.GeometryUtil.destination(L.latLng(island.lat, island.originalLon), 90, island.radius); // vers l’est
    const edge = map.latLngToLayerPoint(edgeLatLng);
    let r = Math.abs(edge.x - center.x) * (island.radius < 100000 ? 3.2 : island.radius < 170000 ? 2.3 : 1.3);
    if(r > 10000) {
      r = 65;
    }

    // Création du label SVG courbé
    const arcHTML = `
      <div class="curved-label">
        <svg width="${2 * r}" height="${r / 2}">
          <path id="arc-${island.name}" d="M0,0 A${r},${r} 0 0,0 ${2 * r},0" fill="none"/>
          <text>
            <textPath href="#arc-${island.name}" startOffset="50%" text-anchor="middle">
              ${island.name}
            </textPath>
          </text>
        </svg>
      </div>
    `;

    const icon = L.divIcon({
      html: arcHTML,
      className: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker([lat, island.lon], { icon }).addTo(map);
  });
});

// Rendu de la loupe
function renderCircle() {
  const circle = document.getElementsByClassName("circle")[0];
  const point = map.latLngToContainerPoint(lastMouseLatLng);

  circle.style.width = `${currentCircleSize}px`;
  circle.style.height = `${currentCircleSize}px`;
  circle.style.left = `${(point.x - currentCircleSize / 2) + 8}px`;
  circle.style.top = `${(point.y - currentCircleSize / 2) + 26}px`;
}

// DETECTION CURSEUR - mouvements souris
map.on('mousemove', function (e) {
  if (revealLocked) return;
  lastMouseLatLng = e.latlng;
  if (hoverIsland && animPhase == 'paused') {
    renderCircle();
  } else {
    animPhase = 'initial';
  }
  let newHover = null;

  for (const island of islandList) {
    const dist = map.distance(lastMouseLatLng, L.latLng(island.lat, island.lon));
    if (dist < island.radius) {
      newHover = island;
      break;
    }
  }

  // Si mouvement significatif ou changement de cible
  if (!lastMouseLatLng || newHover !== hoverIsland) {
    lastMouseLatLng = e.latlng;
    animPhase = 'initial';
    hoverIsland = newHover;
    removeInfoOverlay();

    if (hoverIsland && animPhase == 'initial') {
      triggerIslandReveal();
    }
  }
});

function removeInfoOverlay() {
  document.getElementById('info-overlay').style.display = 'none';
  graphs.style.display = 'none';
}

// Fonction principale

function triggerIslandReveal() {
  const overlay = document.getElementById('info-overlay');
  overlay.innerHTML = '';
  overlay.style.display = 'block';

  const point = map.latLngToContainerPoint(lastMouseLatLng);
  const px = point.x;
  const py = point.y;

  const circle = document.createElement('div');
  circle.className = 'circle';
  overlay.appendChild(circle);

  const startSize = 220;
  const holdSize = 300;
  const finalSize = Math.max(window.innerWidth, window.innerHeight) * 2;

  currentCircleSize = startSize;
  let animationFrame = null;

  function animateGrowToHold(timestamp, startTime) {
    const elapsed = timestamp - startTime;
    const duration = 1000;
    const progress = Math.min(elapsed / duration, 1);
    const ease = Math.pow(progress, 5);
    currentCircleSize = startSize + (holdSize - startSize) * ease;
    renderCircle();

    if (progress < 1) {
      animationFrame = requestAnimationFrame(ts => animateGrowToHold(ts, startTime));
    } else {
      animPhase = 'paused';

      let pulseStart = performance.now();
      let baseSize = currentCircleSize;
      const amplitude = 10;
      const pulseDuration = 1000;

      function pulse(ts) {
        const elapsed = ts - pulseStart;
        const t = (elapsed % pulseDuration) / pulseDuration;
        const angle = 2 * Math.PI * t;
        currentCircleSize = baseSize + Math.sin(angle) * amplitude;

        renderCircle();

        if (animPhase === 'paused') {
          animationFrame = requestAnimationFrame(pulse);
        }
      }
      animationFrame = requestAnimationFrame(pulse);
    }
  }

  // Terminer l'expansion

  function expandFully(timestamp, startTime, fromSize) {
    const elapsed = timestamp - startTime;
    const duration = 1000;
    const progress = Math.min(elapsed / duration, 1);
    const ease = Math.pow(progress, 10);
    currentCircleSize  = fromSize + (finalSize - fromSize) * ease;
    renderCircle();

    if (progress < 1) {
      animationFrame = requestAnimationFrame(ts => expandFully(ts, startTime, fromSize));
    } else {
      showIslandInfo(hoverIsland);
    }
  }

  // Lancer animation initiale
  requestAnimationFrame(ts => animateGrowToHold(ts, performance.now()));

  // Clic gauche : continuer l'agrandissement
  function onClickLeft() {
    if (animPhase === 'paused' && hoverIsland != null) {
      revealLocked = true;
      mainIslandCode = hoverIsland.code;

      animPhase = 'expanding';
      cancelAnimationFrame(animationFrame);
      requestAnimationFrame(ts => expandFully(ts, ts, currentCircleSize));
      map.getContainer().removeEventListener('click', onClickLeft);

      // Voile blanc
      document.getElementById('full-white-mask').style.opacity = '0.6';

      document.getElementById("drapeau_ile").src = "flags/" + mainIslandCode.toLowerCase() + ".svg";

      // Disparition de la loupe
      const loupeEl = document.querySelector('.leaflet-magnifying-glass');
      loupeEl?.classList.add('fade-out');
      document.getElementById('header-title').style.opacity = '0';

      document.querySelectorAll('textPath').forEach(tp => {
        if (tp.textContent.trim() === hoverIsland.name) {
          tp.setAttribute('opacity', '1');
          tp.setAttribute('font-weight', 'bold');
          tp.setAttribute('font-size', '15px');
        } else {
          tp.setAttribute('opacity', '0');
        }
      });

      map.removeLayer(islandCartoonLayer);

      map.removeLayer(magnifyingGlass);

    } else {
      animPhase = 'initial';
    }
  }

  map.getContainer().addEventListener('click', onClickLeft);

  // Clic droit : annuler tout
  function onRightClick(e) {
    e.preventDefault();
    if (animPhase === 'paused' || revealLocked == false) return;
    removeInfoOverlay();

    cancelAnimationFrame(animationFrame);
    map.getContainer().removeEventListener('click', onClickLeft);
    graphs.removeEventListener('contextmenu', onRightClick);

    revealLocked = false;

    map.removeLayer(magnifyingGlass);
    magnifyingGlass = L.magnifyingGlass({
      layers: [zoomLayer, borderCartoonLayer],
      radius: 110,
      zoomOffset: 2
    }).addTo(map);

    document.getElementById('popup-synthese').classList.remove('show')

    // Retire voile  blanc et réaffiche la loupe
    document.getElementById('full-white-mask').style.opacity = '0';

    const loupeEl = document.querySelector('.leaflet-magnifying-glass');
    loupeEl?.classList.remove('fade-out');
    document.getElementById('header-title').style.opacity = '1';

    document.querySelectorAll('textPath').forEach(tp => {
      tp.setAttribute('opacity', '1');
      tp.setAttribute('font-weight', 'normal');
      tp.setAttribute('font-size', '14px');
    });

    islandCartoonLayer.addTo(map);
  }

  graphs.addEventListener('contextmenu', onRightClick);
}

// Simuler clic droit pour retourner sur la carte

function goBack(btn) {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2
  });

  btn.dispatchEvent(event);
}

// Affichage Graphiques : //
function showIslandInfo(island) {
  mainIslandCode = island.code;
  d3.dsv(";", "DATA/densite_population.csv", row => {
    if (row.GEO_PICT === mainIslandCode) {
      return {
        code : row.GEO_PICT,
        indic: row.INDICATOR,
        value: parseFloat(row.OBS_VALUE)
      };
    }
    // null pour ignorer la ligne (debug)
    return null;
  }).then(data => {

    // MAJ informations sur l'île active
    let population_value = data.filter(d => d.code === mainIslandCode && d.indic === 'POPULATION').map(d => d.value);
    let surface_value = data.filter(d => d.code === mainIslandCode && d.indic === 'LANDAREA').map(d => d.value);
    let densite_value = data.filter(d => d.code === mainIslandCode && d.indic === 'POPDENSITY').map(d => d.value);

    population_value = new Intl.NumberFormat('fr-FR').format(population_value);
    surface_value = new Intl.NumberFormat('fr-FR').format(surface_value);
    densite_value = new Intl.NumberFormat('fr-FR').format(densite_value);

    document.getElementById("nom_ile").innerHTML = hoverIsland.name + " | " + (mainIslandCode.replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt())));
    document.getElementById("surface_ile").innerHTML = "<strong>Surface :</strong> " + surface_value + "* km²";
    document.getElementById("population_ile").innerHTML = "<strong>Population :</strong> environ " + population_value + "* habitants";
    document.getElementById("densite_ile").innerHTML = "  <strong>⇒ Densité :</strong> environ " + densite_value + "* hab/km²";
  });
  updateGraph();
  updateLineChart();
  graphs.style.display = 'flex';
}
