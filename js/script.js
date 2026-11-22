/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   01  |  CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const API_URL = './api/notes.php';


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   02  |  DOM ELEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ---------- Navbar ---------- */
const searchInput = document.querySelector('.search');
const sunBtn = document.querySelector('.theme-btn.sun');
const moonBtn = document.querySelector('.theme-btn.moon');

/* ---------- Yeni qeyd formu ---------- */
const form = document.querySelector('.notes-form');
const titleInput = document.querySelector('.note-title');
const titleError = document.querySelector('#title-error');
const contentInput = document.querySelector('.note-content');
const wordCountElement = document.querySelector('.word-count');
const charCountElement = document.querySelector('.char-count');
const cancelBtn = document.querySelector('#cancel-btn');
const submitBtn = document.querySelector('#submit-btn');

/* ---------- Qeydlər siyahısı ---------- */
const notesCount = document.querySelector('.notes-count');
const notesList = document.querySelector('.notes-list');
const emptyBox = document.querySelector('.empty');
const sortButtons = document.querySelectorAll('.sort-btn');

/* ---------- Modal: baxış paneli ---------- */
const modal = document.querySelector('#note-modal');
const modalBox = document.querySelector('#modal-box');
const viewPanel = document.querySelector('#modal-view');
const viewTitle = document.querySelector('#view-title');
const viewContent = document.querySelector('#view-content');
const viewDate = document.querySelector('#view-date');
const viewStats = document.querySelector('#view-stats');
const modalCloseBtn = document.querySelector('.modal-close');
const openEditBtn = document.querySelector('#open-edit-btn');
const openDeleteBtn = document.querySelector('#open-delete-btn');

/* ---------- Modal: redaktə paneli ---------- */
const editPanel = document.querySelector('#modal-edit');
const editForm = document.querySelector('#modal-edit-form');
const editTitleInput = document.querySelector('#edit-title');
const editTitleError = document.querySelector('#edit-title-error');
const editContentInput = document.querySelector('#edit-content');
const cancelEditBtn = document.querySelector('#cancel-edit-btn');
const saveEditBtn = document.querySelector('#save-edit-btn');
const editStats = document.querySelector('#edit-stats');
const editCountWordElement = document.querySelector('#edit-count-word');
const editCountCharElement = document.querySelector('#edit-count-char');

/* ---------- Modal: silmə paneli ---------- */
const deletePanel = document.querySelector('#modal-delete');
const cancelDeleteBtn = document.querySelector('#cancel-delete-btn');
const confirmDeleteBtn = document.querySelector('#confirm-delete-btn');
const deleteError = document.querySelector('#delete-error');


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   03  |  STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let notes = [];
let sortMode = 'newest';
let searchQuery = '';
let activeNote = null;


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   04  |  UTILITY FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function countWord(text) {
    const trimmed = text.trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

function countChar(text) {
    return text.length;
}

function sortNotes(list, mode) {

    const sorted = [...list];

    switch (mode) {
        case 'newest':
            sorted.sort((a, b) => b.createdAt - a.createdAt);
            break;
        case 'oldest':
            sorted.sort((a, b) => a.createdAt - b.createdAt);
            break;
        case 'az':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'az'));
            break;
    }

    return sorted;
}

