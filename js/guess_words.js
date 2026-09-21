'use strict'

var totalWordsInput = document.querySelector('#total-words-input');
var takeFromEndCheckbox = document.querySelector('#take-from-end-checkbox');

var foreignRusBtn = document.querySelector('#foreign-rus');
var rusForeignBtn = document.querySelector('#rus-foreign');

var foreignRusLabel = document.querySelector('#foreign-rus-label');
var rusForeignLabel = document.querySelector('#rus-foreign-label');

var wordCardsBtn = document.querySelector('#word-cards');
var wordTextBtn = document.querySelector('#word-text');

var modalOverlay = document.querySelector('#modalOverlay');
var modalContent = document.querySelector('#modalContent');

var customWordsTotalChose = document.querySelector('#custom-words-total-chose');

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);

var dictWords = [];
var gameWords = [];

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
    var len = gameWords.length;

    if (len === 0) {
        if (fromEnd) {
            for (var i = wordsLen - 1; i >= wordsLen - total; i--)
                gameWords.push(dictWords[i]);
        } else {
            dictWords = shuffle(dictWords);

            for (var i = 0; i < total; i++)
                gameWords.push(dictWords[i]);
        }
    } else if (len !== total) {
        if (total > len) {
            var gameUniqueOriginals = new Set(gameWords.map(gameWord => gameWord['original']))
            dictWords = dictWords.filter(dictWord => !gameUniqueOriginals.has(dictWord['original']));

            dictWords = shuffle(dictWords);

            for (var i = 0; i < total - len; i++)
                gameWords.push(dictWords[i]);

            console.log(gameWords)
        } else {
            while (total !== len)
                gameWords.splice(--len)

            console.log(gameWords)
        }
    }

    var primaryGameLang = foreignRusBtn.checked ? 'foreign' : 'rus';

    localStorage.setItem(PRIMARY_GAME_LANG, primaryGameLang);
    localStorage.setItem(GAME_WORDS_KEY, JSON.stringify(gameWords));
    localStorage.setItem(IS_GAME_WITH_CARDS, withCards);
}

function showCustomAlert() {
    modalOverlay.classList.add('active');
    addWordsOnCustomAlert();
}

function closeModal(isConfirm) {
    modalOverlay.classList.remove('active');

    var len = gameWords.length;

    if (isConfirm && len > 0) {
        totalWordsInput.value = len;

        if (len < 4) {
            wordTextBtn.checked = true;
            wordCardsBtn.disabled = true;
        } else {
            wordCardsBtn.disabled = false;
        }
    } else {
        gameWords = [];
    }

    console.log(gameWords);

}

function confirmModal() {
    closeModal(true);
}

function addWordsOnCustomAlert() {
    customWordsTotalChose.innerText = gameWords.length;

    dictWords.forEach((dictWord, idx) => {
        var wordDiv = document.createElement('div');

        var checkboxId = `word-choose-${idx}`;

        var wordCheckbox = document.createElement('input');
        wordCheckbox.type = 'checkbox';
        wordCheckbox.id = checkboxId;

        var wordLabel = document.createElement('label');
        wordLabel.style.color = 'red';
        wordLabel.style.cursor = 'pointer';
        wordLabel.setAttribute('for', checkboxId);

        var br = document.createElement('br');

        wordLabel.innerText = dictWord['original'];

        wordDiv.appendChild(wordCheckbox);
        wordDiv.appendChild(wordLabel);
        wordDiv.appendChild(br);

        modalContent.appendChild(wordDiv);
    });
}

function customWordClick(event) {
    var target = event.target;

    if (target.tagName === 'INPUT') {
        var parts = target.id.split('-');
        var wordIdx = parts[parts.length - 1];
        var word = dictWords[wordIdx];

        if (target.checked) {
            customWordsTotalChose.innerText = +customWordsTotalChose.innerText + 1;
            gameWords.push(word);
        } else {
            customWordsTotalChose.innerText = +customWordsTotalChose.innerText - 1;
            gameWords = gameWords.filter(gameWord => gameWord['original'] !== word['original']);
        }
    }
}


setTitle();
setWidgets();