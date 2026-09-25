'use strict'

var fromLangsSelector = document.querySelector('#from-langs-selector');
var toLangsSelector = document.querySelector('#to-langs-selector');

var specialSymbolsDiv = document.querySelector('#symbols-div');

var inputTextArea = document.querySelector('#input-text');
var outputTextArea = document.querySelector('#output-text');

var getTranslateBtn = document.querySelector('#get-translate-btn');


function fillLangsSelectors() {
    function addOption(lang) {
        var fromLangOption = new Option(lang, lang);
        var toLangOption = new Option(lang, lang);

        fromLangsSelector.add(fromLangOption);
        toLangsSelector.add(toLangOption);
    }

    for (var lang in langCodeMap)
        addOption(lang);

    addOption('Русский');

    fromLangsSelector.value = 'Русский';
}

function showHideSpecialSymbols(selectorNumber) {

    var val1 = fromLangsSelector.value;
    var val2 = toLangsSelector.value;

    var selector = selectorNumber === 1 ? toLangsSelector : fromLangsSelector;

    while(val1.split(' ')[0] === val2.split(' ')[0]) {
        var curIdx = selector.selectedIndex;

        if (curIdx === selector.options.length - 1)
            curIdx = -1;

        curIdx++;

        selector.selectedIndex = curIdx;

        val2 = selector.value;
    }

    var visibility = '';

    if (val1 === 'Немецкий' || val2 === 'Немецкий')
        visibility = 'visible';
    else
        visibility = 'hidden';

    specialSymbolsDiv.style.visibility = visibility;
}

function prepareToSayWord(isFromWord) {
    var text = inputTextArea.value.trim();

    if (text === '') {
        alert('Отсутствует текст для перевода');
        return;
    }

    var lang = '';

    if (isFromWord)
        lang = fromLangsSelector.value
    else
        lang = toLangsSelector.value;

   sayWord(text, langCodeMap[lang]);
}

function sayWord(word, lang) {
    try {
        var sp = new SpeechSynthesisUtterance();
        sp.lang = lang.toLowerCase();
        sp.text = word;
        speechSynthesis.speak(sp);
    } catch (e) {
        alert(`Не удалось произнести слово.\n${e}`);
    }
    // speechSynthesis.cancel();
}

function addSpecialSymbolToInput(specialSymbol) {
    inputTextArea.value += specialSymbol;
}

function textInputListener(widget) {
    getTranslateBtn.disabled = widget.value.trim() === '';
    outputTextArea.value = '';
}

function swapLangs() {
    var firstLang = fromLangsSelector.value;
    fromLangsSelector.value = toLangsSelector.value;
    toLangsSelector.value = firstLang;

    [inputTextArea.value, outputTextArea.value] = [outputTextArea.value, inputTextArea.value];
}

function getTranslate() {
    var text = inputTextArea.value.trim();

    if (text !== '') {
        var fromLang = fromLangsSelector.value === 'Русский' ? 'ru' : langCodeMap[fromLangsSelector.value];
        var toLang = toLangsSelector.value === 'Русский' ? 'ru' : langCodeMap[toLangsSelector.value];

        fromLang = fromLang.split('-')[0];
        toLang = toLang.split('-')[0];

        var api = GOOGLE_API(text, toLang, fromLang);

        (async () => {
            try {
                getTranslateBtn.disabled = true;

                var response = await fetch(api, {
                method: 'GET',
                headers: GOOGLE_API_HEADERS
                });

                if (response.ok) {
                    var translate = await response.text();
                    outputTextArea.value = translate;
                } else {
                    alert('Не удалось получить перевод введённого Вами текста');
                }

                getTranslateBtn.disabled = false;
            } catch(error) {
                alert(`При получении перевода возникла ошибка: ${error}`);
                getTranslateBtn.disabled = false;
            }
        })();
    } else {
        alert('Вы не ввели текст для перевода');
    }
}

fillLangsSelectors();
showHideSpecialSymbols(1);