
---

# BirdMigration

## Autora

**Andrea Santana López**

## Introducción

Las aves migratorias desempeñan un papel fundamental en los ecosistemas del planeta, ya que contribuyen al control de plagas, la polinización y la dispersión de semillas. Cada año, millones de estas especies emprenden largos viajes entre sus zonas de reproducción y de invernada, recorriendo miles de kilómetros a través de diversos hábitats y fronteras geográficas. Sin embargo, en las últimas décadas, las poblaciones de muchas aves migratorias han disminuido de manera alarmante debido a una combinación de factores ambientales y humanos.

Entre las principales amenazas se encuentran la pérdida y fragmentación de hábitats, el cambio climático, la contaminación, las colisiones con infraestructuras humanas (como edificios, aerogeneradores y tendidos eléctricos), así como la caza y el tráfico ilegal. Estos problemas se ven agravados por el hecho de que las rutas migratorias atraviesan numerosos países, lo que dificulta la aplicación de medidas de conservación coordinadas y efectivas.

La comprensión y protección de las aves migratorias requiere, por tanto, un enfoque global y multidisciplinario que combine la investigación científica, la cooperación internacional y la sensibilización social. Solo mediante la acción conjunta de gobiernos, organizaciones ambientales y comunidades locales será posible garantizar la supervivencia de estas especies y el equilibrio ecológico que representan.

## ¿De qué se trata la práctica?

El código crea una Tierra 3D giratoria con líneas de latitud y longitud. Luego, lee datos de rutas de migración desde un archivo CSV y las visualiza como arcos curvos sobre la superficie del planeta. Además, añade pequeños objetos (llamados "pájaros") que se mueven a lo largo de estos arcos, simulando el movimiento migratorio.
## ¿Qué necesitamos para el proyecto?

