//holi
//-----------------------------------------------------------//
/*-------------------- LIBRERIAS -------------------------- */
//---------------------------------------------------------//

import './style.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css";
//librerias Mapa
import {Map, View} from 'ol';
import {OSM, TileWMS, Vector as VectorSource} from 'ol/source'; //teselado
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'; //vectorial
import { fromLonLat } from 'ol/proj';
import sync from 'ol-hashed'; // añade a la url el centro del mapa
import {format} from "ol/coordinate";
import XYZ from 'ol/source/XYZ';
//librerias Controles
import { defaults as defaultControls, MousePosition} from "ol/Control";
import { ScaleLine, OverviewMap } from 'ol/Control';
//import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';
import { defaults as defaultInteractions } from 'ol/interaction';




//-----------------------------------------------------------//
/*-------------------- CONTROLES -------------------------- */
//---------------------------------------------------------//


// 2.2 Escala
const scaleControl2 = new ScaleLine ({
    units: 'metric',
    bar: true, // intervalos de escala grafica
    steps: 4, // divisiones
    text: true, // valor de escala
    minWidth: 150, // ancho minimo  
});

  // coordenadas puntero
const mousePositionControl = new MousePosition({
  coordinateFormat: (coordinate) => {
    return format(coordinate, "Lat: {y}, Long {x}", 4); // Formato de coordenadas
  },
  projection: "EPSG:4326", // Proyección de las coordenadas
  className: "coordinate_display",
});

//minimapa
const OverviewMapControl = new OverviewMap ({
  layers:[
    new TileLayer({
      source: new OSM(),
    }),
  ],
});
  
  
// variable controles extendida:
const extendControls = [
  scaleControl2,
  OverviewMapControl,
  mousePositionControl,
];


//-----------------------------------------------------------//
/*---------------------- CAPAS ---------------------------- */
//---------------------------------------------------------//


const osmLayer = new TileLayer({
  title: "OSM",
  visible: false,
  source: new OSM(),
  type: "base",
});

// capa tesela WMS:
const ortoPNOALayer = new TileLayer({
  title: "WMS PNOA",
  visible: false,
  source: new TileWMS({
    url: "https://www.ign.es/wms-inspire/pnoa-ma?",
    params: { LAYERS: "OI.OrthoimageCoverage", TILED: true },
  }),
  type: "base",
});

const cartoDarkLayer = new TileLayer({
  title: "CARTO Dark",
  visible: true,
  source: new OSM({
    url: "http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  }),
  type: "base",
});

const googleMapsLayer = new TileLayer({
  title: "Google Maps",
  visible: false,
  source: new XYZ({
    url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
  }),
  type: "base",
});

const googleSatelliteLayer = new TileLayer({
  title: "Google Satellite",
  visible: false,
  source: new XYZ({
    url: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
  }),
  type: "base",
});

const googleTrafficLayer = new TileLayer({
  title: "Google Traffic",
  visible: false,
  source: new XYZ({
    url: "https://mt1.google.com/vt/lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}",
  }),
  type: "base",
});

const googleRoadsLayer = new TileLayer({
  title: "Google Roads",
  visible: false,
  source: new XYZ({
    url: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
  }),
  type: "base",
});

const esriImageryLayer = new TileLayer({
  title: "ESRI Imagery",
  visible: false,
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  }),
  type: "base",
});

const esriStreetsLayer = new TileLayer({
  title: "ESRI Streets",
  visible: false,
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  }),
  type: "base",
});

const esriTopoLayer = new TileLayer({
  title: "ESRI Topo",
  visible: false,
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  }),
  type: "base",
});

const esriTransportationLayer = new TileLayer({
  title: "ESRI Transportation",
  visible: false,
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  }),
  type: "base",
});

// Añadir las capas a un grupo de capas base
const baseLayers = new LayerGroup({
  title: "Capas Base",
  layers: [
    osmLayer,
    ortoPNOALayer,
    cartoDarkLayer,
    googleMapsLayer,
    googleSatelliteLayer,
    googleTrafficLayer,
    googleRoadsLayer,
    esriImageryLayer,
    esriStreetsLayer,
    esriTopoLayer,
    esriTransportationLayer,
  ],
});

const map = new Map({
  target: 'map',
  layers: [baseLayers],
  view: new View({
    center: fromLonLat([2.186794, 41.401173]),
    zoom: 13,
  }),
  controls: defaultControls({
    zoom: false, 
    attribution: true,
    rotate: true,
  }).extend(extendControls),
  interactions: defaultInteractions(), 
});
  baseLayers.getLayers().forEach((layer) => {
    layer.on('change:visible', () => {
      if (layer.getVisible()) {
        baseLayers.getLayers().forEach((otherLayer) => {
          if (otherLayer !== layer) {
            otherLayer.setVisible(false);
          }
        });
      }
    });
  });

  document.getElementById('baseLayerSelect').addEventListener('change', (event) => {
    const selectedLayerTitle = event.target.value;
  
    baseLayers.getLayers().forEach((layer) => {
      layer.setVisible(layer.get('title') === selectedLayerTitle);
    });
  });

  
  map.addControl(scaleControl2);
// Llamar setupCSVHandlers después de que el mapa esté definido
setupCSVHandlers(map, displaySearchResults);

const minimap = new Map({
  target: 'minimapContainer',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: map.getView().getCenter(),
    zoom: map.getView().getZoom() - 2,
  }),
  controls: [],
});
// Sincroniza la vista del minimapa con el mapa principal
map.getView().on('change:center', () => {
  minimap.getView().setCenter(map.getView().getCenter());
});
map.getView().on('change:zoom', () => {
  minimap.getView().setZoom(map.getView().getZoom() - 2);
});

