// Función para cargar usuarios desde el archivo CSV
export async function loadUsersFromCSV() {
    try {
      const response = await fetch('/users.csv');
      const csvText = await response.text();
      const users = [];
      const lines = csvText.split('\n');
      lines.forEach((line, index) => {
        if (index > 0 && line.trim() !== '') { // Ignorar la cabecera y líneas vacías
          const [username, password, role] = line.split(',');
          users.push({ username: username.trim(), password: password.trim(), role: role.trim() });
        }
      });
      return users;
    } catch (error) {
      console.error('Error al cargar el archivo users.csv:', error);
      return [];
    }
  }
  
  // Variable global para el rol actual del usuario
  let currentUserRole = 'viewer'; // Cambiar según el rol del usuario
  
  // Función para cambiar el rol del usuario
  export function setUserRole(role) {
    const roles = {
      admin: {
        canEdit: true,
        canDelete: true,
        canViewStats: true,
      },
      viewer: {
        canEdit: false,
        canDelete: false,
        canViewStats: true,
      },
      user: {
        canEdit: false,
        canDelete: false,
        canViewStats: true,
      },
    };
  
    if (roles[role]) {
      currentUserRole = role;
      console.log(`Rol cambiado a: ${role}`);
    } else {
      console.error('Rol no válido.');
    }
  }
  
  // Función para manejar el login del usuario
  export async function loginUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Por favor, ingrese usuario y contraseña.');
        return;
    }

    try {
        const users = await loadUsersFromCSV();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log(`Usuario autenticado: ${user.username}, Rol: ${user.role}`);
            alert(`Bienvenido, ${user.username}. Rol: ${user.role}`);
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';

            // Mostrar el nombre del usuario y rol en la cabecera
            const userInfo = document.getElementById('userInfo');
            userInfo.style.display = 'block';
            document.getElementById('userDisplayName').textContent = `Usuario: ${user.username}`;
            document.getElementById('userRoleDisplay').textContent = `Rol: ${user.role}`;

            // Guardar el usuario en el almacenamiento local
            localStorage.setItem('loggedInUser', JSON.stringify(user));

            // Establecer el rol del usuario
            setUserRole(user.role);

            // Recargar la página para reflejar los cambios
            location.reload();
        } else {
            alert('Credenciales incorrectas.');
        }
    } catch (error) {
        console.error('Error durante el proceso de login:', error);
        alert('Ocurrió un error al intentar iniciar sesión.');
    }
  }
  
  // Función para manejar el logout del usuario
  export function logoutUser() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    alert('Sesión cerrada exitosamente.');
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'inline-block';

    // Eliminar el usuario del almacenamiento local
    localStorage.removeItem('loggedInUser');

    // Ocultar el nombre del usuario y rol en la cabecera
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('userDisplayName').textContent = '';
    document.getElementById('userRoleDisplay').textContent = '';

    // Restablecer el rol a visualizador
    setUserRole('viewer');

    // Recargar la página para reflejar el estado de logout
    console.log('Recargando la página después de logout...');
    location.reload();
  }
  
  // Mostrar la sidebar de administrador y botones exclusivos si el usuario tiene rol admin
  export function loadLoggedInUser() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'inline-block';
  
      // Mostrar el nombre del usuario y rol en la cabecera
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('userDisplayName').textContent = `Usuario: ${loggedInUser.username}`;
      document.getElementById('userRoleDisplay').textContent = `Rol: ${loggedInUser.role}`;
  
      // Activar el rol del usuario
      setUserRole(loggedInUser.role);
  
      // Mostrar la sidebar y botones de administrador si el rol es admin
      if (loggedInUser.role === 'admin') {
        const adminSidebar = document.getElementById('adminSidebar');
        const adminButtons = document.getElementById('adminButtons');
        if (adminSidebar) adminSidebar.style.display = 'block';
        if (adminButtons) adminButtons.style.display = 'block';
      }
    }
  }
  
  // Función para abrir el popup de registro
  export function openRegisterPopup() {
    document.getElementById('registerPopup').style.display = 'flex';
  }
  
  // Función para cerrar el popup de registro
  export function closeRegisterPopup() {
    const registerPopup = document.getElementById('registerPopup');
    if (registerPopup) {
      registerPopup.style.display = 'none'; // Ocultar el popup
    } else {
      console.error('No se encontró el elemento con ID "registerPopup".');
    }
  }
  // Función para manejar el registro de usuario
  export async function submitRegistration() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const repeatPassword = document.getElementById('repeatPassword').value.trim();
    const role = document.getElementById('userRole').value; 
  
    if (!username || !password || !repeatPassword) {
      alert('Por favor, complete todos los campos.');
      return;
    }
  
    if (password !== repeatPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    console.log('Datos enviados:', { username, password, role }); // Depuración
  
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }), // Enviar el rol seleccionado
      });
  
      if (response.ok) {
        const data = await response.text();
        console.log('Respuesta:', data);
        alert(`Usuario ${username} registrado exitosamente con rol ${role}.`);
        closeRegisterPopup();
      } else {
        const errorMessage = await response.text();
        console.error('Error al registrar el usuario:', errorMessage);
        alert(`Error al registrar el usuario: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      alert('Ocurrió un error al intentar registrar el usuario.');
    }
  }
  
// Función para inicializar eventos relacionados con el rol del usuario y sidebars
export function initializeRoleAndSidebarEvents() {
    // Cambiar el rol del usuario al seleccionar una opción
    const userRoleSelector = document.getElementById('userRole');
    if (userRoleSelector) {
      userRoleSelector.addEventListener('change', function () {
        const selectedRole = this.value;
        setUserRole(selectedRole); // Llamar a la función definida en login.js
      });
    }
  
    // Vincular el botón de la sidebar con la funcionalidad
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', function () {
        toggleSidebar(); // Llamar a la función definida en sidebarResults.js
      });
    }
  
    // Vincular el botón de la sidebar-right con la funcionalidad
    const toggleSidebarResultsBtn = document.getElementById('toggleSidebarResultsBtn');
    if (toggleSidebarResultsBtn) {
      toggleSidebarResultsBtn.addEventListener('click', function () {
        toggleSidebarResults(); // Llamar a la función definida en sidebarResults.js
      });
    }
  }

  export function toggleSidebar() {
    const sidebar = document.getElementById('sidebarResults');
    if (sidebar) {
      sidebar.classList.toggle('open');
    } else {
      console.error('No se encontró el elemento con ID "sidebar".');
    }
  }

  export function getUsername() {
    if (username) {
      return username;
    } 
  }