'use strict'

var searchInput = document.querySelector('#search-input');
var container = document.querySelector('.container');

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);

var dictWords = [];

try {
    var dictWords = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GIST_KEY))
            .filter(GISTWord => GISTWord['language'] === dictLang);
} catch (error) {
    dictWords = [];
}

function setTitle() {
    var dictName = `${dictLang} словарь`;

    document.title = dictName;
    document.querySelector('h1').innerText = `${dictName} (${dictWords.length})`;
}

function setWords() {

    dictWords.forEach((dictWord, idx) => {
        var wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        wordCard.id = `word-${idx}`;


        var sayWordImg = document.createElement('img');
        sayWordImg.src = 'img/say_word_icon.png';

        sayWordImg.style.width = '9%';
        sayWordImg.style.height = '7%';
        sayWordImg.style.marginTop = '5%';

        var lang = dictWord['language'];

        var sayWordImgFunc;

        if (lang === 'Английский') {
            let langAccentSelector = document.createElement('select');

            langAccentSelector.appendChild(new Option('GB', 'en-GB'));
            langAccentSelector.appendChild(new Option('US', 'en-US'));

            wordCard.appendChild(langAccentSelector);
            wordCard.appendChild(document.createElement('br'));

            sayWordImgFunc = () => prepareSayWord(dictWord['original'], langAccentSelector);
        } else {
            sayWordImgFunc = () => sayWord(dictWord['original'], langCodeMap[lang]);
        }

        var originalWordTag = document.createElement('h1');
        originalWordTag.className = 'word';

        var transcriptionTag = document.createElement('h4');
        transcriptionTag.style.color = 'brown';

        var dateTag = document.createElement('h4');
        dateTag.style.color = 'brown';

        setWidgetsProps(sayWordImg, originalWordTag, transcriptionTag, dateTag, sayWordImgFunc, dictWord);

        wordCard.appendChild(sayWordImg);
        wordCard.appendChild(originalWordTag);
        wordCard.appendChild(transcriptionTag);
        wordCard.appendChild(dateTag);

        container.appendChild(wordCard);
    });
}

function prepareSayWord(word, selector) {
    sayWord(word, selector.value);
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
}

function searchWordByInput() {
    var inputWord = searchInput.value.toLowerCase().trim();

    if (inputWord === '') {
            dictWords.forEach((_, idx) => {
                var wordCard = document.querySelector(`#word-${idx}`);
                wordCard.style.display = 'block';
            });
            document.querySelector('h1').innerText = document.querySelector('h1').innerText.replace(/\d+/g, dictWords.length);
    }

    var findWordIndexes = new Set();
    dictWords.forEach((word, idx) => {
        if (word['original'].toLowerCase().includes(inputWord)) {
            findWordIndexes.add(idx);
        } else if (word['translate'].toLowerCase().includes(inputWord)) {
            findWordIndexes.add(idx);
        }
    });

    var totalMatches = findWordIndexes.size;
    if (totalMatches > 0) {
        if (totalMatches === 1) {
            var wordCard = document.querySelector(`#word-${findWordIndexes.values().next().value}`);
            wordCard.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
        } else {
            dictWords.forEach((_, idx) => {
                var display = '';

                if (findWordIndexes.has(idx))
                    display = 'block';
                else
                    display = 'none';

                var wordCard = document.querySelector(`#word-${idx}`);
                wordCard.style.display = display;
            });

            document.querySelector('h1').innerText = document.querySelector('h1').innerText.replace(/\d+/g, totalMatches);
        }
    } else {
        alert('Совпадений не найдено');
    }

    searchInput.value = '';
}

function sortWords(sortType) {
    if (dictWords.length === 1)
        return;

    if (sortType == 'alphabet')
        dictWords = dictWords.sort((wordInfo, wordInfo2) => wordInfo['original'].localeCompare(wordInfo2['original']));
    else
        dictWords = dictWords.sort((wordInfo, wordInfo2) => new Date(wordInfo2['dateToAdd']) - new Date(wordInfo['dateToAdd']));

    var wordCards = document.querySelectorAll('.word-card');

    dictWords.forEach((dictWord, idx) => {
        var wordCard = wordCards[idx];

        var transcriptionDateTags = wordCard.querySelectorAll('h4');

        var langAccentSelector = wordCard.querySelector('select');
        var sayWordImg = wordCard.querySelector('img');
        var originalWordTag = wordCard.querySelector('h1');
        var transcriptionTag = transcriptionDateTags[0];
        var dateTag = transcriptionDateTags[1];

        setWidgetsProps(sayWordImg, originalWordTag, transcriptionTag, dateTag,
            () => prepareSayWord(dictWord['original'], langAccentSelector), dictWord);
    });
}

function setWidgetsProps(sayWordImg, originalWordTag, transcriptionTag, dateTag, sayWordImgFunc, dictWord) {
    sayWordImg.onclick = sayWordImgFunc;
    originalWordTag.innerText = setBigFirstLetter(dictWord['original']);
    transcriptionTag.innerText = dictWord['transcription'];
    dateTag.innerText = dictWord['dateToAdd'];

    originalWordTag.onclick = function() {
        if (this.innerText.toLowerCase() === dictWord['original'].toLowerCase())
            this.innerText = setBigFirstLetter(dictWord['translate']);
        else
            this.innerText = setBigFirstLetter(dictWord['original']);
    }
}

setTitle();
setWords();