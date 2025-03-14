/*-------------       1.LIBRERIAS       ---------------*/

import './style.css';
import "ol-layerswitcher/dist/ol-layerswitcher.css";
//librerias Mapa
import {Map, View} from 'ol';
import {OSM, TileWMS, Vector as VectorSource} from 'ol/source'; //teselado
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'; //vectorial
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import sync from 'ol-hashed'; // añade a la url el centro del mapa
import { Feature } from 'ol';
import { Style, Icon } from 'ol/style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Overlay from 'ol/Overlay';
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
//import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';


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

  
// variable controles extendida:
const extendControls = [
  OverviewMapControl,
  scaleControl2,
];


/*-------------       3.CARGAR CSV Y FILTRAR RESULTADOS      ---------------*/

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
    if (!window.csvData || window.csvData.length === 0) {
      console.error('Los datos CSV aún no están disponibles.');
      return;
    }
  

    /*-------------       4.MOSTRAR RESULTADOS EN MAPA       ---------------*/
    const filteredResults = window.csvData
    .filter(item => item.ubicacion && item.tematica && item.anio && item.palabraclave) // Filtrar objetos inválidos
    .filter(item => {
      const ubicacion = item.ubicacion.toLowerCase();
      const tematica = item.tematica.toLowerCase();
      const descripcion = item.palabraclave ? item.palabraclave.toLowerCase() : '';
  
      const matchesLocation = ubicacion.includes(location);
      const matchesTheme = theme ? tematica === theme : true;
      const matchesYear = year ? item.anio === year : true;
      const matchesKeyword = keyword ? descripcion.includes(keyword) : true;
  
      return matchesLocation && matchesTheme && matchesYear && matchesKeyword;
    });
  });

  
// Filtrar los datos como antes (basado en las entradas del usuario)
document.getElementById('searchBtn').addEventListener('click', function() {
  if (!window.csvData || window.csvData.length === 0) {
    console.error('Los datos CSV aún no están disponibles o están vacíos.');
    return;
  }

  const location = document.getElementById('searchLocation').value.toLowerCase();
  const theme = document.getElementById('themeSelect').value.toLowerCase();
  const year = document.getElementById('yearFilter').value;
  const keyword = document.getElementById('searchBox').value.toLowerCase();

  const filteredResults = window.csvData.filter(item => {
    // Verificar que el objeto tenga las propiedades necesarias
    if (!item.ubicacion || !item.tematica || !item.anio || !item.palabraclave) {
      console.warn('Objeto inválido encontrado y omitido:', item);
      return false;
    }

    // Convertir valores a minúsculas y asegurarse de que existen
    const ubicacion = item.ubicacion ? item.ubicacion.toLowerCase() : '';
    const tematica = item.tematica ? item.tematica.toLowerCase() : '';
    const descripcion = item.palabraclave ? item.palabraclave.toLowerCase() : '';

    const matchesLocation = ubicacion.includes(location);
    const matchesTheme = theme ? tematica === theme : true;
    const matchesYear = year ? item.anio === year : true;
    const matchesKeyword = keyword ? descripcion.includes(keyword) : true;

    return matchesLocation && matchesTheme && matchesYear && matchesKeyword;
  });

  // Mostrar los resultados filtrados
  document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;
  displaySearchResults(filteredResults);


  /*-------------       5.CLICAR PUNTOS MAPA Y DAR INFO      ---------------*/
  // Agregar puntos filtrados al mapa
  addFilteredPointsToMap(filteredResults);
  

// Función para agregar los puntos filtrados al mapa
function addFilteredPointsToMap(filteredResults) {
  // Crear una fuente vectorial para los puntos filtrados
  const vectorSource = new VectorSource();

// Crear el Overlay que actuará como el popup
const popupContainer = document.getElementById('popupContainer');
const popupResults = document.getElementById('popupInfo');
const popupContent = document.getElementById('popupInfoContent');
const overlay = new Overlay({
  element: popupContainer, // Elemento del popup
  autoPan: true, // Para que el mapa se mueva para mostrar el popup
  autoPanAnimation: {
    duration: 250, // Duración de la animación de desplazamiento
  },
});
map.addOverlay(overlay); // Añadir el overlay al mapa

  // Iterar sobre los resultados filtrados para agregar puntos al vectorSource
  filteredResults.forEach(item => {
    const lat = parseFloat(item.Latitud); // Obtener latitud
    const lon = parseFloat(item.Longitud); // Obtener longitud

    if (!isNaN(lat) && !isNaN(lon)) {
      // Crear un punto con las coordenadas
      const point = new ol.Feature({
        geometry: new ol.geom.Point(fromLonLat([lon, lat])),
        name: item.Nombre,
        descripcion: item.descripcion,
        link: item.link,
      });

      // Establecer el estilo del punto (marcador)
      point.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // ícono de marcador
          scale: 0.05,
        })
      }));
      console.log(filteredResults);
      
      // Añadir el punto al vectorSource
      vectorSource.addFeature(point);
    }
  });

  // Crear una capa vectorial
  const vectorLayer = new VectorLayer({
    source: vectorSource
  });


  map.addLayer(vectorLayer);

  // Evento de selección de puntos
  const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.click, // Evento click en el mapa
  });

  selectInteraction.on('select', function (event) {
    const selectedFeature = event.selected[0]; // Obtiene la característica seleccionada

    if (selectedFeature) {
      const name = selectedFeature.get('name');
      const description = selectedFeature.get('descripcion');
      const link = selectedFeature.get('link');

      // Muestra la información en el popup
      popupContent.innerHTML = `
        <h3>${name}</h3>
        <p>${description}</p>
        <a href="${link}" target="_blank">Más información</a>
      `;
      popupContainer.style.display = 'flex';
      overlay.setPosition(selectedFeature.getGeometry().getCoordinates());
    }
  });

  map.addInteraction(selectInteraction); // Agregar la interacción de selección al mapa
}
/*      ___________________
        || INFO AL CLICAR||
        ||____POPUPS_____||      
______________________________________________________________________________________________*/
// Función para mostrar los resultados de búsqueda en un popup
// Función para abrir el popup
function openPopup() {
  document.getElementById('popupContainer').style.display = 'flex'; // Mostramos el contenedor del popup
}
// Función para cerrar el popup
function closePopup() {
  const popupContainer = document.getElementById('popupContainer');
  if (popupContainer) {
    popupContainer.style.display = 'none'; // Ocultar el contenedor del popup
  }
}
    
