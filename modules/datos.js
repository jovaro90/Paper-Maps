export async function addNewData(event) {
    // Verificar si el evento existe y prevenir el comportamiento predeterminado
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const nombre = document.getElementById('addNombredatos').value.trim();
    const tematica = document.getElementById('addTematicadatos').value.trim();
    const latitud = parseFloat(document.getElementById('addLatituddatos').value.trim());
    const longitud = parseFloat(document.getElementById('addLongituddatos').value.trim());
        if (isNaN(latitud) || isNaN(longitud)) {
            alert('Latitud y Longitud deben ser números válidos.');
            return;
        }
    const link = document.getElementById('addLinkdatos').value.trim();
    // Campos opcionales
    const ubicacion = document.getElementById('addUbicaciondatos')?.value.trim() || '';
    const anio = document.getElementById('addAnio')?.value.trim() || '';
    const palabraClave = document.getElementById('addPalabraClavedatos')?.value.trim() || '';
    const descripcion = document.getElementById('addDescripciondatos')?.value.trim() || '';


    // Obtener el usuario conectado desde localStorage
    const loggedInUserRaw = localStorage.getItem('loggedInUser');
    console.log('Valor de loggedInUser en localStorage:', loggedInUserRaw); // Depuración adicional

    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(loggedInUserRaw);
    } catch (error) {
        console.error('Error al analizar loggedInUser desde localStorage:', error);
    }

    const usuario = loggedInUser && loggedInUser.username ? loggedInUser.username : 'Anónimo'; // Si no hay usuario, usar "Anónimo"
    console.log('Usuario detectado:', usuario); // Depuración adicional

    // Validar solo los campos obligatorios
    if (!nombre || !tematica || !latitud || !longitud || !link) {
        alert('Por favor, complete todos los campos obligatorios: Nombre, Temática, Latitud, Longitud y Enlace.');
        return;
    }
    // Crear el objeto con los datos a enviar
    const data = {
        nombre,
        tematica,
        latitud,
        longitud,
        link,
        ubicacion: ubicacion || '',  // Permitir que los opcionales estén vacíos// Opcional
        anio: anio || '',  // Opcional
        palabraclave: palabraClave || '', // Opcional
        descripcion: descripcion || '', // Opcional
        usuario, // Agregar el usuario que subió los datos
    };

    try {
        const response = await fetch('http://localhost:3000/addData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseText = await response.text();
        console.log('Estado de la respuesta:', response.status);
        console.log('Respuesta del servidor:', responseText);

        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${responseText}`);
        }

        alert('Datos guardados correctamente');
    } catch (error) {
        console.error('Error al enviar datos:', error);
        alert('Error al guardar los datos.');
        return; // Asegúrate de que el flujo no continúe si hay un error
    }

    // Recargar la página para reflejar los cambios
    console.log('Recargando la página...');
    location.reload();

    // Depuración: Verificar los datos enviados
    console.log('Datos enviados al servidor:', data);

    // Validar que los campos obligatorios no estén vacíos antes de enviar
    if (!data.nombre || !data.tematica || !data.latitud || !data.longitud || !data.link) {
        console.error('Error: Faltan campos obligatorios en los datos enviados:', data);
        alert('Error: Faltan campos obligatorios. Por favor, complete todos los campos requeridos.');
        return;
    }

    // Evitar solicitudes duplicadas
    if (addNewData.isSubmitting) {
        console.warn('Ya se está procesando una solicitud. Por favor, espere.');
        return;
    }
    addNewData.isSubmitting = true;

    // Declarar e inicializar csvData si no está definido
    if (typeof csvData === 'undefined') {
        var csvData = [];
    }

    // Agregar el nuevo dato a la lista de datos existentes
    csvData.push(data);


//--------------------------------------------------------------
//--------------------------------------------------------------
/*ERROR:  no se actualiza tras añadir el nuevo dato y se debe actualizar a mano
*/
    //verificar datos antes de enviar
    console.log('Valores antes de enviar:', data); // Depuración adicional

// Inicializar la propiedad isSubmitting para evitar solicitudes duplicadas
addNewData.isSubmitting = false;
} // Close the addNewData function

// Función para ocultar el formulario de añadir datos
export function hideAddDataForm() {
    const addDataForm = document.getElementById('addDataForm');
    if (addDataForm) {
        addDataForm.style.display = 'none';
    } else {
        console.error('El formulario de añadir datos no existe.');
    }
}

// Función para mostrar el formulario de añadir datos
export function showAddDataForm() {
    const addDataForm = document.getElementById('addDataForm');
    if (addDataForm) {
        addDataForm.style.display = 'flex'; // Mostrar el formulario
    } else {
        console.error('El formulario de añadir datos no existe.');
    }
}