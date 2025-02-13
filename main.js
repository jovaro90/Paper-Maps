/*      _______________
        || LIBRERIAS ||
        ||_____1_____||      
______________________________________________________________________________________________*/
// Librerias base
import './style.css';

//librerias Mapa
import {Map, View} from 'ol';
import {OSM, TileWMS, Vector as VectorSource} from 'ol/source'; //teselado
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'; //vectorial
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import sync from 'ol-hashed'; // añade a la url el centro del mapa

//librerias Controles
import { defaults as defaultControls} from "ol/Control";
import { OverviewMap } from 'ol/Control';
import { ScaleLine } from 'ol/Control';
import { MousePosition } from 'ol/Control';
import { ZoomToExtent } from 'ol/Control';
import { FullScreen } from 'ol/Control';
import { Control } from 'ol/Control';

// librerias coordenadas puntero
import { format } from 'ol/coordinate'; 

import { transformExtent } from 'ol/proj';

import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import Overlay from 'ol/Overlay';

//import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';



/*      _______________
        || CONTROLES ||
        ||_____2_____||      
______________________________________________________________________________________________*/
// 2.1 Titulo
const mapTitle = document.createElement('div');
mapTitle.className = 'map-title';
mapTitle.innerHTML = 'Paper Maps'; 

const mapContainer = document.getElementById('map');
mapContainer.appendChild(mapTitle);

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

  
// variable controles extendida:
const extendControls = [
  OverviewMapControl,
  //FullScreenControl,
  //zoomToLaCoruñaControl,
  //MousePositionControl,
  scaleControl2,
  //new infoControl (),
];


/*      _______________
        || Barra de  ||
        ||_Busqueda__||      
______________________________________________________________________________________________*/
// Cargar el archivo CSV desde el directorio público
fetch('/buscador.csv')
  .then(response => response.text())  // Obtener el archivo como texto
  .then(csvText => {
    // Usar PapaParse para convertir el texto CSV a un array de objetos JSON
    Papa.parse(csvText, {
      header: true,  // el CSV tiene cabecera
      complete: function(results) {
        console.log('Datos CSV:', results.data);
        // Almacenar los datos CSV en una variable global o en el estado
        window.csvData = results.data;
      }
    });
  })
  .catch(error => {
    console.error('Error al cargar el archivo CSV:', error);
  });

// Filtrar los datos como antes (basado en las entradas del usuario)
document.getElementById('searchBtn').addEventListener('click', function() {
  const location = document.getElementById('searchLocation').value.toLowerCase();
  const theme = document.getElementById('themeSelect').value.toLowerCase();
  const year = document.getElementById('yearFilter').value;
  const keyword = document.getElementById('searchBox').value.toLowerCase();
  
  const filteredResults = window.csvData.filter(item => {
    const matchesLocation = item.ubicacion.toLowerCase().includes(location);
    const matchesTheme = item.tematica.toLowerCase() === theme;
    const matchesYear = year ? item.anio === year : true;
    const matchesKeyword = keyword ? item.descripcion.toLowerCase().includes(keyword) : true;
    
    return matchesLocation && matchesTheme && matchesYear && matchesKeyword;
  });

  // Mostrar los resultados filtrados
  document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;
  displaySearchResults(filteredResults);
});

function displaySearchResults(results) {
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

  results.forEach(result => {
    const div = document.createElement('div');
    div.textContent = `Ubicación: ${result.ubicacion}, Temática: ${result.tematica}, Año: ${result.anio}`;
    resultsDiv.appendChild(div);
  });
}
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

    
  // Agregar LayerSwitcher
const layerSwitcher = new LayerSwitcher({
    tipLabel: "Capas", // Tooltip al pasar el mouse
    groupSelectStyle: "group", // Muestra solo una capa base a la vez
  });

map.addControl(layerSwitcher);

// Agregar documento vinculado a un punto
const feature = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([-74.006, 40.7128])),
  name: "Documento",
  documentURL: "https://ejemplo.com/documento.pdf"
});

const vectorSource = new ol.source.Vector({
  features: [feature]
});

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Ícono del marcador
      scale: 0.05
    })
  })
});

map.addLayer(vectorLayer);
sync(map);