import { updateSidebarWithSelectedPoints } from './sidebarResults.js';
import { fromLonLat } from 'ol/proj';
import { Draw } from 'ol/interaction';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { containsCoordinate } from 'ol/extent';
import { setSelectingArea } from './selectionState.js';
import { displaySearchResults } from './sidebarResults.js';
import Select from 'ol/interaction/Select';

export function enableAreaSelection(map, representedPoints, filteredResults) {
  setSelectingArea(true);

  const drawInteraction = new Draw({
    source: new ol.source.Vector(),
    type: 'Polygon',
  });

  const mapViewport = map.getViewport();

  const blockClickHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const cancelHandler = (event) => {
    event.preventDefault();
    cleanup();
  };

  const cleanup = () => {
    map.removeInteraction(drawInteraction);
    mapViewport.removeEventListener('click', blockClickHandler, true);
    mapViewport.removeEventListener('contextmenu', cancelHandler, true);
    setSelectingArea(false);

    // Reactivar la interacción de selección después de la selección de área
    selectInteraction.setActive(true);
  };

  // Desactivar la interacción de selección mientras se dibuja el área
  const selectInteraction = map.getInteractions().getArray().find(interaction => interaction instanceof Select);
  if (selectInteraction) {
    selectInteraction.setActive(false);
  }

  mapViewport.addEventListener('click', blockClickHandler, true);
  mapViewport.addEventListener('contextmenu', cancelHandler, true);

  map.addInteraction(drawInteraction);

  drawInteraction.on('drawend', function (event) {
    const areaPolygon = event.feature.getGeometry();
    console.log('Coordenadas del polígono:', areaPolygon.getCoordinates());

    cleanup();

    const pointsInArea = representedPoints.filter(point => {
      const pointCoordinates = point.getGeometry().getCoordinates();
      return areaPolygon.intersectsCoordinate(pointCoordinates);
    });

    console.log('Puntos seleccionados dentro del área:', pointsInArea);

    if (pointsInArea.length > 0) {
      pointsInArea.forEach(point => {
        point.setStyle(new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: '#FF9800' }),
            stroke: new Stroke({ color: '#000000', width: 2 }),
          }),
        }));
      });

      updateSidebarWithSelectedPoints(pointsInArea);
    } else {
      console.warn('No se encontraron puntos dentro del área seleccionada.');
    }

    // Filtrar y adaptar los resultados
    const selectedResults = filteredResults.filter(item => {
      const pointCoordinates = fromLonLat([parseFloat(item.Longitud), parseFloat(item.Latitud)]);
      return areaPolygon.intersectsCoordinate(pointCoordinates);
    }).map(item => ({
      Nombre: item.Nombre || 'Sin nombre',
      ubicacion: `${item.ubicacion || 'Ubicación no disponible'}`,
      tematica: item.tematica || 'No disponible',
      anio: item.anio || 'No disponible',
      usuario: item.usuario || 'No disponible',
      descripcion: item.descripcion || 'Sin descripción',
      link: item.link || '#'
    }));

    console.log('Resultados filtrados actualizados:', selectedResults);

    // Mostrar los resultados en el popup usando displaySearchResults
    displaySearchResults(selectedResults);
  });

  drawInteraction.on('change:active', function () {
    if (!drawInteraction.getActive()) {
      cleanup();
    }
  });

  return {
    cancelSelection: cleanup
  };
}