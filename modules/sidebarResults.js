export function displaySearchResults(results) {
    const popupContainer = document.getElementById('popupContainer');
    const popupContent = document.getElementById('popupResultsContent');
    popupContent.innerHTML = ''; // Limpiar contenido previo
  
    if (results.length === 0) {
      popupContent.innerHTML = '<p>No se encontraron resultados.</p>';
    } else {
      results.forEach(result => {
        // Crear el contenedor desplegable
        const details = document.createElement('details');
        details.style.marginBottom = "15px";
        details.style.padding = "10px";
        details.style.borderBottom = "1px solid #ccc";
  
        // Crear el encabezado del desplegable
        const summary = document.createElement('summary');
        summary.textContent = result.Nombre || "Sin nombre";
        summary.style.fontWeight = "bold";
        summary.style.cursor = "pointer";
        details.appendChild(summary);
  
        // Crear el contenido del desplegable
        const content = document.createElement('div');
        content.style.marginTop = "10px";
  
        // Ubicación, Temática, Año y Usuario
        const detailsText = document.createElement('p');
        detailsText.innerHTML = `
          <strong>Ubicación:</strong> ${result.ubicacion || "N/A"}<br>
          <strong>Temática:</strong> ${result.tematica || "N/A"}<br>
          <strong>Año:</strong> ${result.anio || "N/A"}<br>
          <strong>Usuario:</strong> ${result.usuario || "Desconocido"}
        `;
        content.appendChild(detailsText);
  
        // Descripción
        const description = document.createElement('p');
        description.textContent = result.descripcion || "No hay descripción disponible.";
        content.appendChild(description);
  
        // Link
        const link = document.createElement('a');
        if (result.link) {
          link.href = result.link;
          link.textContent = "🔗 Más información";
          link.target = "_blank";
          link.style.display = "block";
          link.style.marginTop = "5px";
        } else {
          link.textContent = "🔗 No hay enlace disponible";
          link.style.color = "gray";
          link.style.cursor = "default";
        }
        content.appendChild(link);
  
        // Agregar el contenido al contenedor desplegable
        details.appendChild(content);
  
        // Agregar el contenedor desplegable al popup
        popupContent.appendChild(details);
      });
    }
  
    popupContainer.style.display = 'flex'; // Mostrar el contenedor de resultados
    popupInfo.style.display = 'block';
  
    generateStatistics(results); // Generar estadísticas

    
  }
  
  export function closePopup(popupId) {
    const popupElement = document.getElementById(popupId);
    if (popupElement) {
      popupElement.style.display = 'none';
  
      // Si se cierra uno, cerramos ambos
      if (popupId === 'popupResults' || popupId === 'popupStats') {
        const popupContainer = document.getElementById('popupContainer');
        if (popupContainer) {
          popupContainer.style.display = 'none';
        } else {
          console.error('El elemento con ID "popupContainer" no existe.');
        }
      }
    } else {
      console.error(`El elemento con ID "${popupId}" no existe.`);
    }
  }
  
  export function generateStatistics(results, selectedYear = null) {
    const statsContainer = document.getElementById('popupStatsContent');
    statsContainer.innerHTML = ''; // Limpiar contenido previo
  
    // Filtrar resultados por año si se selecciona uno
    const filteredResults = selectedYear
      ? results.filter(result => result.anio === selectedYear)
      : results;
  
    // Conteo de temáticas
    let themesCount = {};
    results.forEach(result => {
      if (result.tematica) {
        themesCount[result.tematica] = (themesCount[result.tematica] || 0) + 1;
      }
    });
  
    // Calcular etiquetas y valores para el gráfico
    const themeLabels = Object.keys(themesCount);
    const themeValues = Object.values(themesCount);
  
    // Crear gráficos dentro del contenedor de estadísticas
    statsContainer.innerHTML = `
      <h4>Proyectos por Temática ${selectedYear ? `en ${selectedYear}` : '(Total)'}</h4>
      <canvas id="pieChart" style="max-height: 200px;"></canvas>
      <h4>Proyectos por Año</h4>
      <canvas id="barChart" style="max-height: 200px;"></canvas>
    `;
  
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const ctxBar = document.getElementById('barChart').getContext('2d');
  
    // Si ya existe una instancia del gráfico, destruirlas antes de crear nuevas
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
          label: `Proyectos por Temática ${selectedYear ? `en ${selectedYear}` : '(Total)'}`,
          data: themeValues,
          backgroundColor: themeLabels.map((_, index) => `hsl(${(index * 360 / themeLabels.length)}, 70%, 50%)`), // Generar colores únicos
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const total = themeValues.reduce((sum, value) => sum + value, 0);
                const value = themeValues[tooltipItem.dataIndex];
                const percentage = ((value / total) * 100).toFixed(2);
                return `${themeLabels[tooltipItem.dataIndex]}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  
    // Conteo de años
    let yearsCount = {};
    filteredResults.forEach(result => {
      if (result.anio) {
        yearsCount[result.anio] = (yearsCount[result.anio] || 0) + 1;
      }
    });
  
    const yearLabels = Object.keys(yearsCount);
    const yearValues = Object.values(yearsCount);
  
    // Gráfico de Barras para los Años
    window.barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: yearLabels,
        datasets: [{
          label: 'Proyectos por Año',
          data: yearValues,
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

  export function updateSidebarWithSelectedPoints(points) {
    const sidebar = document.getElementById('sidebarResults');
    const resultsContainer = document.getElementById('popupResultsContent'); // Contenedor de resultados
  
    if (!resultsContainer) {
      console.error('El contenedor de resultados (popupResultsContent) no se encontró en el DOM.');
      return;
    }
  
    // Limpiar los resultados anteriores
    resultsContainer.innerHTML = '';
  
    if (points.length === 0) {
      resultsContainer.innerHTML = '<p>No hay puntos dentro del área seleccionada.</p>';
      return;
    }
  
    // Crear una lista de los puntos seleccionados
    const list = document.createElement('ul');
    points.forEach(point => {
      const name = point.Nombre || point.get?.('name') || 'Sin nombre';
      const description = point.descripcion || point.get?.('descripcion') || 'Sin descripción';
      const link = point.link || point.get?.('link') || '#';
  
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <h4>${name}</h4>
        <p>${description}</p>
        <a href="${link}" target="_blank">Más información</a>
      `;
      list.appendChild(listItem);
    });
  
    resultsContainer.appendChild(list);
  
    // Mostrar la barra lateral si está oculta
    if (!sidebar.classList.contains('open')) {
      sidebar.classList.add('open');
      document.getElementById('toggleSidebarResultsBtn').textContent = 'Ocultar Resultados';
    }
  }