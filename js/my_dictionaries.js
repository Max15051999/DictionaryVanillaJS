'use strict'

var container = document.querySelector('.container');

var GISTWords = []
var uniqueLangs = new Set();

var dictPage = sessionStorage.getItem('dictPage');
var dictType = sessionStorage.getItem('dictType');
var contentKey = dictType === 'words' ? LOCAL_STORAGE_GIST_WORDS_KEY : LOCAL_STORAGE_GIST_NOTES_KEY;

if ((dictPage === 'home' || dictPage === 'guess') && localStorage.getItem('contentRecourse') === 'gist') {
    var gistId = '';
    var fileName = '';

    if (dictType === 'words') {
        gistId = WORDS_GIST_ID;
        fileName = WORDS_FILE_NAME;
    } else {
        gistId = NOTES_GIST_ID;
        fileName = NOTES_FILE_NAME;
    }

    try {
        getUpdatedList(gistId, fileName).then(result => {
            GISTWords = result;

            if (GISTWords)
                prepareEnvironment();
            else
                window.location.href = 'index.html';
        });
    } catch(error) {

    }
} else {
    GISTWords = JSON.parse(localStorage.getItem(contentKey));
    prepareEnvironment();
}

function prepareEnvironment() {
    uniqueLangs = getUniqueLangs();

    document.querySelector('h1').innerText = `Мои словари (${uniqueLangs.size})`;

    setDictionaries();

    localStorage.setItem(contentKey, JSON.stringify(GISTWords));
}

function getUniqueLangs() {
    var uniqueLangs = new Set();

    for (var wordInfo of GISTWords) {
        var lang = wordInfo['language'];

        if (lang === undefined)
            continue;

        if (uniqueLangs.has(lang))
            continue;

        uniqueLangs.add(lang);
    }

    return uniqueLangs;
}

function setDictionaries() {
    for (let uniqueLang of uniqueLangs) {
        var btnText = '';

        if (uniqueLang.endsWith('ий')) {
            btnText = `Русско-${uniqueLang}`;
        } else {
            btnText = `Русский-${uniqueLang}`;
        }

        var button = document.createElement('button');
        var href = document.createElement('a');
        var br = document.createElement('br');

        button.textContent = btnText;
        button.onclick = () => sessionStorage.setItem(DICT_LANG_KEY, uniqueLang);

        href.href = dictPage === 'guess' || dictPage === 'guess_back' ? 'guess_words.html' : 'dictionary.html';

        href.appendChild(button);

        container.appendChild(href);
        container.appendChild(br);
    }
}