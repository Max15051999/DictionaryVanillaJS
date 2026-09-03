'use strict'

var container = document.querySelector('.container');
var langsSelector = document.querySelector('#langs-selector');

var originalWordInput = document.querySelector('#original-word-input');
var translateWordInput = document.querySelector('#translate-word-input');
var transcriptionInput = document.querySelector('#transcription-input');

var symbolsDiv = document.querySelector('#symbols-div');

var GISTWords = [];

function setTitle() {
    var previousUrl = sessionStorage.getItem('prevPage');
    var title = '';

    if (previousUrl === 'home')
        title = 'Добавить слово';
    else
        title = 'Изменить слово';

    document.title = title;

    container.style.display = 'block';
    document.querySelector('h1').innerText = title;
}

function setLangs() {

    for (var lang in langCodeMap) {
        if (lang.endsWith('ий'))
            lang = lang.replace(/ий$/, 'ом');

        langsSelector.add(new Option(lang, lang));
    }
}

function addWordToGIST() {
    var originalWord = originalWordInput.value.trim();
    var translateWord = translateWordInput.value.trim();
    var transcription = transcriptionInput.value.trim();

    var lang = langsSelector.value;

    if (lang.includes(' '))
        lang = lang.split(' ')[0];

    if (lang.endsWith('ом'))
        lang = lang.replace(/ом$/, 'ий');

    if (originalWord === '') {
        alert('Вы не ввели слово на иностранном языке');
        return;
    }

    if (translateWord === '') {
        alert('Вы не ввели перевод на русский');
        return;
    }

    try {
        getUpdatedWordsList().then(result => {
            GISTWords = result;

            for (var GISTWord of GISTWords) {
                if (GISTWord['original'].toLowerCase() === originalWord.toLowerCase()) {
                    alert('Данное слово уже содержится в словаре');
                    return;
                }
            }

            var word = {
                original: setBigFirstLetter(originalWord),
                translate: setBigFirstLetter(translateWord),
                transcription: transcription,
                language: lang,
                dateToAdd: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }

            GISTWords.push(word);

            var updateData = {
                files: {
                    [WORDS_FILE_NAME]: {
                        content: JSON.stringify(GISTWords)
                    }
                }
            };

            var token = localStorage.getItem(GIST_TOKEN_NAME);

            (async () => {
                try {
                    var updateResponse = await fetch(URL, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify(updateData)
                    });

                    localStorage.setItem(LOCAL_STORAGE_GIST_KEY, JSON.stringify(GISTWords));

                    alert('✅ Слово успешно добавлено в GIST');

                    originalWordInput.value = '';
                    translateWordInput.value = '';
                    transcriptionInput.value = '';

                } catch(error) {
                    alert('❌ Error updating GIST:', error.message);
                }
            })();
        });
    } catch (error) {
        alert('❌ Error updating GIST:', error.message);
    }
}

function showHideSpecialSymbols(lang) {
    var visibility = '';

    if (lang !== 'Немецком')
        visibility = 'hidden';
    else
        visibility = 'visible';

    symbolsDiv.style.visibility = visibility;
}

function addSpecialSymbolToInput(specialSymbol) {
    originalWordInput.value += specialSymbol;
}

function clearInputField(fieldType) {
    switch(fieldType) {
        case 'origin':
            originalWordInput.value = '';
            break;
        case 'translate':
            translateWordInput.value = '';
            break;
        case 'transcription':
            transcriptionInput.value = '';
            break;
    }
}

function prepareToSayWord() {
    var word = originalWordInput.value.trim();

    if (word === '')
        return;

    var lang = langsSelector.value;

    if (lang.endsWith('ом'))
        lang = lang.replace(/ом$/, 'ий');

    sayWord(word, langCodeMap[lang]);
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
setLangs();