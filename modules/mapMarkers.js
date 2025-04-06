import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import 'ol/ol.css';

export function addFilteredPointsToMap(map, filteredResults) {
    if (!map || !Array.isArray(filteredResults)) {
        console.error('Parámetros inválidos para addFilteredPointsToMap.');
        return;
    }

    console.log('Datos recibidos para agregar al mapa:', filteredResults);

    // Crear una fuente vectorial para los puntos filtrados
    let vectorSource = map.getLayers().getArray().find(layer => layer.get('name') === 'filteredPointsLayer')?.getSource();

    if (!vectorSource) {
        vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            visible: true, // Asegúrate de que la capa sea visible
            name: 'filteredPointsLayer', // Nombre para identificar la capa
        });
        map.addLayer(vectorLayer);
    } else {
        // Limpiar los puntos anteriores
        vectorSource.clear();
    }

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

    if (!popupContainer || !popupContent) {
        console.error("El contenedor del popup o su contenido no existen en el DOM.");
        return;
    }

    map.addOverlay(overlay);

    filteredResults.forEach(item => {
        console.log(`Procesando punto:`, item);

        const lat = parseFloat(item.latitud || item.Latitud);
        const lon = parseFloat(item.longitud || item.Longitud);

        if (!isNaN(lat) && !isNaN(lon)) {
            console.log(`Coordenadas válidas: ${lat}, ${lon}`);
            const point = new ol.Feature({
                geometry: new Point(fromLonLat([lon, lat])),
                name: item.nombre || item.Nombre,
                descripcion: item.descripcion || 'Sin descripción',
                link: item.link || '#',
            });

            // Estilo del punto como un círculo
            point.setStyle(new Style({
                image: new CircleStyle({
                    radius: 6, // Radio del círculo
                    fill: new Fill({
                        color: '#4CAF50', // Color de relleno del círculo
                    }),
                    stroke: new Stroke({
                        color: '#ffffff', // Color del borde del círculo
                        width: 2, // Ancho del borde
                    }),
                }),
            }));

            vectorSource.addFeature(point);
        } else {
            console.warn(`Coordenadas inválidas para el punto: ${JSON.stringify(item)}`);
        }
    });

    console.log('Puntos actualizados en la capa vectorial.');

    // Evento de selección de puntos
    const selectInteraction = new Select({
        condition: click,
    });

    selectInteraction.on('select', function (event) {
        console.log('Evento de selección activado:', event.selected);

        const selectedFeature = event.selected[0];

        if (selectedFeature) {
            console.log('Punto seleccionado:', selectedFeature.get('name'));
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
        } else {
            console.log('Ningún punto seleccionado.');
        }
    });
}

  

    map.addInteraction(selectInteraction);

