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
    gameOverMsgParagraph.innerHTML = gameOverMsg;
}

function closeModal() {
    modalOverlay.classList.remove('active');

    window.location.href = 'guess_words.html';
}

function confirmModal(withWrong = false, withCashWrong = false) {
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

    if ((dictLang === 'Английский' || dictLang === 'Английском') && wordOriginalKey === 'original')
        accentsSelector.style.visibility = 'visible';
    else
        accentsSelector.style.visibility = 'hidden';

    withCards = wordCardsBtn.checked;

    wordChooseInput.style.display = withCards ? 'none' : 'block';
    wordChooseCards.style.display = withCards ? 'block' : 'none';

    if (withCashWrong) {
        gameWords = cashWrongAnswerWords;
    } else if (!withWrong) {
        try {
            gameWords = JSON.parse(localStorage.getItem(GAME_WORDS_KEY));
        } catch(error) {
            alert('Нет слов для игры');
            gameWords = wrongAnswerWords;
        }
    } else {
        gameWords = wrongAnswerWords;
    }

    wrongAnswerWords = [];

    gameWords = shuffle(gameWords);
    totalWords = gameWords.length;

    if (withCards && totalWords < 4) {
        withCards = false;

        wordChooseInput.style.display = 'block';
        wordChooseCards.style.display = 'none';
    }

    showHideSpecialSymbols(dictLang);
    // fillAccents();
    setWordInfo();
}

dictLang = dictLang.replace(/ом$/, 'ий');

if (dictLang.endsWith('ий')) {
    foreignRusLabel.innerText = `С ${dictLang.replace(/ий$/, 'ого')} на Русский`;
    dictLang = dictLang.replace(/ий$/, 'ом');
}

rusForeignLabel.innerText = `С Русского на ${dictLang.replace(/ом$/, 'ий')}`;

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