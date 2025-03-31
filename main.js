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
//librerias Controles
import { defaults as defaultControls, MousePosition} from "ol/Control";
import { OverviewMap } from 'ol/Control';
import { ScaleLine } from 'ol/Control';
//import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';


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



//-----------------------------------------------------------//
/*---------------------- CAPAS ---------------------------- */
//---------------------------------------------------------//


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

//-------------------------------------------------------------------------
// ------------------------------ MODULOS ---------------------------------
//-------------------------------------------------------------------------


//-----------------------------------------------------------//
/*----------- CARGAR CSV Y FILTRAR NUEVOS DATOS------------ */
//---------------------------------------------------------//


// importar CSV datos
import { loadCSVData, filterCSVData, processCSVData } from './modules/csvHandler.js';

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
});


//-----------------------------------------------------------//
/*--------------PUNTOS FILTRADOS -------------------------- */
//---------------------------------------------------------//


import { addFilteredPointsToMap } from './modules/csvHandler.js';

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
  addFilteredPointsToMap(filteredResults, map, representedPoints);
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
  getUsername,
  
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
  const username = getUsername();
};
// Vincular el botón de registro al popup
document.getElementById('registerBtn').addEventListener('click', openRegisterPopup);

document.getElementById('someButton').addEventListener('click', function () {
  const username = getUsername();
  console.log('Nombre de usuario:', username);
  // Realiza alguna acción con el nombre de usuario
});


//-----------------------------------------------------------//
/*--------------SELECCIONAR ÁREA-------------------------- */
//---------------------------------------------------------//



// Función para habilitar el dibujo de un área
import { enableAreaSelection } from './modules/seleccionarea.js';

// Vincular la funcionalidad de selección de área a un botón
document.getElementById('selectAreaBtn').addEventListener('click', function () {
  enableAreaSelection(map, representedPoints, filteredResults);
});



//-----------------------------------------------------------//
/*------------------- SIDEBAR RESULTADOS ------------------ */
//---------------------------------------------------------//


//sidebar derecha resultados
import { displaySearchResults, closePopup, generateStatistics, } from './modules/sidebarResults.js';

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
