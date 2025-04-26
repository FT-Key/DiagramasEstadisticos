const datos = [];
const colores = [];

function agregarDato() {
  const nombre = document.getElementById('nombre').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);

  if (!nombre || isNaN(valor) || valor <= 0) {
    alert("Por favor ingresa un nombre y un valor numérico mayor a 0.");
    return;
  }

  datos.push({ nombre, valor });
  colores.push(generarColor());

  // Limpiar los campos
  document.getElementById('nombre').value = "";
  document.getElementById('valor').value = "";

  // Mover el puntero al campo 'nombre'
  document.getElementById('nombre').focus();

  dibujarTorta(true); // Dibuja todo menos el último
  const total = datos.reduce((acc, d) => acc + d.valor, 0);
  const porcentaje = datos[datos.length - 1].valor / total;
  const angulo = porcentaje * 2 * Math.PI;
  const anguloInicial = datos
    .slice(0, -1)
    .reduce((acc, d) => acc + (d.valor / total) * 2 * Math.PI, 0);

  animarSector(
    document.getElementById('torta').getContext('2d'),
    colores[colores.length - 1],
    anguloInicial,
    anguloInicial + angulo
  );
}

// Detectar cuando se presiona Enter en el campo 'nombre'
document.getElementById('nombre').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    // Mover el puntero al campo 'valor'
    document.getElementById('valor').focus();
    const valorInput = document.getElementById('valor');
    // Posicionar el cursor al final del texto si ya hay algo escrito
    valorInput.selectionStart = valorInput.selectionEnd = valorInput.value.length;
  }
});

// Detectar cuando se presiona Enter en el campo 'valor'
document.getElementById('valor').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    agregarDato();
  }
});

const paletaColores = [
  "#A28CFF", // Morado pastel
  "#FF8C94", // Rojo coral suave
  "#84DCC6", // Verde menta
  "#A6E1FA", // Azul celeste
  "#FFD972", // Amarillo suave
  "#FFABAB", // Rosa claro
  "#D4A5A5", // Rosa viejo
  "#95E1D3", // Verde agua
  "#F3E5AB", // Arena
  "#B5EAD7"  // Verde limón pastel
];

let colorIndex = 0;

function generarColor() {
  const color = paletaColores[colorIndex % paletaColores.length];
  colorIndex++;
  return color;
}

function dibujarTorta(sinUltimo = false) {
  const canvas = document.getElementById('torta');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = datos.reduce((acc, d) => acc + d.valor, 0);

  if (total === 0) {
    // Gráfico vacío
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 150, 0, 2 * Math.PI);
    ctx.fillStyle = "#ccc";
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#ccc";
    ctx.fillRect(10, 370, 10, 10);
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.fillText("Vacío (100%)", 25, 380);

    ctx.fillStyle = "#666";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sin datos", 200, 205);
    return;
  }

  // Sombra de fondo (efecto 3D en diagonal)
  const depth = 20;
  for (let d = depth; d > 0; d--) {
    ctx.beginPath();
    ctx.moveTo(200 + d, 200 + d); // centro movido en diagonal
    ctx.arc(200 + d, 200 + d, 150, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(0, 0, 0, ${0.04})`; // un poco más suave
    ctx.fill();
    ctx.closePath();
  }

  let datosDibujar = sinUltimo ? datos.slice(0, -1) : [...datos];
  let coloresDibujar = sinUltimo ? colores.slice(0, -1) : [...colores];

  // Ordenar de mayor a menor valor
  const indicesOrdenados = datosDibujar
    .map((d, i) => [i, d.valor])
    .sort((a, b) => b[1] - a[1])
    .map(([i]) => i);

  datosDibujar = indicesOrdenados.map(i => datosDibujar[i]);
  coloresDibujar = indicesOrdenados.map(i => coloresDibujar[i]);

  let anguloInicial = 0;
  datosDibujar.forEach((dato, i) => {
    const porcentaje = dato.valor / total;
    const angulo = porcentaje * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 150, anguloInicial, anguloInicial + angulo);
    ctx.fillStyle = coloresDibujar[i];
    ctx.fill();
    ctx.closePath();

    anguloInicial += angulo;
  });

  // Leyenda en HTML
  const leyenda = document.getElementById('leyenda');
  leyenda.innerHTML = ""; // limpiar
  datosDibujar.forEach((dato, i) => {
    const porcentaje = ((dato.valor / total) * 100).toFixed(1);
    const item = document.createElement('div');
    item.className = 'leyenda-item';
    item.innerHTML = `
    <div class="leyenda-color" style="background:${coloresDibujar[i]}"></div>
    <span>${dato.nombre} (${porcentaje}%)</span>
  `;
    leyenda.appendChild(item);
  });
}

function animarSector(ctx, color, anguloInicial, anguloFinal, duration = 500) {
  const centerX = 200;
  const centerY = 200;
  const radius = 150;
  const start = performance.now();

  // Comenzamos con el valor inicial y el valor final que se anima
  let anguloActualFinal = anguloFinal;
  let anguloActualInicial = anguloInicial;

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);

    // Calculamos el ángulo real que se va a mostrar
    const anguloNuevo = anguloActualInicial + (anguloActualFinal - anguloActualInicial) * progress;
    let anguloPrevio = anguloActualInicial;

    ctx.clearRect(0, 0, 400, 400); // Limpiar canvas

    // Dibujar todos los sectores existentes (sin el nuevo)
    datos.forEach((dato, i) => {
      if (i === datos.length - 1) return; // Omitir el último, que está en animación

      const porcentaje = dato.valor / datos.reduce((acc, d) => acc + d.valor, 0);
      const angulo = porcentaje * 2 * Math.PI;
      anguloPrevio += angulo;

      // Dibujar el sector existente
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, anguloActualInicial, anguloPrevio);
      ctx.fillStyle = colores[i];
      ctx.fill();
      ctx.closePath();
    });

    // Dibujar el nuevo sector en expansión
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, anguloActualInicial, anguloNuevo);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // Si no se ha terminado la animación, continuar
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Después de la animación, redibujamos toda la torta
      dibujarTorta(); // Finalizar con el gráfico completo
    }
  }

  requestAnimationFrame(animate); // Iniciar la animación
}


// Dibujo inicial del gráfico vacío
window.onload = () => dibujarTorta();