document.getElementById('toggleMinimapBtn').addEventListener('click', () => {
  const minimapContainer = document.getElementById('minimapContainer');
  if (minimapContainer.style.display === 'none' || minimapContainer.style.display === '') {
    minimapContainer.style.display = 'block'; // Mostrar el minimapa
    document.getElementById('toggleMinimapBtn').textContent = 'Cerrar Minimapa';
  } else {
    minimapContainer.style.display = 'none'; // Ocultar el minimapa
    document.getElementById('toggleMinimapBtn').textContent = 'Abrir Minimapa';
  }
});

//-------------------------------------------------------------------------
// ------------------------------ MODULOS ---------------------------------
//-------------------------------------------------------------------------

//-----------------------------------------------------------//
/*----------- CARGAR CSV Y FILTRAR NUEVOS DATOS------------ */
//---------------------------------------------------------//


// importar CSV datos
import { loadCSVData, filterCSVData, processCSVData } from './modules/csvHandler.js';
import { setupCSVHandlers } from './modules/csvHandler.js';

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

  // Mostrar resultados filtrados
  document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;
  displaySearchResults(filteredResults);

  // Limpiar y agregar puntos al mapa
  addFilteredPointsToMap(map, filteredResults);
});


//-----------------------------------------------------------//
/*--------------PUNTOS FILTRADOS -------------------------- */
//---------------------------------------------------------//


import { addFilteredPointsToMap } from './modules/csvHandler.js';
import { addFilteredPointsToMap1 } from './modules/mapMarkers.js';
addFilteredPointsToMap1(map, filteredResults);

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
  addFilteredPointsToMap(map, filteredResults, representedPoints);
});


// Función para cerrar el popup de información
console.log('Archivo main.js cargado.');
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM completamente cargado y analizado.');

  const closePopupButton = document.getElementById('closePopup1');
  const popupContainer = document.getElementById('popupContainer');

  if (!closePopupButton) {
    console.error('El botón con ID "closePopup1" no se encontró en el DOM. Verifica el ID.');
    return;
  }

  if (!popupContainer) {
    console.error('El contenedor con ID "popupContainer" no se encontró en el DOM. Verifica el ID.');
    return;
  }

  closePopupButton.addEventListener('click', function () {
    console.log('Botón de cerrar popup clicado.');
    popupContainer.style.display = 'none'; // Oculta el popup
  });

  console.log('Evento de cierre del popup configurado correctamente.');
});

//-----------------------------------------------------------//
/*-------------- AGREGAR NUEVOS DATOS --------------------- */
//---------------------------------------------------------//


import { showAddDataForm, hideAddDataForm, addNewData } from './modules/datos.js';

// Vincular el botón "Añadir Datos" al formulario
document.getElementById('addDataBtn').addEventListener('click', showAddDataForm);

// Vincular el botón "Cancelar" del formulario de añadir datos
document.getElementById('cancelAddDataBtn').addEventListener('click', hideAddDataForm);

// Vincular el botón "Guardar" del formulario de añadir datos
document.getElementById('saveDataBtn').addEventListener('click', () => addNewData(csvData));



//-----------------------------------------------------------//
/*-------------- INICIO SESION ---------------------------- */
//---------------------------------------------------------//


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
// Vincular el botón de registro al popup
document.getElementById('registerBtn').addEventListener('click', openRegisterPopup);


//-----------------------------------------------------------//
/*--------------SELECCIONAR ÁREA-------------------------- */
//---------------------------------------------------------//



// Función para habilitar el dibujo de un área
import { enableAreaSelection } from './modules/seleccionarea.js';
let selectionControl = null;

document.getElementById('selectAreaBtn').addEventListener('click', () => {
  if (selectionControl) {
    selectionControl.cancelSelection(); // cancelar si ya está activa
    selectionControl = null;
  } else {
    selectionControl = enableAreaSelection(map, representedPoints, filteredResults);
  }
});
// Vincular la funcionalidad de selección de área a un botón



//-----------------------------------------------------------//
/*------------------- SIDEBAR RESULTADOS ------------------ */
//---------------------------------------------------------//


//sidebar derecha resultados
import { displaySearchResults, closePopup, generateStatistics, updateSidebarWithSelectedPoints, toggleSidebarResults,updateSidebarButtonState, setupToggleButton } from './modules/sidebarResults.js';

document.addEventListener("DOMContentLoaded", () => {
  setupToggleButton();
});
let allData = []; // Variable global para almacenar los datos completos

// Cargar los datos CSV al inicio
loadCSVData().then(data => {
  allData = data; // Guardar los datos completos
  console.log('Datos cargados desde buscador.csv:', allData); // Depuración para verificar los datos

  // Generar estadísticas iniciales basadas en los datos completos
  generateStatistics(allData);
});

//document.getElementById('toggleResultsBtn').addEventListener('click', toggleResults);


//-----------------------------------------------------------//
/*--------------ROLES DE USUARIO-------------------------- */
//---------------------------------------------------------//


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

// Funcionalidad de los botones de zoom
window.addEventListener('load', () => {
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  if (zoomInBtn && zoomOutBtn) {
    zoomInBtn.addEventListener('click', () => {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.animate({ zoom: zoom + 1, duration: 250 }); // Zoom in con animación
      }
    });

    zoomOutBtn.addEventListener('click', () => {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.animate({ zoom: zoom - 1, duration: 250 }); // Zoom out con animación
      }
    });
  } else {
    console.error('Botones de zoom no encontrados en el DOM. Verifica que los IDs "zoomInBtn" y "zoomOutBtn" existen.');
  }
});
