'use strict'

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);

var gameWords = [];
var gameWordIndex = 0;
var withCards = localStorage.getItem(IS_GAME_WITH_CARDS) === '1';

var totalWordsLabel = document.querySelector('#total-words-label');

var wordCards = document.querySelectorAll('.word-card');

var wordOriginalKey = localStorage.getItem(PRIMARY_GAME_LANG) === 'foreign' ? 'original' : 'translate';
var wordTranslateKey = wordOriginalKey === 'original' ? 'translate' : 'original';

var questionStatusImg = document.querySelector('#question-status');
var rightAnswerLabel = document.querySelector('#right-answer');

var accentsSelector = document.querySelector('#accents-selector');
var sayWordsAutomaticallyCheckbox = document.querySelector('#say_words_automatically_checkbox');

var originalWordLabel = document.querySelector('#original-word');
var transcriptionWordLabel = document.querySelector('#transcription-word');
var translateWordInput = document.querySelector('#translate-input-word');

var wordChooseInput = document.querySelector('.word-choose-input');
var wordChooseCards = document.querySelector('.word-choose-cards');

var symbolsDiv = document.querySelector('#symbols-div');

try {
    gameWords = JSON.parse(localStorage.getItem(GAME_WORDS_KEY));
} catch(error) {
    gameWords = [];
}

var currentWord = null;

var totalWords = gameWords.length;

var rightAnswerCounter = 0;
var wrongAnswerCounter = 0;
var hasIncrementWrong = false;

function fillAccents() {

    if ((dictLang === 'Английский' || dictLang === 'Английском') && wordOriginalKey == 'original') {
        accentsSelector.style.visibility = 'visible';

        for (var lang in langCodeMap) {
            if (lang.includes('Английский')) {
                var option = new Option(lang, lang);
                accentsSelector.add(option);
            }
        }
    }
}

function setTitle() {

    fillAccents();

    if (dictLang.endsWith('ий'))
       dictLang = dictLang.replace(/ий$/, 'ом');

    var title = `Угадай слова на ${dictLang}`;

    document.title = title;
    document.querySelector('h1').innerText = title;

    if (withCards) {
        wordChooseCards.style.display = 'block';

        setCardsVariants();
    } else {
        wordChooseInput.style.display = 'block';
    }

    translateWordInput.addEventListener('keydown', (event) => {
      if (event.code === 'Enter')
        checkTranslateWord();
    });
}

function setCardsVariants() {
    var randIndexes = [gameWordIndex];

    for (var i = 0 ; i < 3; i++) {
        var randVariantIndex = gameWordIndex;
        while(randIndexes.includes(randVariantIndex))
            randVariantIndex = Math.floor(Math.random() * totalWords);

        randIndexes.push(randVariantIndex);
    }

    randIndexes = shuffle(randIndexes);

    var cardIndex = 0;
    for (var wordCard of wordCards) {
        wordCard.classList.remove('active-word-card');
        wordCard.innerText = gameWords[randIndexes[cardIndex++]][wordTranslateKey];
    }
}

function readWordCardText(card) {
    translateWordInput.value = card.innerText;

    var activeClass = 'active-word-card';

    for (var wordCard of wordCards)
        wordCard.classList.remove(activeClass);

    if (!card.classList.contains(activeClass))
        card.classList.add(activeClass);
}

function showHideSpecialSymbols(lang) {
    var visibility = '';

    if (lang !== 'Немецком' || withCards || wordOriginalKey === 'original')
        visibility = 'hidden';
    else
        visibility = 'visible';

    symbolsDiv.style.visibility = visibility;
}