function searchNotes(list, query) {

    const cleanQuery = query.trim().toLowerCase();

    return list.filter(note =>
        note.title.toLowerCase().includes(cleanQuery) ||
        note.content.toLowerCase().includes(cleanQuery)
    );
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   05  |  RENDER & UI FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function updateFormStats() {
    charCountElement.textContent = `${countChar(contentInput.value)} simvol`;
    wordCountElement.textContent = `${countWord(contentInput.value)} söz`;
}

function updateEditStats() {
    editCountCharElement.textContent = `${countChar(editContentInput.value)} simvol`;
    editCountWordElement.textContent = `${countWord(editContentInput.value)} söz`;
}

function createCard(note) {
    const noteCard = document.createElement('article');
    noteCard.classList.add('note-card');

    const noteCardTitle = document.createElement('h3');
    noteCardTitle.classList.add('note-card-title');
    noteCardTitle.textContent = note.title;

    const noteCardContent = document.createElement('p');
    noteCardContent.classList.add('note-card-content');
    noteCardContent.textContent = note.content;

    const noteCardFooter = document.createElement('div');
    noteCardFooter.classList.add('note-card-footer');

    const noteCardDate = document.createElement('span');
    noteCardDate.classList.add('note-card-date');
    noteCardDate.textContent = note.date;

    const noteCardStats = document.createElement('span');
    noteCardStats.classList.add('note-card-stats');
    noteCardStats.textContent = `${countWord(note.content)} söz, ${countChar(note.content)} simvol`;

    noteCardFooter.append(noteCardDate, noteCardStats);
    noteCard.append(noteCardTitle, noteCardContent, noteCardFooter);

    noteCard.addEventListener('click', () => openModal(note));
    return noteCard;
}

function render() {

    const visibleNotes = sortNotes(searchNotes(notes, searchQuery), sortMode);

    notesCount.textContent = `${visibleNotes.length} qeyd`;

    notesList.innerHTML = '';
    visibleNotes.forEach(note => notesList.append(createCard(note)));

    emptyBox.textContent = 'Göstəriləcək qeyd yoxdur.';
    emptyBox.hidden = visibleNotes.length > 0;
}

function openModal(note) {
    modal.hidden = false;
    activeNote = note;
    showPanel('view');
    viewTitle.textContent = note.title;
    viewContent.textContent = note.content;
    viewDate.textContent = note.date;
    viewStats.textContent = `${countWord(note.content)} söz, ${countChar(note.content)} simvol`;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
}

function showPanel(panelName) {
    viewPanel.hidden = panelName !== 'view';
    editPanel.hidden = panelName !== 'edit';
    deletePanel.hidden = panelName !== 'delete';

    modalBox.classList.toggle('modal-box-small', panelName === 'delete');
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   06  |  API FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function apiRequest(url, options = {}) {
    let response;

    try {
        response = await fetch(url, options);
    } catch {
        throw new Error('Serverlə əlaqə qurulmadı.');
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('Serverdən düzgün cavab gəlmədi.');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Xəta baş verdi.');
    }

    return data;
}

async function getNotes(url) {
    return apiRequest(url);
}

async function createNote(url, title, content) {
    return apiRequest(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    });
}

async function updateNote(url, id, title, content) {
    return apiRequest(`${url}?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    });
}

async function deleteNote(url, id) {
    return apiRequest(`${url}?id=${id}`, {
        method: 'DELETE'
    });
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   07  |  EVENT HANDLERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ---------- Yükləmə ---------- */
async function loadNotes() {
    try {
        notes = await getNotes(API_URL);
        render();
    } catch (error) {
        emptyBox.hidden = false;
        emptyBox.textContent = error.message;
    }
}

/* ---------- Yeni qeyd formu ---------- */
async function handleSubmit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    titleError.textContent = '';

    if (!title) {
        titleError.textContent = 'Zəhmət olmasa başlığı daxil edin!';
        return;
    }

    submitBtn.disabled = true;

    try {
        const newNote = await createNote(API_URL, title, content);
        notes.push(newNote);
        handleCancel();
        render();
    } catch (error) {
        titleError.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
    }
}

function handleCancel() {
    form.reset();
    titleError.textContent = '';
    updateFormStats();
}

/* ---------- Axtarış və sıralama ---------- */
function handleSearch() {
    searchQuery = searchInput.value;
    render();
}

function handleSort(clickedBtn) {
    sortMode = clickedBtn.dataset.sort;
    sortButtons.forEach(btn => btn.classList.toggle('active', btn === clickedBtn));
    render();
}

/* ---------- Redaktə ---------- */
function handleEditOpen() {
    editTitleInput.value = activeNote.title;
    editContentInput.value = activeNote.content;
    editTitleError.textContent = '';
    updateEditStats();
    showPanel('edit');
}

async function handleEditSubmit(e) {
    e.preventDefault();

    const title = editTitleInput.value.trim();
    const content = editContentInput.value.trim();

    editTitleError.textContent = '';

    if (!title) {
        editTitleError.textContent = 'Zəhmət olmasa başlığı daxil edin!';
        return;
    }

    saveEditBtn.disabled = true;

    try {
        const updated = await updateNote(API_URL, activeNote.id, title, content);
        const index = notes.findIndex(note => note.id === updated.id);

        if (index !== -1) {
            notes[index] = updated;
        }

        render();
        openModal(updated);
    } catch (error) {
        editTitleError.textContent = error.message;
    } finally {
        saveEditBtn.disabled = false;
    }
}

/* ---------- Silmə ---------- */
function handleDeleteOpen() {
    deleteError.textContent = '';
    showPanel('delete');
}

async function handleDeleteConfirm() {
    confirmDeleteBtn.disabled = true;

    try {
        await deleteNote(API_URL, activeNote.id);
        notes = notes.filter(note => note.id !== activeNote.id);
        render();
        closeModal();
    } catch (error) {
        deleteError.textContent = error.message;
    } finally {
        confirmDeleteBtn.disabled = false;
    }
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   08  |  EVENT LISTENERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ---------- Tema ---------- */
sunBtn.addEventListener('click', () => document.body.classList.remove('dark-mode'));
moonBtn.addEventListener('click', () => document.body.classList.add('dark-mode'));

/* ---------- Yeni qeyd formu ---------- */
form.addEventListener('submit', handleSubmit);
cancelBtn.addEventListener('click', handleCancel);
titleInput.addEventListener('input', () => titleError.textContent = '');
contentInput.addEventListener('input', updateFormStats);

/* ---------- Axtarış və sıralama ---------- */
searchInput.addEventListener('input', handleSearch);
sortButtons.forEach(sortBtn => sortBtn.addEventListener('click', () => handleSort(sortBtn)));

/* ---------- Modal ---------- */
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
modalCloseBtn.addEventListener('click', closeModal);

/* ---------- Modal: redaktə ---------- */
openEditBtn.addEventListener('click', handleEditOpen);
cancelEditBtn.addEventListener('click', () => showPanel('view'));
editContentInput.addEventListener('input', updateEditStats);
editForm.addEventListener('submit', handleEditSubmit);

/* ---------- Modal: silmə ---------- */
openDeleteBtn.addEventListener('click', handleDeleteOpen);
cancelDeleteBtn.addEventListener('click', () => showPanel('view'));
confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   09  |  INITIALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function init() {
    loadNotes();
    updateFormStats();
}

init();
