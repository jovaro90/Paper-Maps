/*-------------       1.LIBRERIAS        ---------------*/

import './style.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css";
//librerias Mapa
import {Map, View} from 'ol';
import {OSM, TileWMS, Vector as VectorSource} from 'ol/source'; //teselado
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'; //vectorial
import { fromLonLat } from 'ol/proj';
import sync from 'ol-hashed'; // añade a la url el centro del mapa
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import {format} from "ol/coordinate";
//librerias Controles
import { defaults as defaultControls, MousePosition} from "ol/Control";
import { OverviewMap } from 'ol/Control';
import { ScaleLine } from 'ol/Control';
//import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';
import Draw from 'ol/interaction/Draw';
import { Circle as CircleStyle, Fill, Stroke } from 'ol/style';

// MODULOS:
// importar CSV datos
import { loadCSVData, filterCSVData, processCSVData } from './modules/csvHandler.js';
//sidebar derecha resultados
import { displaySearchResults, closePopup, generateStatistics, } from './modules/sidebarResults.js';
//login usuarios
import { 
  loadUsersFromCSV, 
  loginUser, 
  logoutUser, 
  loadLoggedInUser, 
  openRegisterPopup, 
  closeRegisterPopup, 
  submitRegistration,
  setUserRole,
  initializeRoleAndSidebarEvents, 
  
} from './modules/login.js';

// Cargar el usuario al iniciar la página
window.onload = function () {
  loadLoggedInUser();

  // Inicializar eventos relacionados con roles y sidebars
  initializeRoleAndSidebarEvents();

  // Vincular botones de autenticación
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', loginUser);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) registerBtn.addEventListener('click', openRegisterPopup);

  const submitRegisterBtn = document.getElementById('submitRegisterBtn');
  if (submitRegisterBtn) {
    submitRegisterBtn.addEventListener('click', submitRegistration);
  }

  const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
  if (cancelRegisterBtn) {
    cancelRegisterBtn.addEventListener('click', closeRegisterPopup);
  }
};

import { showAddDataForm, hideAddDataForm, addNewData } from './modules/datos.js';

// Vincular el botón "Añadir Datos" al formulario
document.getElementById('addDataBtn').addEventListener('click', showAddDataForm);

// Vincular el botón "Cancelar" del formulario de añadir datos
document.getElementById('cancelAddDataBtn').addEventListener('click', hideAddDataForm);

// Vincular el botón "Guardar" del formulario de añadir datos
document.getElementById('saveDataBtn').addEventListener('click', () => addNewData(csvData));
/*-------------       2.CONTROLES Y CONFIGURACION DEL MAPA       ---------------*/

// 2.2 Escala
const scaleControl2 = new ScaleLine ({
    units: 'metric',
    bar: true, // intervalos de escala grafica
    steps: 4, // divisiones
    text: true, // valor de escala
    minWidth: 150, // ancho minimo  
});

// 2.3 minimapa
const OverviewMapControl = new OverviewMap ({
    collapsed: false,
    layers:[
      new TileLayer({
        source: new OSM (),
      }),
    ],
  });

  // coordenadas puntero
const mousePositionControl = new MousePosition({
  coordinateFormat: (coordinate) => {
    return format(coordinate, "Lat: {y}, Long {x}", 4); // Formato de coordenadas
  },
  projection: "EPSG:4326", // Proyección de las coordenadas
  className: "coordinate_display",
});
  
  
// variable controles extendida:
const extendControls = [
  OverviewMapControl,
  scaleControl2,
  mousePositionControl,
];



/*-------------       MODULO 1.CARGAR CSV Y FILTRAR RESULTADOS      ---------------*/

// Cargar y filtrar datos CSV
let csvData = [];
let filteredResults = []; // Declarar la variable global para almacenar los resultados filtrados
let representedPoints = []; // Variable global para almacenar los puntos representados

loadCSVData().then(data => {
  csvData = data;
});