// Cerrar el popup cuando se haga clic en la "X"
document.querySelector('.close-btn').addEventListener('click', function() {
  closePopup('popupInfo'); // Aquí se llama a la función closePopup
});
  
 // Cerrar el popup si se hace clic fuera de él
window.addEventListener('click', function(event) {
  const popup = document.getElementById('popupResults');
  if (event.target === popup) {
    closePopup(); // llamar a closePopup si se hace clic fuera del popup
  }
  });
});

function displaySearchResults(results) {
    const popupContainer = document.getElementById('popupContainer');
    const popupResults = document.getElementById('popupResults');
    const popupContent = document.getElementById('popupResultsContent');

    popupContent.innerHTML = ''; // Limpiar contenido previo

    if (results.length === 0) {
        popupContent.innerHTML = '<p>No se encontraron resultados.</p>';
    } else {
        results.forEach(result => {
            const div = document.createElement('div');
            div.style.marginBottom = "15px";
            div.style.display = "flex"; // Usamos flex para alinear la imagen y el texto en una fila
            div.style.alignItems = "center"; // Alineamos verticalmente la imagen y el texto

            const imageContainer = document.createElement('div');
            imageContainer.style.marginRight = "15px"; // Espacio entre la imagen y el texto

            // Verificar si hay una imagen en el enlace de la web
            if (result.link) {
              // Crear un contenedor de imagen
              const img = document.createElement('img');
              img.src = `https://www.google.com/s2/favicons?domain=${new URL(result.link).hostname}`; // Favicon de la web
              img.alt = `Imagen de ${result.Nombre}`;
              img.style.width = "50px"; // Ancho de la imagen
              img.style.height = "50px"; // Alto de la imagen
              img.style.borderRadius = "50%"; // Forma circular

              // Añadir la imagen al contenedor
              imageContainer.appendChild(img);
            }

            // Crear el contenedor para el texto
            const textContainer = document.createElement('div');
            textContainer.style.display = "flex";
            textContainer.style.flexDirection = "column"; // Aseguramos que el texto esté alineado verticalmente

            const title = document.createElement('h3');
            title.textContent = result.Nombre || "Sin nombre";

            const details = document.createElement('p');
            details.innerHTML = `
            <i class="fas fa-map-marker-alt"></i> Ubicación: ${result.ubicacion} |
            <i class="fas fa-theater-masks"></i> Temática: ${result.tematica} |
            <i class="fas fa-calendar-alt"></i> Año: ${result.anio}`;

             // Descripción antes del enlace
            const description = document.createElement('p');
            description.textContent = result.descripcion || "No hay descripción disponible.";

            const link = document.createElement('a');
            if (result.link) {
                link.href = result.link;
                link.textContent = "🔗 Link";
                link.target = "_blank";
                link.style.display = "block";
                link.style.marginTop = "5px";
            } else {
                link.textContent = "🔗 No hay enlace disponible";
                link.style.color = "gray";
                link.style.cursor = "default";
            }
            
            div.appendChild(title);
            div.appendChild(details);
            div.appendChild(description);
            div.appendChild(link);
            popupContent.appendChild(div);

            // Añadir la imagen y el texto al div principal
            div.appendChild(imageContainer); // Imagen a la izquierda
            div.appendChild(textContainer); // Texto a la derecha
            popupContent.appendChild(div);
        });
    }

  
    popupContainer.style.display = 'flex'; // Mostrar ambos popups juntos
    popupInfo.style.display = 'block';

    generateStatistics(results); // Generar estadísticas
}
/*      _______________
        || RESULTADOS||
        ||__GRAFICOS_||      
______________________________________________________________________________________________*/
function closePopup(popupId) {
  document.getElementById(popupId).style.display = 'none';

  // Si se cierra uno, cerramos ambos
  if (popupId === 'popupResults' || popupId === 'popupStats') {
      document.getElementById('popupContainer').style.display = 'none';
  }
}

