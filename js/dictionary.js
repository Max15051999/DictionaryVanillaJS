'use strict'

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

    for (let dictWord of dictWords) {
        var wordCard = document.createElement('div');
        wordCard.className = 'word-card';

        var sayWordImg = document.createElement('img');
        sayWordImg.src = 'img/say_word_icon.png';

        sayWordImg.style.width = '9%';
        sayWordImg.style.height = '7%';
        sayWordImg.style.marginTop = '5%';
        sayWordImg.onclick = () => sayWord(dictWord['original'], langCodeMap[dictLang]);

        var originalWordTag = document.createElement('h1');
        originalWordTag.className = 'word';
        originalWordTag.innerText = setBigFirstLetter(dictWord['original']);

        originalWordTag.onclick = function() {
            if (this.innerText.toLowerCase() === dictWord['original'].toLowerCase())
                this.innerText = setBigFirstLetter(dictWord['translate']);
            else
                this.innerText = setBigFirstLetter(dictWord['original']);
        }

        wordCard.appendChild(sayWordImg);
        wordCard.appendChild(originalWordTag);

        container.appendChild(wordCard);
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

setTitle();
setWords();