document.getElementById('searchBtn').addEventListener('click', function () {
  if (!csvData || csvData.length === 0) {
    console.error('Los datos CSV aún no están disponibles o están vacíos.');
    return;
  }

  const location = document.getElementById('searchLocation').value.toLowerCase();
  const theme = document.getElementById('themeSelect').value.toLowerCase();
  const year = document.getElementById('yearFilter').value;
  const keyword = document.getElementById('searchBox').value.toLowerCase();

  // Filtrar los datos según los criterios del usuario
  filteredResults = filterCSVData(csvData, location, theme, year, keyword);

  // Mostrar los resultados filtrados
  document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;
  displaySearchResults(filteredResults);

  // Agregar los puntos filtrados al mapa
  addFilteredPointsToMap(filteredResults);
});

/*--------------CLICAR PUNTOS MAPA Y DAR INFO-------------------------- */
// Función para agregar los puntos filtrados al mapa
function addFilteredPointsToMap(filteredResults) {
  const vectorSource = new VectorSource();
  representedPoints = []; // Reiniciar la variable antes de agregar nuevos puntos

  // Crear el Overlay que actuará como el popup
  const popupContainer = document.getElementById('popupContainer');
  const popupContent = document.getElementById('popupInfoContent');
  const overlay = new Overlay({
    element: popupContainer,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  // Función para cerrar el popup
  function closePopup() {
    popupContainer.style.display = 'none';
    overlay.setPosition(undefined);
  }

  const closePopupButton = document.getElementById('closePopupButton');
  if (closePopupButton) {
    closePopupButton.addEventListener('click', closePopup);
  }
  map.addOverlay(overlay);

  // Iterar sobre los resultados filtrados para agregar puntos al mapa
  filteredResults.forEach(item => {
    const lat = parseFloat(item.Latitud);
    const lon = parseFloat(item.Longitud);

    if (!isNaN(lat) && !isNaN(lon)) {
      const point = new ol.Feature({
        geometry: new ol.geom.Point(fromLonLat([lon, lat])),
        name: item.Nombre,
        descripcion: item.descripcion,
        link: item.link,
      });

      point.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      }));

      vectorSource.addFeature(point);
      representedPoints.push(point); // Agregar el punto a la lista global
    }
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  map.addLayer(vectorLayer);


  // Evento de selección de puntos
  const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.click,
  });

  selectInteraction.on('select', function (event) {
    const selectedFeature = event.selected[0];

    if (selectedFeature) {
      const name = selectedFeature.get('name');
      const description = selectedFeature.get('descripcion');
      const link = selectedFeature.get('link');

      popupContent.innerHTML = `
        <h3>${name}</h3>
        <p>${description}</p>
        <a href="${link}" target="_blank">Más información</a>
      `;
      popupContainer.style.display = 'flex';
      overlay.setPosition(selectedFeature.getGeometry().getCoordinates());
    }
  });

  map.addInteraction(selectInteraction);
}

