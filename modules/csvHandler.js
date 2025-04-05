/*import Papa from 'papaparse';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import { Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';


export async function loadCSVData() {
  try {
    const response = await fetch('/buscador.csv');
    const csvText = await response.text();
    const parsedData = Papa.parse(csvText, {
      header: true, // Indica que el archivo tiene un encabezado
      delimiter: ';', // Especifica el delimitador como punto y coma
      skipEmptyLines: true, // Ignora líneas vacías
    });
    console.log('Datos CSV cargados:', parsedData.data); // Depuración
    return parsedData.data;
  } catch (error) {
    console.error('Error al cargar el archivo CSV:', error);
    return [];
  }
}

export function validateCSVObject(obj) {
  // Verificar que los campos obligatorios existan y no estén vacíos
  const requiredFields = ['Nombre', 'ubicacion', 'tematica', 'anio', 'Latitud', 'Longitud', 'link'];
  for (const field of requiredFields) {
      if (!obj[field] || obj[field].trim() === '') {
          console.warn(`Campo faltante o vacío: ${field} en el objeto`, obj);
          return false; // Rechazar el objeto
      }
  }

  // Validar que las coordenadas sean números válidos
  const lat = parseFloat(obj.Latitud);
  const lon = parseFloat(obj.Longitud);
  if (isNaN(lat) || isNaN(lon)) {
      console.warn(`Coordenadas inválidas en el objeto`, obj);
      return false; // Rechazar el objeto
  }

  // Permitir que el campo "descripcion" esté vacío, pero no nulo
  if (obj.descripcion === undefined) {
      console.warn(`Campo "descripcion" faltante en el objeto`, obj);
      return false; // Rechazar el objeto si falta completamente
  }

  return true; // Objeto válido
}

export function processCSVData(data) {
  const validData = [];
  data.forEach(obj => {
      if (validateCSVObject(obj)) {
          validData.push(obj);
      } else {
          console.warn('Objeto inválido encontrado y omitido:', obj);
      }
  });
  return validData;
}

export function filterCSVData(data, location, theme, year, keyword) {
    return data.filter(item => {
        const matchesLocation = location ? item.ubicacion.toLowerCase().includes(location) : true;
        const matchesTheme = theme ? item.tematica.toLowerCase().includes(theme) : true;
        const matchesYear = year ? item.anio === year : true;
        const matchesKeyword = keyword ? item.palabraclave.toLowerCase().includes(keyword) : true;

        return matchesLocation && matchesTheme && matchesYear && matchesKeyword;
    });
}

export function setupCSVHandlers(map, displaySearchResults) {
  let csvData = [];
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
  
    console.log('Valores de entrada:', { location, theme, year, keyword }); // Depuración
  
    const filteredResults = filterCSVData(csvData, location, theme, year, keyword);
  
    document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;
    displaySearchResults(filteredResults);
  
    addFilteredPointsToMap(map, filteredResults);
  });
}

export function addFilteredPointsToMap(map, filteredResults, representedPoints) {
  const vectorSource = new VectorSource();
 /* representedPoints.length = 0; */// Reiniciar la lista de puntos representados 
 
 /*
 representedPoints.length = 0;
 representedPoints = [];
 representedPoints.splice(0, representedPoints.length);

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

  representedPoints =[];
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

  // Agregar la capa al mapa
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
}*/

import Papa from 'papaparse';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature'; 
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

export async function loadCSVData() {
  try {
    const response = await fetch('/buscador.csv');
    const csvText = await response.text();
    const parsedData = Papa.parse(csvText, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });
    console.log('✅ Datos CSV cargados:', parsedData.data);
    return parsedData.data;
  } catch (error) {
    console.error('❌ Error al cargar el archivo CSV:', error);
    return [];
  }
}

export function validateCSVObject(obj) {
  const requiredFields = ['Nombre', 'ubicacion', 'tematica', 'anio', 'Latitud', 'Longitud', 'link'];

  for (const field of requiredFields) {
    if (!obj[field] || obj[field].trim() === '') {
      console.warn(`⚠️ Campo faltante o vacío: ${field} en`, obj);
      return false;
    }
  }

  const lat = parseFloat(obj.Latitud);
  const lon = parseFloat(obj.Longitud);
  if (isNaN(lat) || isNaN(lon)) {
    console.warn('⚠️ Coordenadas inválidas en', obj);
    return false;
  }

  if (obj.descripcion === undefined) {
    console.warn('⚠️ Campo "descripcion" faltante en', obj);
    return false;
  }

  return true;
}

