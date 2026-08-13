'use strict'

var container = document.querySelector('.container');

var GISTWords = [];

try {
    GISTWords = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GIST_KEY));
} catch {
    GISTWords = [];
}

var uniqueLangs = getUniqueLangs();

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

        href.href = 'dictionary.html';

        href.appendChild(button);

        container.appendChild(href);
        container.appendChild(br);
    }
}

document.querySelector('h1').innerText = `Мои словари (${uniqueLangs.size})`;

setDictionaries();