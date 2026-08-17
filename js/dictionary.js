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

        var lang = dictWord['language'];

        console.log(lang)

        if (lang === 'Английский') {
            let langAccentSelector = document.createElement('select');

            langAccentSelector.appendChild(new Option('GB', 'en-GB'));
            langAccentSelector.appendChild(new Option('US', 'en-US'));

            wordCard.appendChild(langAccentSelector);
            wordCard.appendChild(document.createElement('br'));

            console.log(langAccentSelector)

            sayWordImg.onclick = () => prepareSayWord(dictWord['original'], langAccentSelector);
        } else {
            sayWordImg.onclick = () => sayWord(dictWord['original'], langCodeMap[lang]);
        }

        var originalWordTag = document.createElement('h1');
        originalWordTag.className = 'word';
        originalWordTag.innerText = setBigFirstLetter(dictWord['original']);

        var transcriptionTag = document.createElement('h4');
        transcriptionTag.style.color = 'brown';
        transcriptionTag.innerText = dictWord['transcription'];

        var dateTag = document.createElement('h4');
        dateTag.style.color = 'brown';
        dateTag.innerText = dictWord['dateToAdd'];

        originalWordTag.onclick = function() {
            if (this.innerText.toLowerCase() === dictWord['original'].toLowerCase())
                this.innerText = setBigFirstLetter(dictWord['translate']);
            else
                this.innerText = setBigFirstLetter(dictWord['original']);
        }

        wordCard.appendChild(sayWordImg);
        wordCard.appendChild(originalWordTag);
        wordCard.appendChild(transcriptionTag);
        wordCard.appendChild(dateTag);

        container.appendChild(wordCard);
    }
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
    // speechSynthesis.cancel();
}

setTitle();
setWords();