export function processCSVData(data) {
  return data.filter(validateCSVObject);
}

export function filterCSVData(data, location, theme, year, keyword) {
  return data.filter(item => {
    const matchesLocation = location ? item.ubicacion?.toLowerCase().includes(location) : true;
    const matchesTheme = theme ? item.tematica?.toLowerCase().includes(theme) : true;
    const matchesYear = year ? item.anio === year : true;
    const matchesKeyword = keyword ? item.palabraclave?.toLowerCase().includes(keyword) : true;

    return matchesLocation && matchesTheme && matchesYear && matchesKeyword;
  });
}

export function setupCSVHandlers(map, displaySearchResults) {
  let csvData = [];
  let representedPoints = []; // Inicializar el array vacío

  // Cargar los datos CSV de forma asíncrona
  loadCSVData().then(data => {
    csvData = data;
  });

  // Configuración del evento de búsqueda
  document.getElementById('searchBtn').addEventListener('click', function () {
    if (!csvData || csvData.length === 0) {
      console.error('⚠️ Los datos CSV aún no están disponibles o están vacíos.');
      return;
    }

    // Obtener los valores de los campos de búsqueda
    const location = document.getElementById('searchLocation').value.toLowerCase();
    const theme = document.getElementById('themeSelect').value.toLowerCase();
    const year = document.getElementById('yearFilter').value;
    const keyword = document.getElementById('searchBox').value.toLowerCase();

    console.log('🔍 Valores de búsqueda:', { location, theme, year, keyword });

    // Filtrar los resultados con base en los valores proporcionados
    const filteredResults = filterCSVData(csvData, location, theme, year, keyword);
    document.getElementById('resultCount').textContent = `Resultados encontrados: ${filteredResults.length}`;

    // Si se encuentran resultados, mostrarlos y agregar los puntos al mapa
    if (filteredResults.length > 0) {
      displaySearchResults(filteredResults); // Mostrar resultados de búsqueda
      representedPoints = []; // Reiniciar el array correctamente
      addFilteredPointsToMap(map, filteredResults, representedPoints); // Añadir puntos al mapa
    }
  });
}

export function addFilteredPointsToMap(map, filteredResults, representedPoints) {
  // Verificamos si `representedPoints` es un array válido
  if (!Array.isArray(representedPoints)) {
    console.error('⚠️ El parámetro `representedPoints` no es un array válido. Reinicializando...');
    // Aquí lo forzamos a ser un array vacío en caso de que no lo sea
    representedPoints = [];
  }

  // Limpiar el array de puntos representados
  representedPoints.length = 0;

  const vectorSource = new VectorSource();

  // Limpiar el array de puntos representados
  representedPoints.length = 0;

  // Eliminar capas anteriores antes de agregar nuevas
  map.getLayers().getArray()
    .filter(layer => layer instanceof VectorLayer)
    .forEach(layer => map.removeLayer(layer));

  // Crear y agregar nuevo overlay (popup)
  const popupContainer = document.getElementById('popupContainer');
  const popupContent = document.getElementById('popupInfoContent');
  const overlay = new Overlay({
    element: popupContainer,
    autoPan: true,
    autoPanAnimation: { duration: 250 },
  });

  map.addOverlay(overlay);

  // Agregar funcionalidad para cerrar popup
  const closePopupButton = document.getElementById('closePopupButton');
  if (closePopupButton) {
    closePopupButton.addEventListener('click', () => {
      popupContainer.style.display = 'none';
      overlay.setPosition(undefined);
    });
  }

  // Agregar puntos al mapa y al array `representedPoints`
  filteredResults.forEach(item => {
    const lat = parseFloat(item.Latitud);
    const lon = parseFloat(item.Longitud);

    if (!isNaN(lat) && !isNaN(lon)) {
      const point = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        name: item.Nombre,
        descripcion: item.descripcion || 'Sin descripción',
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
      representedPoints.push(point); // Agregar el punto al array `representedPoints`
    }
  });

  // Crear y agregar capa vectorial al mapa
  const vectorLayer = new VectorLayer({ source: vectorSource });
  map.addLayer(vectorLayer);

  // Agregar interacción de selección para mostrar popups
  const selectInteraction = new Select({ condition: click });

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

  // Depuración: Verificar los puntos representados
  console.log('Puntos representados actualizados:', representedPoints);
}