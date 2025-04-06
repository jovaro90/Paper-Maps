import { fromLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import 'ol/ol.css';

export function addFilteredPointsToMap1(map, filteredResults) {
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
            visible: true,
            name: 'filteredPointsLayer', 
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
                nombre: item.nombre || item.Nombre || 'Sin nombre',
                ubicacion: item.ubicacion || 'Ubicación no disponible',
                tematica: item.tematica || 'No disponible',
                anio: item.anio || 'No disponible',
                usuario: item.usuario || 'No disponible',
                descripcion: item.descripcion || 'Sin descripción',
                link: item.link || '#',
            });
    
            // Estilo del punto como un círculo
            point.setStyle(new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({ color: '#4CAF50' }),
                    stroke: new Stroke({ color: '#ffffff', width: 2 }),
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
            console.log('Propiedades del punto seleccionado:', selectedFeature.getProperties());
    
            const nombre = selectedFeature.get('nombre') || 'Sin nombre';
            const ubicacion = selectedFeature.get('ubicacion') || 'Ubicación no disponible';
            const tematica = selectedFeature.get('tematica') || 'No disponible';
            const anio = selectedFeature.get('anio') || 'No disponible';
            const usuario = selectedFeature.get('usuario') || 'No disponible';
            const descripcion = selectedFeature.get('descripcion') || 'Sin descripción';
            const link = selectedFeature.get('link') || '#';
    
            console.log({
                nombre,
                ubicacion,
                tematica,
                anio,
                usuario,
                descripcion,
                link,
            });
    
            popupContent.innerHTML = `
    <h3>${nombre}</h3>
    <p><strong>Ubicación:</strong> ${ubicacion}</p>
    <p><strong>Temática:</strong> ${tematica}</p>
    <p><strong>Año:</strong> ${anio}</p>
    <p><strong>Usuario:</strong> ${usuario}</p>
    <p><strong>Descripción:</strong> ${descripcion}</p>
    <a href="${link}" target="_blank">Más información</a>
`;
    
            popupContainer.style.display = 'flex';
            overlay.setPosition(selectedFeature.getGeometry().getCoordinates());
        } else {
            console.log('Ningún punto seleccionado.');
        }
    });

    map.addInteraction(selectInteraction);
}