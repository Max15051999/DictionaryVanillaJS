'use strict'

var modalTitle = document.querySelector('#modalTitle');
var gameOverMsgParagraph = document.querySelector('#game-over-msg');

var foreignRusBtn = document.querySelector('#foreign-rus');
var rusForeignBtn = document.querySelector('#rus-foreign');

var foreignRusLabel = document.querySelector('#foreign-rus-label');
var rusForeignLabel = document.querySelector('#rus-foreign-label');

var wordCardsBtn = document.querySelector('#word-cards');
var wordTextBtn = document.querySelector('#word-text');

var modalOverlay = document.querySelector('#modalOverlay');

function showCustomAlert(title, gameOverMsg) {
    modalOverlay.classList.add('active');

    modalTitle.innerText = title;
    gameOverMsgParagraph.innerText = gameOverMsg;
}

function closeModal() {
    modalOverlay.classList.remove('active');

    window.location.href = 'guess_words.html';
}

function confirmModal() {
    gameWordIndex = 0;
    rightAnswerCounter = 0;
    wrongAnswerCounter = 0;
    modalOverlay.classList.remove('active');

    var key = '';

    if (foreignRusBtn.checked)
        key = 'original';
    else
        key = 'translate';

    wordOriginalKey = key;
    wordTranslateKey = wordOriginalKey === 'original' ? 'translate' : 'original';

    withCards = wordCardsBtn.checked;

    wordChooseInput.style.display = withCards ? 'none' : 'block';
    wordChooseCards.style.display = withCards ? 'block' : 'none';

    console.log(dictLang);
    showHideSpecialSymbols(dictLang);
    fillAccents();
    setWordInfo();
}

dictLang = dictLang.replace(/ом$/, 'ий');

if (dictLang.endsWith('ий')) {
    foreignRusLabel.innerText = `С ${dictLang.replace(/ий$/, 'ого')} на Русский`;
    dictLang = dictLang.replace(/ий$/, 'ом');
}

rusForeignLabel.innerText = `С Русского на ${dictLang}`;

if (wordOriginalKey === 'original')
    foreignRusBtn.checked = true;
else
    rusForeignBtn.checked = true;

if (withCards)
    wordCardsBtn.checked = true;
else
    wordTextBtn.checked = true;

if (totalWords < 4)
    wordCardsBtn.disabled = true;