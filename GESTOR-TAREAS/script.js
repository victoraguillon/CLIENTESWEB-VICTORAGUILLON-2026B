/*
  AUTOEVALUACIÓN — completa con sinceridad:
  1. ¿Qué parte fue la más difícil y por qué?
  2. ¿En qué parte usaste código que copiaste sin entender del todo?
  3. Si tuvieras que rehacer esta app desde cero mañana, ¿cuánto tardarías?
  4. ¿Qué harías diferente?
*/

const STORAGE_KEY = 'tareas';
const taskForm = document.getElementById('task-form');
const taskTextInput = document.getElementById('task-text');
const taskPrioritySelect = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const statsElement = document.querySelector('.stats');
const emptyMessage = document.getElementById('empty-message');
const filterButtons = document.querySelectorAll('.filter-button');
const sortSelect = document.getElementById('task-sort');
const exportButton = document.getElementById('export-button');
const importButton = document.getElementById('import-button');
const importFileInput = document.getElementById('import-file');

let tareas = loadTasks();
let activeFilter = 'todas';
let activeSort = 'fecha-nueva';

function loadTasks() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return [];

  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(validTaskShape);
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function validTaskShape(task) {
  return (
    task &&
    typeof task.id === 'number' &&
    typeof task.texto === 'string' &&
    task.texto.trim().length >= 3 &&
    typeof task.completada === 'boolean' &&
    ['baja', 'media', 'alta'].includes(task.prioridad) &&
    typeof task.creada === 'string' &&
    !Number.isNaN(Date.parse(task.creada))
  );
}

function buildTaskObject(texto, prioridad) {
  const creada = new Date().toISOString().slice(0, 10);
  return {
    id: Date.now(),
    texto: texto.trim(),
    completada: false,
    prioridad,
    creada,
  };
}

function getFilteredTasks() {
  const base = tareas.filter((tarea) => {
    if (activeFilter === 'pendientes') return !tarea.completada;
    if (activeFilter === 'completadas') return tarea.completada;
    return true;
  });

  return sortTasks(base);
}

function sortTasks(list) {
  const copy = [...list];
  if (activeSort === 'fecha-vieja') {
    return copy.sort((a, b) => a.id - b.id);
  }
  if (activeSort === 'prioridad') {
    const order = { alta: 0, media: 1, baja: 2 };
    return copy.sort((a, b) => order[a.prioridad] - order[b.prioridad] || b.id - a.id);
  }
  return copy.sort((a, b) => b.id - a.id);
}

function createTaskItem(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completada ? ' completed' : ''}`;
  li.dataset.taskId = task.id;

  const main = document.createElement('div');
  main.className = 'task-main';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completada;
  checkbox.dataset.action = 'toggle';
  checkbox.setAttribute('aria-label', `Marcar tarea ${task.texto} como completada`);

  const dataContainer = document.createElement('div');
  dataContainer.className = 'task-data';

  const textSpan = document.createElement('span');
  textSpan.className = `task-text${task.completada ? ' completed' : ''}`;
  textSpan.textContent = task.texto;
  textSpan.dataset.action = 'edit';
  textSpan.tabIndex = 0;
  textSpan.title = 'Doble clic para editar';

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${task.prioridad}`;
  badge.textContent = task.prioridad;

  const created = document.createElement('span');
  created.textContent = `Creada: ${task.creada}`;

  meta.append(badge, created);
  dataContainer.append(textSpan, meta);
  main.append(checkbox, dataContainer);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete';
  deleteButton.title = 'Eliminar tarea';
  deleteButton.textContent = '🗑️';

  actions.append(deleteButton);
  li.append(main, actions);
  return li;
}

function renderTaskList() {
  const visible = getFilteredTasks();
  taskList.innerHTML = '';

  if (visible.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';
  visible.forEach((tarea) => taskList.appendChild(createTaskItem(tarea)));
}

function updateStats() {
  const total = tareas.length;
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = total - completadas;
  const productividad = total === 0 ? 0 : Math.round((completadas / total) * 100);

  statsElement.textContent = `Tienes ${pendientes} tareas pendientes, ${completadas} completadas. Productividad: ${productividad}%.`;
}

function applyFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
  renderTaskList();
}

