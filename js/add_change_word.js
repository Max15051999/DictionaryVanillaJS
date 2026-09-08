'use strict'

var container = document.querySelector('.container');
var langsSelector = document.querySelector('#langs-selector');
var addChangeWordBtn = document.querySelector('#add-change-word-btn');
var backBtn = document.querySelector('#back-btn');

var originalWordInput = document.querySelector('#original-word-input');
var translateWordInput = document.querySelector('#translate-word-input');
var transcriptionInput = document.querySelector('#transcription-input');

var symbolsDiv = document.querySelector('#symbols-div');

var GISTWords = [];

var previousUrl = sessionStorage.getItem('prevPage');

function setTitle() {

    var title = '';
    var href = '';

    if (previousUrl === 'home') {
        title = 'Добавить слово';
        href = 'index.html';
    } else {
        var lang = sessionStorage.getItem(DICT_LANG_KEY);

        if (lang.endsWith('ий'))
            lang = lang.replace(/ий$/, 'ом');

        title = `Изменить слово на ${lang}`;
        href = 'dictionary.html';
    }

    document.title = title;

    container.style.display = 'block';
    document.querySelector('h1').innerText = title;

    addChangeWordBtn.innerText = title;
    backBtn.href = href;
}

function setLangs() {

    var currentLangIdx = 0;
    var currentLang = sessionStorage.getItem(DICT_LANG_KEY);

    for (var lang in langCodeMap) {
        var hasAccent = lang.includes('(');
        var accent = '';
        var code = langCodeMap[lang];

        if (code.includes('en-'))
            code = 'en';

        if (hasAccent) {
            var parts = lang.split('(')
            lang = parts[0].trim();
            accent = parts[1].trim();
        }

        if (lang.endsWith('ий'))
            lang = lang.replace(/ий$/, 'ом');

        if (hasAccent)
            lang = `${lang} (${accent}`;

        var option = new Option(lang, lang);
        option.code = code;

        langsSelector.add(option);
    }

    currentLang = currentLang.replace(/ий$/, 'ом');

    if (currentLang === 'Английском')
        currentLang += ' (GB)';

    console.log(currentLang)
    langsSelector.value = currentLang;

    showHideSpecialSymbols(currentLang);
}

function enabledDisabledBtn(currentWord) {
    var originalWord = originalWordInput.value.trim().toLowerCase();
    var translateWord = translateWordInput.value.trim().toLowerCase();
    var transcription = transcriptionInput.value.trim().toLowerCase();

    addChangeWordBtn.disabled = (originalWord === currentWord['original'].toLowerCase()) &&
                                    (translateWord === currentWord['translate'].toLowerCase()) &&
                                    (transcription === currentWord['transcription'].toLowerCase());
}

function setWord(word) {
    console.log(word)

    originalWordInput.value = word['original'];
    translateWordInput.value = word['translate'];
    transcriptionInput.value = word['transcription'];

    originalWordInput.oninput = () => enabledDisabledBtn(word);
    originalWordInput.onchange = () => enabledDisabledBtn(word);

    translateWordInput.oninput = () => enabledDisabledBtn(word);
    translateWordInput.onchange = () => enabledDisabledBtn(word);

    transcriptionInput.oninput = () => enabledDisabledBtn(word);
    transcriptionInput.onchange = () => enabledDisabledBtn(word);

    addChangeWordBtn.disabled = true;
}

function addChangeWordToGIST(changedWord) {
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

            localStorage.setItem(LOCAL_STORAGE_GIST_KEY, JSON.stringify(GISTWords));

            var successMsg = 'Слово успешно добавлено в GIST';

            if (changedWord === null) {
                for (var GISTWord of GISTWords) {
                    if (GISTWord['original'].toLowerCase() === originalWord.toLowerCase()) {
                        alert('Данное слово уже содержится в словаре');
                        return;
                    }
                }
            }

            var word = {
                original: setBigFirstLetter(originalWord),
                translate: setBigFirstLetter(translateWord),
                transcription: transcription,
                language: lang,
                dateToAdd: changedWord === null ?
                                    new Date().toISOString().replace('T', ' ').slice(0, 16) :
                                    changedWord['dateToAdd']
            }

            if (changedWord === null) {
                GISTWords.push(word);
            } else {
                localStorage.setItem(LOCAL_STORAGE_GIST_KEY, JSON.stringify(GISTWords));

                successMsg = 'Слово успешно изменено';

                changedWord = word;

                var idx = GISTWords.findIndex(el => el['original'] === changedWord['original']);

                if (idx !== -1) {
                    GISTWords[idx] = word;
                    addChangeWordBtn.disabled = true;

                    setWord(word);
                } else {
                    alert('Редактируемое Вами слово было уже удалено из GIST!');
                    return;
                }

            }

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
                    var updateResponse = await fetch(API, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify(updateData)
                    });

                    localStorage.setItem(LOCAL_STORAGE_GIST_KEY, JSON.stringify(GISTWords));

                    alert('✅ ' + successMsg);

                    if (changedWord === null) {
                        originalWordInput.value = '';
                        translateWordInput.value = '';
                        transcriptionInput.value = '';
                    }

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
    originalWordInput.dispatchEvent(new Event('change'));
}

function clearInputField(fieldType) {
    switch(fieldType) {
        case 'origin':
            originalWordInput.value = '';
            originalWordInput.dispatchEvent(new Event('change'));
            break;
        case 'translate':
            translateWordInput.value = '';
            translateWordInput.dispatchEvent(new Event('change'));
            break;
        case 'transcription':
            transcriptionInput.value = '';
            transcriptionInput.dispatchEvent(new Event('change'));
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

if (previousUrl === 'dict') {
    var w = JSON.parse(sessionStorage.getItem('editWord'));

    setWord(w);

    var langCode = w['language'] === 'Английский' ? 'en' : langCodeMap[w['language']];

    langsSelector.onchange = () => addChangeWordBtn.disabled = langsSelector.options[langsSelector.selectedIndex].code === langCode;

    addChangeWordBtn.onclick = () => addChangeWordToGIST(w);
}
