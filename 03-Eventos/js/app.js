'use strict';

/* =========================
   FORMULARIO
========================= */

const formulario = document.querySelector('#formulario');
const inputNombre = document.querySelector('#nombre');
const inputEmail = document.querySelector('#email');
const selectAsunto = document.querySelector('#asunto');
const textMensaje = document.querySelector('#mensaje');
const charCount = document.querySelector('#chars');
const resultado = document.querySelector('#resultado');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCampo(input, esValido, errorId) {
  const errorMsg = document.getElementById(errorId);

  if (esValido) {
    input.classList.remove('error');
    errorMsg.classList.remove('visible');
  } else {
    input.classList.add('error');
    errorMsg.classList.add('visible');
  }

  return esValido;
}

function validarNombre() {
  return validarCampo(
    inputNombre,
    inputNombre.value.trim().length >= 3,
    'error-nombre'
  );
}

function validarEmail() {
  return validarCampo(
    inputEmail,
    EMAIL_REGEX.test(inputEmail.value.trim()),
    'error-email'
  );
}

function validarAsunto() {
  return validarCampo(
    selectAsunto,
    selectAsunto.value.trim() !== '',
    'error-asunto'
  );
}

function validarMensaje() {
  return validarCampo(
    textMensaje,
    textMensaje.value.trim().length >= 10,
    'error-mensaje'
  );
}

function actualizarContador(e) {
  // 1. Obtener longitud
  const longitud = e.target.value.length;
  
  // 2. Actualizar contador
  charCount.textContent = longitud;
  
  // 3. Cambiar color según límite
  charCount.style.color = longitud > 270 ? '#e74c3c' : '#999';
}

// 4. Evento input
textMensaje.addEventListener('input', actualizarContador);

// Evento blur en cada campo
inputNombre.addEventListener('blur', validarNombre);

inputEmail.addEventListener('blur', validarEmail);

selectAsunto.addEventListener('blur', validarAsunto);

textMensaje.addEventListener('blur', validarMensaje);


// 5.1 Funcion limpiar 
function limpiarError(input, errorId) {
  input.classList.remove('error');
  document.getElementById(errorId).classList.remove('visible');
}

// 5.2 Limpiar errores en tiempo real

inputNombre.addEventListener('input', () =>
  limpiarError(inputNombre, 'error-nombre')
);

inputEmail.addEventListener('input', () =>
  limpiarError(inputEmail, 'error-email')
);

selectAsunto.addEventListener('change', () =>
  limpiarError(selectAsunto, 'error-asunto')
);

textMensaje.addEventListener('input', () =>
  limpiarError(textMensaje, 'error-mensaje')
);


//5.3 Mostrar resultado
function mostrarResultado() {
  resultado.innerHTML = '';

  const titulo = document.createElement('strong');
  titulo.textContent = 'Datos recibidos:';

  const pNombre = document.createElement('p');
  pNombre.textContent = `Nombre: ${inputNombre.value.trim()}`;

  const pEmail = document.createElement('p');
  pEmail.textContent = `Email: ${inputEmail.value.trim()}`;

  const pAsunto = document.createElement('p');
  pAsunto.textContent = `Asunto: ${selectAsunto.options[selectAsunto.selectedIndex].text}`;

  const pMensaje = document.createElement('p');
  pMensaje.textContent = `Mensaje: ${textMensaje.value.trim()}`;

  resultado.appendChild(titulo);
  resultado.appendChild(pNombre);
  resultado.appendChild(pEmail);
  resultado.appendChild(pAsunto);
  resultado.appendChild(pMensaje);

  resultado.classList.add('visible');
}

//5.4 Resetear formulario

function resetearFormulario() {
  formulario.reset();
  charCount.textContent = '0';
  charCount.style.color = '#999';

  [inputNombre, inputEmail, selectAsunto, textMensaje].forEach((campo) => {
    campo.classList.remove('error');
  });

  document.querySelectorAll('.error-msg').forEach((msg) => {
    msg.classList.remove('visible');
  });
}

//5.5 Submit del formulario

formulario.addEventListener('submit', (e) => {
  e.preventDefault();

  // 5.5.1 Validar todos los campos
  const nombreValido = validarNombre();
  const emailValido = validarEmail();
  const asuntoValido = validarAsunto();
  const mensajeValido = validarMensaje();

  // 5.5.2 Si todo es válido
  if (nombreValido && emailValido && asuntoValido && mensajeValido) {
    mostrarResultado();
    resetearFormulario();
    return;
  }

  // 5.5.3 Enfocar el primer error
  if (!nombreValido) {
    inputNombre.focus();
    return;
  }

  if (!emailValido) {
    inputEmail.focus();
    return;
  }

  if (!asuntoValido) {
    selectAsunto.focus();
    return;
  }

  textMensaje.focus(); // último caso
});

