'use strict';

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);

var gameWords = [];
var gameWordIndex = 0;
var withCards = localStorage.getItem(IS_GAME_WITH_CARDS) === '1';
var isDictation = localStorage.getItem(IS_DICTATION_WORDS) === '1';
var isWrongVerbs = localStorage.getItem(IS_WRONG_VERBS) === '1';

var totalWordsLabel = document.querySelector('#total-words-label');

var wordCards = document.querySelectorAll('.word-card');
var wrongVerbInputs = document.querySelectorAll('.input-verb');

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
var wordChooseVerbs = document.querySelector('.word-choose-verbs');

var symbolsDiv = document.querySelector('#symbols-div');

try {
    gameWords = JSON.parse(localStorage.getItem(isWrongVerbs ? GAME_VERBS_KEY : GAME_WORDS_KEY));
} catch(error) {
    gameWords = [];
}

var clickedInputIndex = 0;

if (isWrongVerbs) {

    var columns = JSON.parse(localStorage.getItem(GAME_VERBS_COLUMNS_KEY));

    for (var i = 0; i < 3; i++)
        wrongVerbInputs[i].placeholder = columns[i].trim();

    document.querySelector('#auto-voice-div').style.display = 'none';
    document.querySelector('#voice-div').style.display = 'none';
}

gameWords = shuffle(gameWords);

var currentWord = null;

var totalWords = gameWords.length;

var rightAnswerCounter = 0;
var wrongAnswerCounter = 0;
var hasIncrementWrong = false;

var wrongAnswerWords = [];
var cashWrongAnswerWords = [];

function fillAccents() {

    if ((dictLang === 'Английский' || dictLang === 'Английском') && wordOriginalKey === 'original') {
        accentsSelector.style.visibility = 'visible';

        for (var lang in langCodeMap) {
            if (lang.includes('Английский')) {
                var option = new Option(lang, lang);
                accentsSelector.add(option);
            }
        }
    } else {
        accentsSelector.style.visibility = 'hidden';
    }
}

