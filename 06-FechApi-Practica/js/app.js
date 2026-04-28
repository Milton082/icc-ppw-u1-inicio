'use strict';

/* =========================
   SELECCIÓN DE ELEMENTOS
========================= */

const formPost = document.querySelector('#form-post');
const inputPostId = document.querySelector('#post-id');
const inputTitulo = document.querySelector('#titulo');
const inputContenido = document.querySelector('#contenido');
const btnSubmit = document.querySelector('#btn-submit');
const btnCancelar = document.querySelector('#btn-cancelar');

const inputBuscar = document.querySelector('#input-buscar');
const btnBuscar = document.querySelector('#btn-buscar');
const btnLimpiar = document.querySelector('#btn-limpiar');

const listaPosts = document.querySelector('#lista-posts');
const mensajeEstado = document.querySelector('#mensaje-estado');
const contador = document.querySelector('#contador strong');

/* =========================
   ESTADO GLOBAL
========================= */

let posts = [];
let postsFiltrados = [];
let modoEdicion = false;

/* =========================
   FUNCIONES PRINCIPALES
========================= */

/**
 * Cargar todos los posts desde la API
 */

async function cargarPosts() {
  try {
    mostrarCargando(listaPosts);

    posts = await ApiService.getPosts(20);

    postsFiltrados = [...posts];

    renderizarPosts(postsFiltrados, listaPosts);

    actualizarContador();

  } catch (error) {
    // Limpiar y mostrar error usando appendChild (no innerHTML)
    listaPosts.innerHTML = '';
    listaPosts.appendChild(MensajeError(`No se pudieron cargar los posts: ${error.message}`));
  }
}

/**
 * Actualizar el contador de posts
 */
function actualizarContador() {
  contador.textContent = postsFiltrados.length;
}

/**
 * Limpiar el formulario y resetear estado
 */
function limpiarFormulario() {
  formPost.reset();
  inputPostId.value = '';
  modoEdicion = false;
  btnSubmit.textContent = 'Crear Post';
  btnCancelar.style.display = 'none';
}

/**
 * Cambiar a modo edición
 * @param {object} post - Post a editar
 */
function activarModoEdicion(post) {
  modoEdicion = true;
  inputPostId.value = post.id;
  inputTitulo.value = post.title;
  inputContenido.value = post.body;
  btnSubmit.textContent = 'Actualizar Post';
  btnCancelar.style.display = 'inline-block';
  
  // Scroll al formulario
  formPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputTitulo.focus();
}

async function guardarPost(datosPost) {
  try {
    btnSubmit.disabled = true;
    btnSubmit.textContent = modoEdicion ? 'Actualizando...' : 'Creando...';

    let resultado;

    if (modoEdicion) {
      const id = parseInt(inputPostId.value);

      resultado = await ApiService.updatePost(id, datosPost);
      
      // Actualizar en el array local
      const index = posts.findIndex(p => p.id === id);
      if (index !== -1) {
        posts[index] = { ...resultado, id };
      }

      mostrarMensajeTemporal(
        mensajeEstado,
        MensajeExito(`Post #${id} actualizado correctamente`),
        3000
      );

    } else {
      resultado = await ApiService.createPost(datosPost);
      
      posts.unshift(resultado);

      mostrarMensajeTemporal(
        mensajeEstado,
        MensajeExito(`Post #${resultado.id} creado correctamente`),
        3000
      );
    }

    // Re-renderizar
    postsFiltrados = [...posts];
    renderizarPosts(postsFiltrados, listaPosts);
    actualizarContador();
    limpiarFormulario();

  } catch (error) {
    mostrarMensajeTemporal(
      mensajeEstado,
      MensajeError(`Error al guardar: ${error.message}`),
      5000
    );
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = modoEdicion ? 'Actualizar Post' : 'Crear Post';
  }
}

/**
 * Eliminar un post
 * @param {number} id - ID del post a eliminar
 */

async function eliminarPost(id) {
  if (!confirm(`¿Eliminar el post #${id}?`)) {
    return;
  }

  try {
    await ApiService.deletePost(id);

    posts = posts.filter(p => p.id !== id);

    postsFiltrados = postsFiltrados.filter(p => p.id !== id);

    renderizarPosts(postsFiltrados, listaPosts);
    actualizarContador();

    mostrarMensajeTemporal(
      mensajeEstado,
      MensajeExito(`Post #${id} eliminado correctamente`),
      3000
    );

  } catch (error) {
    mostrarMensajeTemporal(
      mensajeEstado,
      MensajeError(`Error al eliminar: ${error.message}`),
      5000
    );
  }
}

/**
 * Buscar posts por título o contenido
 * @param {string} termino - Término de búsqueda
 */

function buscarPosts(termino) {
  const terminoLower = termino.toLowerCase().trim();

  if (terminoLower === '') {
    postsFiltrados = [...posts];
  } else {
    postsFiltrados = posts.filter(post => {
      const tituloMatch = post.title.toLowerCase().includes(terminoLower);
      const bodyMatch = post.body.toLowerCase().includes(terminoLower);
      return tituloMatch || bodyMatch;
    });
  }

  renderizarPosts(postsFiltrados, listaPosts);
  actualizarContador();
}

/* =========================
   EVENT LISTENERS
========================= */

// Submit del formulario
formPost.addEventListener('submit', (e) => {
  e.preventDefault();

  const datosPost = {
    title: inputTitulo.value.trim(),
    body: inputContenido.value.trim(),
    userId: 1
  };

  guardarPost(datosPost);
});

// Cancelar edición
btnCancelar.addEventListener('click', () => {
  limpiarFormulario();
});

// Buscar posts
btnBuscar.addEventListener('click', () => {
  buscarPosts(inputBuscar.value);
});

// Buscar con Enter
inputBuscar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    buscarPosts(inputBuscar.value);
  }
});

// Limpiar búsqueda
btnLimpiar.addEventListener('click', () => {
  limpiarBusqueda();
});

// Delegación de eventos para editar y eliminar
listaPosts.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  
  if (!action) return;

  const id = parseInt(e.target.dataset.id);
  const post = posts.find(p => p.id === id);

  if (action === 'editar' && post) {
    activarModoEdicion(post);
  }

  if (action === 'eliminar') {
    eliminarPost(id);
  }
});

/* =========================
   INICIALIZACIÓN
========================= */

// Cargar posts al iniciar
cargarPosts();