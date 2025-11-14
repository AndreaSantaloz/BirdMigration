import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000010);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 1, 1);
scene.add(light);

const loader = new THREE.TextureLoader();
// Asumiendo que 'mapa4.jpg' está en la ruta correcta.
const texture = loader.load("./src/mapa4.jpg");

const radius = 50;
const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
const sphereMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 60,
});
const earth = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(earth);

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true,
});

// --- Creación de líneas de latitud (Mismos que el original) ---
const latStep = 10;
for (let lat = -80; lat <= 80; lat += latStep) {
  const theta = THREE.MathUtils.degToRad(lat);
  const y = radius * Math.sin(theta);
  const r = radius * Math.cos(theta);
  const points = [];
  for (let lon = 0; lon <= 360; lon += 5) {
    const phi = THREE.MathUtils.degToRad(lon);
    points.push(new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi)));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  scene.add(new THREE.Line(geometry, lineMaterial));
}

// --- Creación de líneas de longitud (Mismos que el original) ---
const lonStep = 10;
for (let lon = 0; lon < 360; lon += lonStep) {
  const phi = THREE.MathUtils.degToRad(lon);
  const points = [];
  for (let lat = -90; lat <= 90; lat += 5) {
    const theta = THREE.MathUtils.degToRad(lat);
    const x = radius * Math.cos(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta);
    const z = radius * Math.cos(theta) * Math.sin(phi);
    points.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  scene.add(new THREE.Line(geometry, lineMaterial));
}

// --- Función de conversión de Lat/Lon a Vector3 (Misma que el original) ---
function latLonToVector3(lat, lon, r = radius + 1.5) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// --- MAPA DE COLORES POR ESPECIE (NUEVO) ---
const SPECIES_COLOR_MAP = new Map([
  ["Warbler", 0x00ff00], // Verde brillante
  ["Hawk", 0xff0000], // Rojo
  ["Crane", 0x0000ff], // Azul
  ["Eagle", 0xffff00], // Amarillo
  ["Owl", 0x800080], // Púrpura
  ["Pigeon", 0x00ffff], // Cian
]);

function getSpeciesColor(species) {
  return SPECIES_COLOR_MAP.get(species) || 0xffffff;
}

const birds = [];
function createMigrationArcs(migrationData) {
  console.log("Creando arcos de migración con", migrationData.length, "rutas");

  if (migrationData.length === 0) {
    console.warn("No hay datos de migración");
    return;
  }

  const routeGroups = {};

  migrationData.forEach((migration) => {
    const startRegion = `${Math.round(migration.startLat / 15) * 15},${
      Math.round(migration.startLon / 15) * 15
    }`;
    const endRegion = `${Math.round(migration.endLat / 15) * 15},${
      Math.round(migration.endLon / 15) * 15
    }`;
    const routeKey = `${migration.species}|${startRegion}|${endRegion}`;

    if (!routeGroups[routeKey]) {
      routeGroups[routeKey] = {
        species: migration.species, // NUEVO: Almacena la especie
        startLat: parseFloat(startRegion.split(",")[0]),
        startLon: parseFloat(startRegion.split(",")[1]),
        endLat: parseFloat(endRegion.split(",")[0]),
        endLon: parseFloat(endRegion.split(",")[1]),
        count: 0,
      };
    }
    routeGroups[routeKey].count++;
  });

  console.log(
    `Agrupadas en ${Object.keys(routeGroups).length} rutas principales`
  );

  const sortedRoutes = Object.values(routeGroups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  sortedRoutes.forEach((route) => {
    const intensity = Math.min(route.count / 20, 1);
    const lineWidth = 0.5 + intensity * 2;
    const opacity = 0.3 + intensity * 0.5;

    const arcColor = getSpeciesColor(route.species);

    const arc = createArc(
      route.startLat,
      route.startLon,
      route.endLat,
      route.endLon,
      arcColor,
      lineWidth,
      opacity,
      route.count
    );
    const numBirds = Math.max(1, Math.floor(intensity * 8));

    createBirdsForArc(arc, numBirds, arcColor);
  });

  console.log("Arcos de migración creados exitosamente");
}

function createArc(
  startLat,
  startLon,
  endLat,
  endLon,
  color,
  width,
  opacity,
  count
) {
  const start = latLonToVector3(startLat, startLon, radius + 0.5);
  const end = latLonToVector3(endLat, endLon, radius + 0.5);
  const controlPoint = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius * 1.8);

  const curve = new THREE.QuadraticBezierCurve3(start, controlPoint, end);
  const points = curve.getPoints(30);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width,
    transparent: true,
    opacity: opacity,
  });

  const arc = new THREE.Line(geometry, material);
  arc.userData = {
    isMigrationArc: true,
    count: count,
    startRegion: `${startLat},${startLon}`,
    endRegion: `${endLat},${endLon}`,
    curve: curve,
    color: color,
  };

  scene.add(arc);
  return arc;
}

