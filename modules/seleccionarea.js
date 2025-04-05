import { updateSidebarWithSelectedPoints } from './sidebarResults.js';
import { fromLonLat } from 'ol/proj';
import { Draw } from 'ol/interaction';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { containsCoordinate } from 'ol/extent';

export function enableAreaSelection(map, representedPoints, filteredResults) {
  const drawInteraction = new Draw({
    source: new ol.source.Vector(),
    type: 'Polygon',
  });

  map.addInteraction(drawInteraction);

  drawInteraction.on('drawend', function (event) {
    const areaPolygon = event.feature.getGeometry();
    console.log('Coordenadas del polígono:', areaPolygon.getCoordinates());

    // Verificar puntos representados
    console.log('Puntos representados:', representedPoints);

    // Filtrar los puntos dentro del área seleccionada
    const pointsInArea = representedPoints.filter(point => {
      const pointCoordinates = point.getGeometry().getCoordinates();
      return areaPolygon.intersectsCoordinate(pointCoordinates);
    });

    console.log('Puntos seleccionados dentro del área:', pointsInArea);

    if (pointsInArea.length > 0) {
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

      // Actualizar la barra lateral con los puntos seleccionados
      updateSidebarWithSelectedPoints(pointsInArea);
    } else {
      console.warn('No se encontraron puntos dentro del área seleccionada.');
    }

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

    console.log('Resultados filtrados actualizados:', filteredResults);

    // Eliminar la interacción de dibujo después de completar el área
    map.removeInteraction(drawInteraction);
  });
}