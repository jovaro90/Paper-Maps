
let allData = [];

export function getAllData() {
  return allData;
}

export function setAllData(data) {
  allData = data;
}


export function generateResultHTML(data) {
  const { name, ubicacion, tematica, año, usuario, descripcion, link } = data;

  return `
      <h3>${name || 'Sin nombre'}</h3>
      <ul>
          <li><strong>Ubicación:</strong> ${ubicacion || 'Ubicación no disponible'}</li>
          <li><strong>Temática:</strong> ${tematica || 'Temática no disponible'}</li>
          <li><strong>Año:</strong> ${año || 'Año no disponible'}</li>
          <li><strong>Usuario:</strong> ${usuario || 'Usuario no disponible'}</li>
          <li><strong>Descripción:</strong> ${descripcion || 'Sin descripción'}</li>
          <li><strong>Link:</strong> <a href="${link || '#'}" target="_blank">Más información</a></li>
      </ul>
  `;
}