function createBirdsForArc(arc, numBirds, color) {
  for (let i = 0; i < numBirds; i++) {
    const birdGeometry = new THREE.SphereGeometry(0.3, 8, 8);

    const birdMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
    });

    const bird = new THREE.Mesh(birdGeometry, birdMaterial);
    bird.userData = {
      isBird: true,
      arc: arc,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      curve: arc.userData.curve,
    };

    updateBirdPosition(bird);

    scene.add(bird);
    birds.push(bird);
  }
}

function updateBirdPosition(bird) {
  const progress = bird.userData.progress;
  const curve = bird.userData.curve;
  const position = curve.getPoint(progress);
  bird.position.copy(position);
  if (progress < 0.99) {
    const tangent = curve.getTangent(progress);
    bird.lookAt(bird.position.clone().add(tangent));
  }
}
function animateBirds() {
  birds.forEach((bird) => {
    if (bird.userData.isBird) {
      bird.userData.progress += bird.userData.speed;
      if (bird.userData.progress >= 1) {
        bird.userData.progress = 0;
      }
      updateBirdPosition(bird);
      bird.material.opacity = 0.7 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  });
}

async function loadMigrationData() {
  try {
    console.log("Cargando datos de migración para arcos...");
    const response = await fetch("./src/bird_migration_data.csv");

    if (!response.ok) {
      throw new Error(`Error HTTP! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log("CSV cargado, longitud:", csvText.length);

    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    console.log("Número de líneas:", lines.length);

    if (lines.length <= 1) {
      throw new Error("CSV vacío o solo tiene headers");
    }

    const migrationData = [];
    const headers = lines[0].split(",").map((h) => h.trim());

    console.log("Headers encontrados:", headers);

    // Encontrar índices de columnas
    const speciesIdx = headers.findIndex((h) => h === "Species"); // NUEVO
    const startLatIdx = headers.findIndex((h) => h === "Start_Latitude");
    const startLonIdx = headers.findIndex((h) => h === "Start_Longitude");
    const endLatIdx = headers.findIndex((h) => h === "End_Latitude");
    const endLonIdx = headers.findIndex((h) => h === "End_Longitude");

    console.log(
      `Índices - Species: ${speciesIdx} - Start: ${startLatIdx},${startLonIdx} - End: ${endLatIdx},${endLonIdx}`
    );

    if (
      speciesIdx === -1 || // Asegurarse de que 'Species' está presente
      startLatIdx === -1 ||
      startLonIdx === -1 ||
      endLatIdx === -1 ||
      endLonIdx === -1
    ) {
      throw new Error(
        "No se encontraron las columnas necesarias (Species, Start o End)"
      );
    }

    let processed = 0;

    for (let i = 1; i < lines.length; i++) {
      // El código original solo procesa un 10% de los datos por rendimiento
      if (Math.random() > 0.1) continue;

      const line = lines[i];
      const columns = line.split(",").map((col) => col.trim());

      if (
        columns.length >
        Math.max(speciesIdx, startLatIdx, startLonIdx, endLatIdx, endLonIdx)
      ) {
        const species = columns[speciesIdx]; // NUEVO: Extraer especie
        const startLat = parseFloat(columns[startLatIdx]);
        const startLon = parseFloat(columns[startLonIdx]);
        const endLat = parseFloat(columns[endLatIdx]);
        const endLon = parseFloat(columns[endLonIdx]);

        if (
          species && // Verificar que la especie no esté vacía
          !isNaN(startLat) &&
          !isNaN(startLon) &&
          !isNaN(endLat) &&
          !isNaN(endLon) &&
          Math.abs(startLat) <= 90 &&
          Math.abs(startLon) <= 180 &&
          Math.abs(endLat) <= 90 &&
          Math.abs(endLon) <= 180
        ) {
          migrationData.push({
            species, // NUEVO: Incluir especie en los datos
            startLat,
            startLon,
            endLat,
            endLon,
          });
          processed++;
        }
      }
    }

    console.log(`Datos procesados para arcos: ${processed} rutas`);

    if (migrationData.length === 0) {
      console.log("Creando datos de ejemplo para arcos...");
      createExampleArcs();
    } else {
      createMigrationArcs(migrationData);
    }
  } catch (error) {
    console.error("Error cargando datos reales:", error);
    console.log("Creando datos de ejemplo para arcos...");
  }
}

function init() {
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.003;
  scene.traverse((obj) => {
    if (obj.type === "Line" || (obj.userData && obj.userData.isMigrationArc)) {
      obj.rotation.y += 0.003;
    }
  });
  animateBirds();

  renderer.render(scene, camera);
}
console.log("Iniciando visualización de arcos de migración con pájaros...");
init();
animate();
loadMigrationData();