/*--------------SELECCIONAR ÁREA-------------------------- */
// Función para actualizar la barra lateral con los puntos seleccionados
// Función para actualizar la barra lateral con los puntos seleccionados
function updateSidebarWithSelectedPoints(points) {
  const sidebar = document.getElementById('sidebarResults');
  const resultsContainer = document.getElementById('popupResultsContent'); // Contenedor de resultados

  if (!resultsContainer) {
    console.error('El contenedor de resultados (popupResultsContent) no se encontró en el DOM.');
    return;
  }

  // Limpiar los resultados anteriores
  resultsContainer.innerHTML = '';

  if (points.length === 0) {
    resultsContainer.innerHTML = '<p>No hay puntos dentro del área seleccionada.</p>';
    return;
  }

  // Crear una lista de los puntos seleccionados
  const list = document.createElement('ul');
  points.forEach(point => {
    // Manejar tanto objetos simples como instancias de ol.Feature
    const name = point.Nombre || point.get?.('name') || 'Sin nombre';
    const description = point.descripcion || point.get?.('descripcion') || 'Sin descripción';
    const link = point.link || point.get?.('link') || '#';

    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <h4>${name}</h4>
      <p>${description}</p>
      <a href="${link}" target="_blank">Más información</a>
    `;
    list.appendChild(listItem);
  });

  resultsContainer.appendChild(list);

  // Mostrar la barra lateral si está oculta
  if (!sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
    document.getElementById('toggleSidebarResultsBtn').textContent = 'Ocultar Resultados';
  }
}
// Función para habilitar el dibujo de un área
function enableAreaSelection() {
  const drawInteraction = new Draw({
    source: new VectorSource(),
    type: 'Polygon',
  });

  map.addInteraction(drawInteraction);

  drawInteraction.on('drawend', function (event) {
    const areaPolygon = event.feature.getGeometry();
    // Primero, actualizar representedPoints
  representedPoints = representedPoints.filter(point => 
    areaPolygon.intersectsCoordinate(point.getGeometry().getCoordinates())
  );
  console.log('Puntos representados actualizados:', representedPoints);

    // Filtrar puntos dentro del área seleccionada
  const pointsInArea = representedPoints.filter(point => {
    const pointCoordinates = point.getGeometry().getCoordinates(); 
    return areaPolygon.intersectsCoordinate(pointCoordinates); // 🛠 Verificar intersección
  });

    console.log('Puntos seleccionados dentro del área:', pointsInArea);
// Solo actualizar la barra lateral si hay puntos seleccionados
if (pointsInArea.length > 0) {
  updateSidebarWithSelectedPoints(pointsInArea);
} else {
  console.warn('No se encontraron puntos dentro del área seleccionada.');
}

map.removeInteraction(drawInteraction);
    // Actualizar `filteredResults` eliminando los puntos fuera del área
filteredResults = filteredResults.filter(item => {
  const pointCoordinates = fromLonLat([parseFloat(item.Longitud), parseFloat(item.Latitud)]);
  return areaPolygon.intersectsCoordinate(pointCoordinates);
}).map(item => ({
  Nombre: item.Nombre || 'Sin nombre',
  descripcion: item.descripcion || 'Sin descripción',
  link: item.link || '#',
  Latitud: item.Latitud,
  Longitud: item.Longitud,
}));

    // Actualizar `representedPoints` eliminando los puntos fuera del área
    representedPoints = representedPoints.filter(point => {
      const pointCoordinates = point.getGeometry().getCoordinates();
      return areaPolygon.intersectsCoordinate(pointCoordinates);
    });

    console.log('Resultados filtrados actualizados:', filteredResults);

    // Cambiar el estilo de los puntos seleccionados
    pointsInArea.forEach(point => {
      point.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#FF9800', // Cambiar el color para los puntos seleccionados
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 2,
          }),
        }),
      }));
    });

    console.log('Puntos seleccionados antes de actualizar la barra lateral:', pointsInArea);
    // Actualizar la barra lateral con los puntos seleccionados
    updateSidebarWithSelectedPoints(pointsInArea);

    // Eliminar la interacción de dibujo después de completar el área
    map.removeInteraction(drawInteraction);
  });
}

// Vincular la funcionalidad de selección de área a un botón
document.getElementById('selectAreaBtn').addEventListener('click', enableAreaSelection);
/*      _______________
        ||   ROLES   ||
        ||__USUARIO__||      
______________________________________________________________________________________________*/

/*-------------       8.ROLES DE USUARIO       ---------------*/

// Definir roles y permisos
const roles = {
  admin: {
    canEdit: true,
    canDelete: true,
    canViewStats: true,
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canViewStats: true,
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canViewStats: true,
  },
};

// Variable global para el rol actual del usuario
let currentUserRole = 'viewer'; // Cambiar según el rol del usuario

// Función para verificar permisos
function hasPermission(action) {
  return roles[currentUserRole] && roles[currentUserRole][action];
}

// Ejemplo: Restringir acciones según el rol
document.getElementById('editBtn').addEventListener('click', function () {
  if (!hasPermission('canEdit')) {
    alert('No tienes permiso para editar.');
    return;
  }
  // ...acción de edición...
});

document.getElementById('deleteBtn').addEventListener('click', function () {
  if (!hasPermission('canDelete')) {
    alert('No tienes permiso para eliminar.');
    return;
  }
  // ...acción de eliminación...
});

document.getElementById('viewStatsBtn').addEventListener('click', function () {
  if (!hasPermission('canViewStats')) {
    alert('No tienes permiso para ver estadísticas.');
    return;
  }
  // ...acción para ver estadísticas...
});



/*-------------       LOGIN Y LOGOUT DE USUARIO      ---------------*/

// Vincular el botón de registro al popup
document.getElementById('registerBtn').addEventListener('click', openRegisterPopup);

/*-------------       9.AGREGAR NUEVOS DATOS      ---------------*/

/*      _______________
        ||   CAPAS   ||
        ||___________||      
______________________________________________________________________________________________*/
// capa:
const osmLayer = new TileLayer ({
    title: "OSM",
    visible: true,
    source: new OSM(),
    type: "base",
  });
  
  // capa tesela WMS:
  const ortoPNOALayer = new TileLayer ({
    title: "WMS PNOA",
    visible: false,
    source: new TileWMS ({
      url: "https://www.ign.es/wms-inspire/pnoa-ma?",
      params: {LAYERS: "OI.OrthoimageCoverage", TILED: true},
    }),
  type: "base",
  });
  
  // Añadir las capas a un grupo de capas base
  const baseLayers = new LayerGroup({
    title: "Capas Base",
    layers: [osmLayer, ortoPNOALayer],
  });
  
const map = new Map({
    target: 'map',
    layers: [baseLayers],
    view: new View({
      center: fromLonLat([2.186794, 41.401173]),
      zoom: 13, // zoom inicial
    }),
    
    controls: defaultControls({
        //gestion controles por defecto
        zoom: true,
        attribution: true,
        rotate: true,
      }).extend(extendControls),
    });

    
// Configurar LayerSwitcher en el contenedor de la cabecera
const layerSwitcher = new LayerSwitcher({
  tipLabel: "Capas", // Tooltip al pasar el mouse
  groupSelectStyle: "group", // Muestra solo una capa base a la vez
  target: document.getElementById('layerSwitcherContainer'), // Contenedor en la cabecera
});

map.addControl(layerSwitcher);

sync(map);

// Vincular el botón de la sidebar-right con la funcionalidad
document.getElementById('toggleSidebarBtn').addEventListener('click', toggleSidebarResults);

// Mostrar la sidebar-right automáticamente al buscar
document.getElementById('searchBtn').addEventListener('click', function () {
  const sidebar = document.getElementById('sidebarResults');
  const button = document.getElementById('toggleSidebarResultsBtn');
  if (!sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
    button.textContent = 'Ocultar Resultados';
  }
});

// Función para abrir/cerrar el minimapa
let isMinimapOpen = true;
document.getElementById('toggleMinimapBtn').addEventListener('click', function () {
  isMinimapOpen = !isMinimapOpen;
  OverviewMapControl.setCollapsed(!isMinimapOpen);
  this.textContent = isMinimapOpen ? 'Cerrar Minimapa' : 'Abrir Minimapa';
});


// Función para cerrar el popup de información
document.addEventListener('DOMContentLoaded', function () {
  const closePopupButton = document.getElementById('closePopup');
  const popupContainer = document.getElementById('popupContainer');

  if (closePopupButton && popupContainer) {
    closePopupButton.addEventListener('click', function () {
      popupContainer.style.display = 'none';
    });
  } else {
    console.error('El botón o el contenedor del popup no se encontraron.');
  }
});