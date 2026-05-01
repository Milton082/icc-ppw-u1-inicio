"use strict";

/* =========================
   SELECCIÓN DE ELEMENTOS DOM
========================= */

const formTarea = document.getElementById("form-tarea");
const inputTarea = document.getElementById("input-tarea");
const listaTareas = document.getElementById("lista-tareas");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnLimpiar = document.getElementById("btn-limpiar");
const themeBtns = document.querySelectorAll("[data-theme]");

/* =========================
   ESTADO GLOBAL
========================= */

let tareas = [];

function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = tarea.id;

  if (tarea.completada) {
    li.classList.add("task-item--completed");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-item__checkbox";
  checkbox.checked = tarea.completada;

  const span = document.createElement("span");
  span.className = "task-item__text";
  span.textContent = tarea.texto;

  const btnEliminar = document.createElement("button");
  btnEliminar.className = "btn btn--danger btn--small";
  btnEliminar.textContent = "🗑️";

  const divAcciones = document.createElement("div");
  divAcciones.className = "task-item__actions";
  divAcciones.appendChild(btnEliminar);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(divAcciones);

  checkbox.addEventListener("change", () => toggleTarea(tarea.id));
  btnEliminar.addEventListener("click", () => eliminarTarea(tarea.id));

  return li;
}

function renderizarTareas() {
  listaTareas.innerHTML = "";

  if (tareas.length === 0) {
    const div = document.createElement("div");
    div.className = "empty-state";

    const p = document.createElement("p");
    p.textContent = "🎉 No hay tareas. ¡Agrega una para comenzar!";

    div.appendChild(p);
    listaTareas.appendChild(div);
    return;
  }

  tareas.forEach((tarea) => {
    const el = crearElementoTarea(tarea);
    listaTareas.appendChild(el);
  });
}

/**
 * Mostrar mensaje temporal
 * @param {string} texto - Texto del mensaje
 * @param {string} tipo - 'success' o 'error'
 */
function mostrarMensaje(texto, tipo = "success") {
  mensajeEstado.textContent = texto;
  mensajeEstado.className = `mensaje mensaje--${tipo}`;
  mensajeEstado.classList.remove("oculto");

  setTimeout(() => {
    mensajeEstado.classList.add("oculto");
  }, 3000);
}

/**
 * Cargar tareas desde localStorage
 */
function cargarTareas() {
  tareas = TareaStorage.getAll();
  renderizarTareas();
}

function agregarTarea(texto) {
  if (!texto.trim()) {
    mostrarMensaje("El texto no puede estar vacío", "error");
    return;
  }

  const nueva = TareaStorage.crear(texto);

  tareas = TareaStorage.getAll();
  renderizarTareas();

  mostrarMensaje(`✓ Tarea "${nueva.texto}" agregada`);
}

function toggleTarea(id) {
  TareaStorage.toggleCompletada(id);
  tareas = TareaStorage.getAll();
  renderizarTareas();
}

function eliminarTarea(id) {
  const tarea = tareas.find((t) => t.id === id);

  if (!confirm(`¿Eliminar "${tarea.texto}"?`)) return;

  TareaStorage.eliminar(id);

  tareas = TareaStorage.getAll();
  renderizarTareas();

  mostrarMensaje("Tarea eliminada");
}

function limpiarTodo() {
  if (tareas.length === 0) {
    mostrarMensaje("No hay tareas", "error");
    return;
  }

  if (!confirm("¿Eliminar todas las tareas?")) return;

  TareaStorage.limpiarTodo();

  tareas = [];
  renderizarTareas();

  mostrarMensaje("Todas las tareas eliminadas");
}

function aplicarTema(nombreTema) {
  if (nombreTema === "oscuro") {
    document.body.classList.add("tema-oscuro");
  } else {
    document.body.classList.remove("tema-oscuro");
  }

  // Botón activo
  themeBtns.forEach((btn) => {
    btn.classList.toggle("theme-btn--active", btn.dataset.theme === nombreTema);
  });

  // Guardar
  TemaStorage.setTema(nombreTema);
}

/* =========================
   EVENTOS
========================= */

// Evento: Submit del formulario
formTarea.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = inputTarea.value.trim();
  agregarTarea(texto);
  inputTarea.value = "";
});

// Evento: Limpiar todo
btnLimpiar.addEventListener("click", limpiarTodo);

// Evento: Cambiar tema
themeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    aplicarTema(btn.dataset.theme);
  });
});

/* =========================
   INICIALIZACIÓN
========================= */

// Cargar tema guardado
const temaGuardado = TemaStorage.getTema();
aplicarTema(temaGuardado);

// Cargar tareas desde localStorage
cargarTareas();

// Mensaje de bienvenida
if (tareas.length === 0) {
  mostrarMensaje("👋 Bienvenido! Agrega tu primera tarea", "success");
}