function setTitle() {

    fillAccents();

    if (dictLang.endsWith('ий'))
       dictLang = dictLang.replace(/ий$/, 'ом');

    var title = '';
    if (isDictation)
        title = `Под диктовку на ${dictLang}`;
    else if (isWrongVerbs)
        title = `Неправильные глаголы на ${dictLang}`;
    else
        title = `Угадай слова на ${dictLang}`;

    document.title = title;
    document.querySelector('h1').innerText = title;

    if (withCards) {
        wordChooseCards.style.display = 'block';
        setCardsVariants();
    } else if (isWrongVerbs) {
        wordChooseVerbs.style.display = 'block';
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

    if (lang !== 'Немецком' || withCards || wordOriginalKey === 'original' && !isDictation && !isWrongVerbs)
        visibility = 'hidden';
    else
        visibility = 'visible';

    symbolsDiv.style.visibility = visibility;
}

function setWordInfo() {

    if (gameWordIndex < totalWords) {
        currentWord = gameWords[gameWordIndex];

        if (isWrongVerbs) {
            originalWordLabel.innerText = currentWord[3];

            for (var wrongVerbInput of wrongVerbInputs) {
                wrongVerbInput.value = '';
                wrongVerbInput.style.background = 'white';
            }
        } else if (!isDictation) {
            originalWordLabel.innerText = currentWord[wordOriginalKey];

            if (wordOriginalKey === 'translate' && !withCards) {
                var parts = currentWord['original'].split(' ');

                var color = '';

                if (parts.length > 1) {
                    var firstWord = parts[0].toLowerCase();

                    try {
                        color = gendersColorsWords[dictLang.replace(/ом$/, 'ий')][firstWord];
                    } catch(error) {
                        color = 'SaddleBrown';
                    }
                } else {
                    color = 'SaddleBrown';
                }

                originalWordLabel.style.color = color;
            }

            transcriptionWordLabel.innerText = wordOriginalKey === 'original' ? currentWord['transcription'] : '';
        }

        translateWordInput.focus();

        if (!isWrongVerbs && (sayWordsAutomaticallyCheckbox.checked || isDictation))
            prepareToSayWord(currentWord[wordOriginalKey], dictLang);

        totalWordsLabel.innerText = `${gameWordIndex + 1}/${totalWords}`;

        if (withCards)
            setCardsVariants();

    } else {

        if (cashWrongAnswerWords.length === 0 && wrongAnswerCounter > 0)
            cashWrongAnswerWords = [...wrongAnswerWords];

        var title = `Игра в ${isWrongVerbs ? 'неправильные глаголы' : 'слова'} на ${dictLang} окончена`;

        var wrongAnswerStr = wrongAnswerCounter > 0 ?
                                                    `<a href="#" style='color: red;' onclick='confirmModal(true);'>Неправильных ответов: ${wrongAnswerCounter}</a>` :
                                                    `<b>Неправильных ответов: ${wrongAnswerCounter}</b>`;

        var cashWrongAnswerStr = cashWrongAnswerWords.length > 0 ? `<a href="#" style='color: red;' onclick='confirmModal(false, true);'>Со всеми неправильными ответами</a>` :
                                                                    '';

        var gameOverMsg = `
                    <b>Игра в ${isWrongVerbs ? 'неправильные глаголы' : 'слова'} окончена. Ваш результат:</b><br>
                    <b>Всего вопросов: ${totalWords}</b><br>
                    <b>Правильных ответов: ${rightAnswerCounter}</b><br>
                    ${wrongAnswerStr}<br>
                    <b>Процент правильных ответов: ${((rightAnswerCounter * 100) / totalWords).toFixed(2)}%</b><br>
                    <b>Начать заново?</b> ${cashWrongAnswerStr}`;

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

    if (isDictation)
        word = currentWord[wordOriginalKey];

    if (isWrongVerbs || word === '')
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

   sayWord(word, langCodeMap[lang], rate);
}

function checkTranslateWord() {
    var isAnswerRight = false;
    var wrongVerbsHint = '';

    if (!isWrongVerbs) {
        var translate = translateWordInput.value.toLowerCase().trim();

        if (translate !== '') {
            var imgSrc = '';
            var rightAnswer = currentWord[wordTranslateKey];

            translate = replaceSpecialSyms(translate);

            var wordVariants = rightAnswer.split(',');

            if (wordVariants.length > 1 && !withCards && !isDictation) {

                wordVariants.forEach(word => {
                    if (replaceSpecialSyms(word.toLocaleLowerCase().trim()) === translate) {
                        isAnswerRight = true;
                        return;
                    }
                });
            } else if (isDictation && wordOriginalKey !== 'translate') {
                isAnswerRight = translate === replaceSpecialSyms(currentWord[wordOriginalKey].toLocaleLowerCase());
            } else {
                isAnswerRight = translate === replaceSpecialSyms(rightAnswer.toLocaleLowerCase());
            }
        } else {
            alert('Введите перевод слова');
            return;
        }
    } else {
        isAnswerRight = true;

        for (var i = 0; i < 3; i++) {
            var input = wrongVerbInputs[i];
            var answer = replaceSpecialSyms(input.value.toLowerCase().trim());

            if (answer === '') {
                alert('Заполните все поля');

                for (var wrongVerbInput of wrongVerbInputs)
                    wrongVerbInput.style.background = 'white';

                return;
            }

            var bgColor = '';
            if (answer !== replaceSpecialSyms(currentWord[i].toLowerCase().trim())) {
                bgColor = 'red';
                wrongVerbsHint += currentWord[i] + ' - ';
                isAnswerRight = false;
            } else {
                bgColor = 'green';
            }

            input.style.background = bgColor;
        }

        wrongVerbsHint = wrongVerbsHint.replace(/- $/, '');
    }

    if (isAnswerRight) {
        imgSrc = 'img/right_answer_icon.png';

        if (hasIncrementWrong)
            hasIncrementWrong = false;
        else
            rightAnswerCounter++;

        if (!isWrongVerbs && wordOriginalKey === 'translate')
            sayWord(translate, dictLang === 'Английском' ? 'en' : langCodeMap[dictLang.replace(/ом$/, 'ий')]);

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
            wrongAnswerWords.push(currentWord);
        }
    }

    questionStatusImg.src = imgSrc;

    if (!isWrongVerbs)
        rightAnswerLabel.innerText = isDictation && wordOriginalKey !== 'translate' ? `${currentWord[wordOriginalKey]} (${rightAnswer})` : rightAnswer;
    else
        rightAnswerLabel.innerText = wrongVerbsHint;

    translateWordInput.value = '';
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

function addSpecialSymbolToInput(symbol) {
    if (!isWrongVerbs)
        translateWordInput.value += symbol;
    else
        wrongVerbInputs[clickedInputIndex].value += symbol;
}


setTitle();
showHideSpecialSymbols(dictLang);
setWordInfo();