/* =========================
   ATAJO DE TECLADO
========================= */

document.addEventListener('keydown', (e) => {

  // Detectar Ctrl + Enter
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();

    // Disparar submit correctamente
    formulario.requestSubmit();
  }

});

//7.1 Variables y datos iniciales

/* =========================
   TAREAS CON DELEGACIÓN
========================= */

const inputNuevaTarea = document.querySelector('#nueva-tarea');
const btnAgregar = document.querySelector('#btn-agregar');
const listaTareas = document.querySelector('#lista-tareas');
const contadorTareas = document.querySelector('#contador-tareas');

let tareas = [
  { id: 1, texto: 'Estudiar JavaScript', completada: false },
  { id: 2, texto: 'Hacer la práctica', completada: false },
  { id: 3, texto: 'Subir al repositorio', completada: true }
];

//7.2 Funciones Helper para crear elementos
function crearBotonEliminar() {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = 'Eliminar';
  boton.className = 'btn-eliminar';
  boton.dataset.action = 'eliminar';
  return boton;
}

function crearTextoTarea(tarea) {
  const span = document.createElement('span');
  span.textContent = tarea.texto;
  span.className = 'tarea-texto';
  span.dataset.action = 'toggle';
  return span;
}

function crearItemTarea(tarea) {
  const li = document.createElement('li');
  li.className = `tarea-item${tarea.completada ? ' completada' : ''}`;
  li.dataset.id = tarea.id;

  const texto = crearTextoTarea(tarea);
  const botonEliminar = crearBotonEliminar();

  li.appendChild(texto);
  li.appendChild(botonEliminar);

  return li;
}

//7.3 Función para actualizar contador 
function actualizarContadorTareas() {
  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  contadorTareas.textContent = `${pendientes} pendiente(s)`;
}

//7.4 Función renderizar
function renderizarTareas() {
  listaTareas.innerHTML = '';

  // 7.4.1 Caso cuando no hay tareas
  if (tareas.length === 0) {
    const itemVacio = document.createElement('li');
    itemVacio.className = 'estado-vacio';
    itemVacio.textContent = 'No hay tareas registradas';
    listaTareas.appendChild(itemVacio);

    contadorTareas.textContent = '0 pendiente(s)';
    return;
  }

  // 7.4.2 Renderizar cada tarea
  tareas.forEach((tarea) => {
    const item = crearItemTarea(tarea);
    listaTareas.appendChild(item);
  });

  // 7.4.3 Actualizar contador
  actualizarContadorTareas();
}

//7.5 Función agregar tarea

function agregarTarea() {
  // 1. Obtener texto sin espacios
  const texto = inputNuevaTarea.value.trim();

  // 2. Validar que no esté vacío
  if (texto === '') {
    inputNuevaTarea.focus();
    return;
  }

  // 3. Agregar tarea
  tareas.push({
    id: Date.now(),
    texto,
    completada: false
  });

  // 4. Limpiar input
  inputNuevaTarea.value = '';

  // 5. Renderizar lista
  renderizarTareas();

  // 6. Volver a enfocar
  inputNuevaTarea.focus();
}

//7.6 Eventos del botón y Enter

// 7.6.1 Evento click en el botón
btnAgregar.addEventListener('click', agregarTarea);

// 7.6.2 Evento Enter en el input
inputNuevaTarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    agregarTarea();
  }
});

//7.7 Event delegation

listaTareas.addEventListener('click', (e) => {
  const action = e.target.dataset.action;

  // 7.7.1 Verificar si tiene data-action
  if (!action) {
    return;
  }

  // 7.7.2 Obtener el <li> padre más cercano
  const item = e.target.closest('li');
  if (!item || !item.dataset.id) {
    return;
  }

  // 7.7.3 Convertir id a número
  const id = Number(item.dataset.id);

  // 7.7.4 Acción eliminar
  if (action === 'eliminar') {
    tareas = tareas.filter((tarea) => tarea.id !== id);
    renderizarTareas();
    return;
  }

  // 7.7.5 Acción toggle (completar / pendiente)
  if (action === 'toggle') {
    const tarea = tareas.find((itemTarea) => itemTarea.id === id);
    if (tarea) {
      tarea.completada = !tarea.completada;
      renderizarTareas();
    }
  }
});

//7.8 Renderizado inicial
renderizarTareas();