// Cerrar los popups al hacer clic fuera
window.addEventListener('click', function(event) {
  const popupContainer = document.getElementById('popupContainer');
  if (event.target === popupContainer) {
      closePopup('popupResults');
      closePopup('popupStats');
  }
});

function generateStatistics(results) {
  const popupStats = document.getElementById('popupStats');
  popupStats.style.display = 'block';

  // Conteo de temáticas y años
  let themesCount = {};
  let yearsCount = {};
  let selectedTheme = document.getElementById('themeSelect').value.toLowerCase();

  // Filtrar los resultados para que solo incluyan la temática seleccionada
  results.forEach(result => {
    if (result.tematica) {
      themesCount[result.tematica] = (themesCount[result.tematica] || 0) + 1;
    }
    if (result.anio) {
      yearsCount[result.anio] = (yearsCount[result.anio] || 0) + 1;
    }
  });

  const themeLabels = Object.keys(themesCount);
  const themeValues = Object.values(themesCount);

  // Total de proyectos de todas las temáticas (solo los resultados filtrados)
  const totalProjects = themeValues.reduce((sum, value) => sum + value, 0); 

  const yearLabels = Object.keys(yearsCount);
  const yearValues = Object.values(yearsCount);

  const ctxPie = document.getElementById('pieChart').getContext('2d');
  const ctxBar = document.getElementById('barChart').getContext('2d');

  // Si ya existe una instancia de los gráficos, la destruimos antes de crear una nueva
  if (window.pieChart instanceof Chart) {
    window.pieChart.destroy();
  }
  if (window.barChart instanceof Chart) {
    window.barChart.destroy();
  }

  // Gráfico de Pastel (Quesito) para Temáticas
  window.pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: themeLabels,
      datasets: [{
        label: 'Proyectos por Temática',
        data: themeValues,
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33A1'], // colores diferentes
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              // Calcular el porcentaje y formatearlo con respecto al total de proyectos
              const percentage = ((tooltipItem.raw / totalProjects) * 100).toFixed(2);
              return tooltipItem.label + ': ' + percentage + '%'; // Muestra el porcentaje
            }
          }
        },
        legend: {
          position: 'top',
        },
      },
    }
  });

  // Filtrar los resultados por temática seleccionada
  const filteredResults = results.filter(result => result.tematica.toLowerCase() === selectedTheme);

  // Gráfico de Barras para los Años dentro de la Temática Seleccionada
  let filteredYearsCount = {};
  filteredResults.forEach(result => {
    if (result.anio) {
      filteredYearsCount[result.anio] = (filteredYearsCount[result.anio] || 0) + 1;
    }
  });

  const filteredYearLabels = Object.keys(filteredYearsCount);
  const filteredYearValues = Object.values(filteredYearsCount);

  // Si no hay datos para la temática seleccionada, mostrar un mensaje
  if (filteredYearLabels.length === 0) {
    alert(`No hay proyectos en el año para la temática: ${selectedTheme}`);
  } else {
    window.barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: filteredYearLabels,
        datasets: [{
          label: 'Proyectos por Año',
          data: filteredYearValues,
          backgroundColor: '#3357FF',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

/*-------------       7.AREA DE SELECCION      ---------------*/
// Variable global para el vectorLayer que contiene el área seleccionada
let drawInteraction = null;

// Función para activar el control de dibujo
function activateDrawing() {
  // Crear una nueva capa vectorial para la selección
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  // Crear el control de dibujo para el polígono
  drawInteraction = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Polygon',
  });

  // Agregar el control de dibujo al mapa
  map.addInteraction(drawInteraction);

  // Cuando se complete el dibujo, capturamos el polígono
  drawInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const geometry = feature.getGeometry();
    const coordinates = geometry.getCoordinates();

    // Llamar a una función para filtrar los puntos de acuerdo con el área seleccionada
    filterResultsByArea(coordinates);
  });
}

