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
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

searchBtn.addEventListener("click", () => {
  const query = searchBox.value.trim();
  if (query !== "") {
    searchLocation(query);
  }
});
// para buscar presionando enter:
searchBox.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});
async function searchLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      const lon = parseFloat(result.lon);
      const lat = parseFloat(result.lat);

      map.getView().animate({
        center: ol.proj.fromLonLat([lon, lat]),
        zoom: 15,
        duration: 1000
      });

      searchResults.innerHTML = `<p>Ubicación encontrada: ${result.display_name}</p>`;
    } else {
      searchResults.innerHTML = `<p>No se encontraron resultados.</p>`;
    }
  } catch (error) {
    console.error("Error al buscar la ubicación:", error);
    searchResults.innerHTML = `<p>Error al obtener datos.</p>`;
  }
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