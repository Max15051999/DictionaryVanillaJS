'use strict'

var totalWordsInput = document.querySelector('#total-words-input');
var takeFromEndCheckbox = document.querySelector('#take-from-end-checkbox');

var foreignRusBtn = document.querySelector('#foreign-rus');
var rusForeignBtn = document.querySelector('#rus-foreign');

var foreignRusLabel = document.querySelector('#foreign-rus-label');
var rusForeignLabel = document.querySelector('#rus-foreign-label');

var wordCardsBtn = document.querySelector('#word-cards');
var wordTextBtn = document.querySelector('#word-text');

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);

var dictWords = [];

try {
    var dictWords = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GIST_KEY))
            .filter(GISTWord => GISTWord['language'] === dictLang);
} catch(error) {
    dictWords = [];
}

var wordsLen = dictWords.length;

function setTitle() {

    rusForeignLabel.innerText = `С Русского на ${dictLang}`;

    if (dictLang.endsWith('ий')) {
        foreignRusLabel.innerText = `С ${dictLang.replace(/ий$/, 'ого')} на Русский`;
        dictLang = dictLang.replace(/ий$/, 'ом');
    }

    var title = `Игра в слова на ${dictLang}`;

    document.title = title;
    document.querySelector('h1').innerText = `${title} (${wordsLen})`;
}

function setWidgets() {
    totalWordsInput.max = wordsLen;
    totalWordsInput.value = wordsLen;

    if (wordsLen < 4)
        wordCardsBtn.disabled = true;
}

function onChangeTotalWords(widget) {
    var total = +widget.value;

    if (total < 4) {
        wordCardsBtn.disabled = true;
        wordTextBtn.checked = true;
    } else {
        wordCardsBtn.disabled = false;
    }
}

function startGame() {
    var total = +totalWordsInput.value;
    var withCards = wordCardsBtn.checked ? '1' : '0';

    if (total <= 0 || total > wordsLen) {
        alert('Задано неверное количество слов');
        return;
    }

    if (withCards === '1' && total < 4) {
        alert('Чтобы играть с карточками нужно как минимум 4 слова');
        return;
    }

    var fromEnd = takeFromEndCheckbox.checked;

    var gameWords = [];

    if (fromEnd) {
        for (var i = wordsLen - 1; i >= wordsLen - total; i--)
            gameWords.push(dictWords[i]);
    } else {
        dictWords = shuffle(dictWords);

        for (var i = 0; i < total; i++)
            gameWords.push(dictWords[i]);
    }

    var primaryGameLang = foreignRusBtn.checked ? 'foreign' : 'rus';

    localStorage.setItem(PRIMARY_GAME_LANG, primaryGameLang);
    localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(gameWords));
    localStorage.setItem(IS_GAME_WITH_CARDS, withCards);
}


setTitle();
setWidgets();