// Función para detener el control de dibujo
function deactivateDrawing() {
  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
    drawInteraction = null;
  }
}

// Evento del botón para activar la selección del área
document.getElementById('selectAreaBtn').addEventListener('click', function () {
  if (drawInteraction) {
    deactivateDrawing(); // Desactivar el dibujo si ya está activado
  } else {
    activateDrawing(); // Activar el dibujo
  }
});
// Variable para almacenar la capa que contendrá los puntos filtrados
let filteredPointsLayer = null;

// Función para filtrar los resultados dentro del área seleccionada
function filterResultsByArea(areaCoordinates) {
  // Convertir las coordenadas del área a un formato adecuado
  const polygon = new ol.geom.Polygon([areaCoordinates]);

  // Asegurarse de que las coordenadas del polígono estén en el mismo sistema de coordenadas que el mapa
  polygon.transform('EPSG:4326', 'EPSG:3857');  // Transformar de EPSG:4326 a EPSG:3857

  // Filtrar los resultados de CSV (o cualquier fuente de datos) que estén dentro del área
  const filteredResults = window.csvData.filter(item => {
    const lat = parseFloat(item.Latitud);  // Obtener la latitud
    const lon = parseFloat(item.Longitud); // Obtener la longitud

    // Validar si las coordenadas son válidas
    if (isNaN(lat) || isNaN(lon)) return false;

    // Mostrar las coordenadas para depuración
    console.log('Punto a verificar:', lat, lon);

    // Convertir las coordenadas del punto a EPSG:3857
    const point = new ol.geom.Point(ol.proj.fromLonLat([lon, lat]));

    // Verificar si el punto está dentro del polígono
    const insidePolygon = polygon.intersectsCoordinate(point.getCoordinates());

    // Mostrar si el punto está dentro del polígono para depuración
    console.log('Está el punto dentro del polígono?', insidePolygon);

    return insidePolygon;
  });

  // Mostrar los resultados filtrados en la consola (para depuración)
  console.log('Puntos dentro del área:', filteredResults);

  // Mostrar los resultados filtrados en la interfaz
  displaySearchResults(filteredResults);
  
  // Agregar los puntos filtrados al mapa
  addFilteredPointsToMap(filteredResults);
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

sync(map);