Se utilizará un **dataset de migración de aves mundial** de tipo sintetico, ya que actualmente existe una disponibilidad limitada de datos locales sobre aves migratorias.
Para ello, se ha accedido a la plataforma **Kaggle**, donde se seleccionó el siguiente conjunto de datos:
👉 [Aves migratorias](https://www.kaggle.com/datasets/sahirmaharajj/bird-migration-dataset-data-visualization-eda?resource=download).

También será necesario crear una cuenta en **CodeSandbox** y desarrollar el proyecto utilizando **JavaScript** junto con la biblioteca **Three.js**, que permitirá la representación visual en 3D de los datos.

## ¿Cuáles son los controles de los usuarios?

El proyecto  contará con controles interactivos para que pueda moverse usando el ratón pero su mayor función es  en ofrecer una **visualización automatizada de los datos de la migración de aves**.

## ¿Cómo se va a desarrollar?
:warning: **Advertencia:** Dependiendo de donde ponga los archivos tendrán unas rutas u otras
<br>
<br>
En esta sección se explicará el **proceso de desarrollo de la práctica**, incluyendo la carga de datos, el procesamiento de la información y la creación de la visualización con Three.js.

Como todo proyecto de Three.js importamos las librerias necesarias que son las siguientes:

```javascript
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
```
Luego se declará las variables necesarias para la visualización del canvas.

```javascript

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

```
Aquí se deja explicado que realiza cada una
|variable|funcionalidad|
|---|----|
|scene| el contenedor principal donde se organizan y añaden todos los elementos que componen una escena 3D|
|camera|la cámara es el componente que define la vista desde la que se renderiza la escena 3D, actuando como el ojo virtual del observador|
|renderer|render se refiere al proceso de generar una imagen 2D a partir de una escena 3D compleja, y Renderer es el objeto específico de la biblioteca que se encarga de esta tarea|

Tras explicar esto se explicará los elementos necesarios para la escena 3D.
Primero se declara una luz que se haría pasar por un sol para que se vea la textura del planeta tierra del sistema solar,donde la posicionamos en la coordenanda (2,1,1) y la añadimos  a la escena.

```javascript
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 1, 1);
scene.add(light);
```

Segundo se carga las variables necesarias para poner las texturas al planeta tierra que son el loader que báscicamente es un manager de carga y luego texture que carga la textura que usará el planeta tierra.

```javascript

const loader = new THREE.TextureLoader();
const texture = loader.load("./src/mapa4.jpg");

```

Tercero se hace el planeta tierra estableciendo un radio de 50,declaramos la geometría y añadimos la textura a spherematerial,luego se declará la variable tierra constante con los dos valores anteriores y se añade a la escena.

```javascript

const radius = 50;
const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
const sphereMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  shininess: 60,
});
const earth = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(earth);

```

Cuarto se hace la creación de la malla para las líneas de longitud y latitud estableciendo primero el material de las líneas y luego se dibuja las líneas.

```javascript

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true,
});

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

function latLonToVector3(lat, lon, r = radius + 1.5) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

```

Quinto se declará un array de pájaros que están migrando ,los colores de los pájaros y la función para establecer el color de los pájaros según la leyenda

```javascript
const birds = [];
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

```

Sexto se declará la función para crear los arcos de las migraciones

```javascript

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

    const routeKey = `${startRegion}|${endRegion}`;

    if (!routeGroups[routeKey]) {
      routeGroups[routeKey] = {
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

 
  const arcColor = getSpeciesColor(route.species);
  sortedRoutes.forEach((route, index) => {
    const intensity = Math.min(route.count / 20, 1);
    const lineWidth = 0.5 + intensity * 2;
    const opacity = 0.3 + intensity * 0.5;
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
```

Séptimo se declará la función para crear arcos .

```javascript
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
```
Octavo para crear arco para pájaros
```javascript
function createBirdsForArc(arc, numBirds, color) {
  for (let i = 0; i < numBirds; i++) {
    const birdGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const birdMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // COLOR BLANCO
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
```
Noveno aquí se declará la función para actualizar la posición de los pájaros.
```javascript
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
```
Decímo aquí cargamos los valores de las migraciones que se va a representar
```javascript
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
    const startLatIdx = headers.findIndex((h) => h === "Start_Latitude");
    const startLonIdx = headers.findIndex((h) => h === "Start_Longitude");
    const endLatIdx = headers.findIndex((h) => h === "End_Latitude");
    const endLonIdx = headers.findIndex((h) => h === "End_Longitude");

    console.log(
      `Índices - Start: ${startLatIdx},${startLonIdx} - End: ${endLatIdx},${endLonIdx}`
    );

    if (
      startLatIdx === -1 ||
      startLonIdx === -1 ||
      endLatIdx === -1 ||
      endLonIdx === -1
    ) {
      throw new Error("No se encontraron las columnas de inicio o destino");
    }

    let processed = 0;

    for (let i = 1; i < lines.length; i++) {
      if (Math.random() > 0.1) continue;

      const line = lines[i];
      const columns = line.split(",").map((col) => col.trim());

      if (
        columns.length >
        Math.max(startLatIdx, startLonIdx, endLatIdx, endLonIdx)
      ) {
        const startLat = parseFloat(columns[startLatIdx]);
        const startLon = parseFloat(columns[startLonIdx]);
        const endLat = parseFloat(columns[endLatIdx]);
        const endLon = parseFloat(columns[endLonIdx]);
        if (
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

  
    createExampleArcs();
  
}
```
Por último,se declará las funciones init y animate y se ejecutan las funciones init,animate y loadMigrationData donde el primero aquí el orbit control,la segunda función hace que el planeta rote y llama a la función animteBirds para la animación y la tercer función carga los datos.

```javascript
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
```
## Demostración de la visualización



https://github.com/user-attachments/assets/9b2657b7-3208-4c4d-9c3e-649e132f5097



<br>
Un ejemplo de que los datos sintéticos no son tan buenos

## Contacto

Si desea contactar por alguna duda o sugerencia de mejora, puede hacerlo al correo electrónico:
📧 **[andreasantaloz@gmail.com](mailto:andreasantaloz@gmail.com)**

---