function applySort(sortValue) {
  activeSort = sortValue;
  renderTaskList();
}

function addTask(texto, prioridad) {
  const tarea = buildTaskObject(texto, prioridad);
  tareas = [tarea, ...tareas];
  saveTasks();
  updateStats();
  renderTaskList();
}

function toggleTaskCompletion(id) {
  tareas = tareas.map((tarea) => {
    if (tarea.id !== id) return tarea;
    return { ...tarea, completada: !tarea.completada };
  });
  saveTasks();
  updateStats();
  renderTaskList();
}

function deleteTask(id) {
  const tarea = tareas.find((item) => item.id === id);
  if (!tarea) return;

  const confirmed = confirm(`¿Eliminar la tarea “${tarea.texto}”?`);
  if (!confirmed) return;

  tareas = tareas.filter((tarea) => tarea.id !== id);
  saveTasks();
  updateStats();
  renderTaskList();
}

function startEditTask(id, currentText) {
  const item = taskList.querySelector(`[data-task-id='${id}']`);
  if (!item) return;

  const textSpan = item.querySelector('.task-text');
  const editInput = document.createElement('input');
  editInput.className = 'edit-input';
  editInput.type = 'text';
  editInput.value = currentText;
  editInput.maxLength = 120;

  textSpan.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const finishEdit = () => {
    const nuevoTexto = editInput.value.trim();
    if (nuevoTexto.length >= 3) {
      tareas = tareas.map((tarea) => (tarea.id === id ? { ...tarea, texto: nuevoTexto } : tarea));
      saveTasks();
      updateStats();
      renderTaskList();
    } else {
      editInput.focus();
      editInput.setSelectionRange(0, editInput.value.length);
    }
  };

  editInput.addEventListener('blur', finishEdit, { once: true });
  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      finishEdit();
    }
    if (event.key === 'Escape') {
      renderTaskList();
    }
  });
}

function exportTasks() {
  const contenido = JSON.stringify(tareas, null, 2);
  const blob = new Blob([contenido], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tareas.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importTasks(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const contenido = JSON.parse(reader.result);
      if (!Array.isArray(contenido) || contenido.some((item) => !validTaskShape(item))) {
        throw new Error('El archivo JSON no tiene la estructura de tareas esperada.');
      }
      tareas = contenido;
      saveTasks();
      updateStats();
      renderTaskList();
      alert('Importación completa. Se restauró el estado de las tareas.');
    } catch (error) {
      alert(`Error al importar el JSON: ${error.message}`);
    }
  };
  reader.onerror = () => {
    alert('No se pudo leer el archivo. Intenta con otro JSON válido.');
  };
  reader.readAsText(file, 'UTF-8');
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const texto = taskTextInput.value;
  const prioridad = taskPrioritySelect.value;

  if (texto.trim().length < 3) {
    alert('Escribe al menos 3 caracteres para la tarea.');
    taskTextInput.focus();
    return;
  }

  addTask(texto, prioridad);
  taskForm.reset();
  taskTextInput.focus();
});

taskList.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  const item = event.target.closest('.task-item');
  if (!item) return;
  const id = Number(item.dataset.taskId);

  if (action === 'toggle') {
    toggleTaskCompletion(id);
  }

  if (action === 'delete') {
    deleteTask(id);
  }
});

taskList.addEventListener('dblclick', (event) => {
  const action = event.target.dataset.action;
  if (action !== 'edit') return;
  const item = event.target.closest('.task-item');
  if (!item) return;
  const id = Number(item.dataset.taskId);
  startEditTask(id, event.target.textContent);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter));
});

sortSelect.addEventListener('change', () => applySort(sortSelect.value));
exportButton.addEventListener('click', exportTasks);
importButton.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  importTasks(file);
  importFileInput.value = '';
});

updateStats();
renderTaskList();