function setWordInfo() {

    if (gameWordIndex < totalWords) {
        currentWord = gameWords[gameWordIndex];
        originalWordLabel.innerText = currentWord[wordOriginalKey];
        transcriptionWordLabel.innerText = wordOriginalKey === 'original' ? currentWord['transcription'] : '';

        translateWordInput.focus();

        if (sayWordsAutomaticallyCheckbox.checked)
            prepareToSayWord(currentWord[wordOriginalKey], dictLang);

        totalWordsLabel.innerText = `${gameWordIndex + 1}/${totalWords}`;

        if (withCards)
            setCardsVariants();

    } else {
        var title = `Игра в слова на ${dictLang} окончена`;

        var gameOverMsg = `
                    Игра в слова окончена. Ваш результат:
                    Всего вопросов: ${totalWords}
                    Правильных ответов: ${rightAnswerCounter}
                    Неправильных ответов: ${wrongAnswerCounter}
                    Процент правильных ответов: ${((rightAnswerCounter * 100) / totalWords).toFixed(2)}%
                    Начать заново?`;

        showCustomAlert(title, gameOverMsg);
//
//        var isRestart = confirm(gameOverMsg);
//
//        if (isRestart) {
//            gameWordIndex = 0;
//            rightAnswerCounter = 0;
//            wrongAnswerCounter = 0;
//            setWordInfo();
//
//        } else {
//            window.location.href = 'guess_words.html';
//        }
    }
}

function prepareToSayWord(word, lang, rate=1) {

    if (word === '')
        return;

    if (wordOriginalKey === 'translate') {
        sayWord(word, 'ru', rate);
        return;
    }

    if (lang === 'Английском') {
        sayWord(word, langCodeMap[accentsSelector.value], rate);
        return;
    }

    var code = '';

    if (lang.includes(' ')) {
        var parts = lang.split(' ');
        lang = parts[0];
        code = parts[1];
   }

   if (lang.endsWith('ом'))
       lang = lang.replace(/ом$/, 'ий');

   if (lang === 'Английский')
       lang += ' ' + code;

   console.log(lang)
   sayWord(word, langCodeMap[lang], rate);
}

function checkTranslateWord() {
    var translate = translateWordInput.value.toLowerCase().trim();

    if (translate !== '') {
        var imgSrc = '';
        var rightAnswer = currentWord[wordTranslateKey];

        translate = replaceSpecialSyms(translate);

        var isAnswerRight = false;

        var wordVariants = rightAnswer.split(',');

        if (wordVariants.length > 1 && !withCards) {

            wordVariants.forEach(word => {
                if (replaceSpecialSyms(word.toLocaleLowerCase().trim()) === translate) {
                    isAnswerRight = true;
                    return;
                }
            });
        } else {
            isAnswerRight = translate === replaceSpecialSyms(rightAnswer.toLocaleLowerCase());
        }

        if (isAnswerRight) {
            imgSrc = 'img/right_answer_icon.png';

            if (hasIncrementWrong)
                hasIncrementWrong = false;
            else
                rightAnswerCounter++;

            setTimeout(() => {
                questionStatusImg.src = 'img/thinking_icon.png';
                rightAnswerLabel.innerText = '';

                gameWordIndex++;
                setWordInfo();
            }, 1000);
        } else {
            imgSrc = 'img/wrong_answer_icon.png';

            if (!hasIncrementWrong) {
                wrongAnswerCounter++;
                hasIncrementWrong = true;
            }
        }

        questionStatusImg.src = imgSrc;
        rightAnswerLabel.innerText = rightAnswer;
        translateWordInput.value = '';
    } else {
        alert('Введите перевод слова');
    }
}

function sayWord(word, lang, rate=1) {
    try {
        var sp = new SpeechSynthesisUtterance();
        sp.lang = lang.toLowerCase();
        sp.text = word;
        sp.rate = rate;
        speechSynthesis.speak(sp);
    } catch (e) {
        alert(`Не удалось произнести слово.\n${e}`);
    }
    // speechSynthesis.cancel();
}

function replaceSpecialSyms(string) {
    var splSyms = {
        'ё': 'е',
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'ß': 'ss',
    }

    for (var [key, value] of Object.entries(splSyms))
        string = string.replaceAll(key, value);

    string = string.replaceAll(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F]/g, '');

    return string;
}

function addSpecialSymbolToInput(symbol) {
    translateWordInput.value += symbol;
}


setTitle();
showHideSpecialSymbols(dictLang);
setWordInfo();