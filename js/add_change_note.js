'use strict'

var container = document.querySelector('.container');
var langsSelector = document.querySelector('#langs-selector');
var noteNameInput = document.querySelector('#note-input');
var noteContentTextarea = document.querySelector('#note-content');
var addChangeNoteBtn = document.querySelector('#add-change-note-btn');

var previousUrl = sessionStorage.getItem('prevPage');

var symbolsDiv = document.querySelector('#symbols-div');

var GISTNotes = [];

function setTitle() {

    var title = '';

    if (previousUrl === 'home') {
        title = 'Добавить заметку';
    } else {
        var lang = sessionStorage.getItem(DICT_LANG_KEY);

        if (lang.endsWith('ий'))
            lang = lang.replace(/ий$/, 'ом');

        title = `Изменить заметку на ${lang}`;
    }

    document.title = title;

    container.style.display = 'block';
    document.querySelector('h1').innerText = title;

    addChangeNoteBtn.innerText = title;
}

function setLangs() {

    var currentLang = sessionStorage.getItem(DICT_LANG_KEY);
    var uniqueLangs = new Set();

    for (var lang in langCodeMap) {
        var code = langCodeMap[lang];
        lang = lang.split('(')[0].trim();

        if (!uniqueLangs.has(lang)) {
            uniqueLangs.add(lang);

            if (lang.endsWith('ий'))
                lang = lang.replace(/ий$/, 'ом');

            var option = new Option(lang, lang);
            option.code = code.split('-')[0];

            langsSelector.add(option);
        }
    }

    if (currentLang) {
        currentLang = currentLang.replace(/ий$/, 'ом');

        langsSelector.value = currentLang;

        showHideSpecialSymbols(currentLang);
    }
}

function addChangeNoteToGIST(changedNote) {
    var noteName = noteNameInput.value.trim();
    var noteContent = noteContentTextarea.value.trim();

    var lang = langsSelector.value;

    if (lang.endsWith('ом'))
        lang = lang.replace(/ом$/, 'ий');

    if (noteName === '') {
        alert('Вы не ввели название заметки');
        return;
    }

    if (noteContent === '') {
        alert('Вы не ввели содержание заметки');
        return;
    }

    addChangeNoteBtn.disabled = true;

    try {
        getUpdatedList(NOTES_GIST_ID, NOTES_FILE_NAME).then(result => {

            GISTNotes = result;

            localStorage.setItem(LOCAL_STORAGE_GIST_WORDS_KEY, JSON.stringify(GISTNotes));

            var successMsg = 'Заметка успешно добавлена в GIST';

            if (changedNote === null) {
                for (var GISTNote of GISTNotes) {
                    if (GISTNote['name'].toLowerCase() === noteName.toLowerCase()) {
                        alert('Данная заметка уже содержится в словаре');
                        addChangeNoteBtn.disabled = false;
                        return;
                    }
                }
            }

            var note = {
                name: noteName,
                content: noteContent,
                language: lang,
                dateToAdd: changedNote === null ?
                                    new Date().toISOString().replace('T', ' ').slice(0, 16) :
                                    changedNote['dateToAdd']
            }

            if (changedNote === null) {
                GISTNotes.push(note);
            } else {
                localStorage.setItem(LOCAL_STORAGE_GIST_WORDS_KEY, JSON.stringify(GISTNotes));

                successMsg = 'Заметка успешно изменена';

                var idx = GISTNotes.findIndex(el => el['name'].toLowerCase() === changedNote['name'].toLowerCase());

                if (idx !== -1) {
                    GISTNotes[idx] = note;
                    addChangeNoteBtn.disabled = true;

                    setNote(note);
                } else {
                    alert('Редактируемая Вами заметка была уже удалена из GIST!');
                    addChangeNoteBtn.disabled = false;
                    return;
                }

            }

            var updateData = {
                files: {
                    [NOTES_FILE_NAME]: {
                        content: JSON.stringify(GISTNotes)
                    }
                }
            };

            var token = localStorage.getItem(GIST_TOKEN_NAME);

            var api = BASE_API + NOTES_GIST_ID;

            (async () => {
                try {
                    var updateResponse = await fetch(api, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify(updateData)
                    });

                    localStorage.setItem(LOCAL_STORAGE_GIST_WORDS_KEY, JSON.stringify(GISTNotes));

                    alert('✅ ' + successMsg);

                    if (changedNote === null) {
                        noteNameInput.value = '';
                        noteContentTextarea.value = '';
                        addChangeNoteBtn.disabled = false;
                    }
                } catch(error) {
                    alert('❌ Error updating GIST:', error.message);
                    console.log(error)
                    addChangeNoteBtn.disabled = false;
                }
            })();
        });
    } catch (error) {
        alert('❌ Error updating GIST:', error.message);
        console.log(error)
        addChangeNoteBtn.disabled = false;
    }
}

function showHideSpecialSymbols(lang) {
    var visibility = '';

    if (lang !== 'Немецком')
        visibility = 'hidden';
    else
        visibility = 'visible';

    symbolsDiv.style.visibility = visibility;
}

function setNote(note) {
    noteNameInput.value = note['name'];
    noteContentTextarea.value = note['content'];

    noteNameInput.oninput = () => enabledDisabledBtn(note);
    noteNameInput.onchange = () => enabledDisabledBtn(note);

    noteContentTextarea.oninput = () => enabledDisabledBtn(note);
    noteContentTextarea.onchange = () => enabledDisabledBtn(note);

    addChangeNoteBtn.disabled = true;
}

function clearInputField(inputType) {

    var input = noteNameInput;

    if (inputType === 'content')
        input = noteContentTextarea;

    input.value = '';
    input.dispatchEvent(new Event('change'));
}

function enabledDisabledBtn(currentNote) {
    var noteName = noteNameInput.value.trim().toLowerCase();
    var noteContent = noteContentTextarea.value.trim().toLowerCase();

    addChangeNoteBtn.disabled = (noteName === currentNote['name'].toLowerCase()) &&
                                (noteContent === currentNote['content'].toLowerCase());
}

setTitle();
setLangs();

if (previousUrl === 'dict') {
    var n = JSON.parse(sessionStorage.getItem('editWord'));

    setNote(n);

    var langCode = n['language'] === 'Английский' ? 'en' : langCodeMap[n['language']];

    langsSelector.onchange = function() {
        showHideSpecialSymbols(this.value);
        addChangeNoteBtn.disabled = langsSelector.options[langsSelector.selectedIndex].code === langCode;
    }

    addChangeNoteBtn.onclick = () => addChangeNoteToGIST(n);
}