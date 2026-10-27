'use strict'

var uploadDictBtn = document.querySelector('#upload-dict-btn');
var fileInput = document.querySelector('#file-input');
var symbolsDiv = document.querySelector('#symbols-div');
var searchInput = document.querySelector('#search-input');
var container = document.querySelector('.container');

var addNoteBtn = document.querySelector('#add-note-btn');

var divWithWordCards = document.createElement('div');
divWithWordCards.id = 'main-div-with-words';
divWithWordCards.onclick = () => divWithWordCardsOnClick(event);

container.appendChild(divWithWordCards);

var dictLang = sessionStorage.getItem(DICT_LANG_KEY);
var dictType = sessionStorage.getItem('dictType');

if (dictType === 'words')
    addNoteBtn.style.display = 'none';

var dictWords = [];
var checkedWords = {};
var checkedWordsCounter = 0;

var contentKey = dictType === 'words' ? LOCAL_STORAGE_GIST_WORDS_KEY : LOCAL_STORAGE_GIST_NOTES_KEY;

try {
    var dictWords = JSON.parse(localStorage.getItem(contentKey))
            .filter(GISTWord => GISTWord['language'] === dictLang);
} catch(error) {
    dictWords = [];
}

function divWithWordCardsOnClick(event) {
    var t = event.target;

    var actionClass = t.className;
    var parentElement = t.parentElement;

    if (parentElement.className === 'word-card') {
        var focusedWordIndex = parentElement.id.split('-')[1];
        var focusedWord = dictWords[focusedWordIndex];

        var key = dictType === 'words' ? 'original' : 'name';
        switch (actionClass) {
            case 'speaker': {
                if (dictType === 'words') {
                    if (dictLang === 'Английский') {
                        var langAccentSelector = parentElement.querySelector('select');

                        prepareSayWord(focusedWord['original'], langAccentSelector);
                    } else {
                        sayWord(focusedWord['original'], langCodeMap[dictLang]);
                    }
                }
                break;
            }
            case 'word': {
                if (dictType === 'words') {
                    if (t.innerText.toLowerCase() === focusedWord['original'].toLowerCase())
                        t.innerText = setBigFirstLetter(focusedWord['translate']);
                    else
                        t.innerText = setBigFirstLetter(focusedWord['original']);
                }
                break;
            }
            case 'editor': {
                sessionStorage.setItem('prevPage', 'dict');
                sessionStorage.setItem('editWord', JSON.stringify(focusedWord));
                sessionStorage.setItem(DICT_LANG_KEY, dictLang);

                var href = dictType === 'words' ? 'add_change_word.html' : 'add_change_note.html';
                window.location.href = href;
                break;
            }
            case 'deletor': {
                if (confirm(`Вы действительно хотите удалить ${dictType === 'words' ? 'слово' : 'заметку'} ${setBigFirstLetter(focusedWord[key])} ?`)) {
                    var GISTWords = JSON.parse(localStorage.getItem(contentKey)).filter((w) => w[key].toLowerCase() !== focusedWord[key].toLowerCase() &&
                                                                                            w['language'] !== focusedWord['language']);

                    var updateData = {
                        files: {
                            [dictType === 'words' ? WORDS_FILE_NAME : NOTES_FILE_NAME]: {
                                content: JSON.stringify(GISTWords)
                            }
                        }
                    };

                    var token = localStorage.getItem(GIST_TOKEN_NAME);

                    var api = BASE_API + (dictType === 'words' ? WORDS_GIST_ID : NOTES_GIST_ID);

                    (async () => {
                        try {
                            var updateResponse = await fetch(api, {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `token ${token}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/vnd.github.v3+json'
                                },
                                body: JSON.stringify(updateData)
                            });

                            if (!updateResponse.ok) {
                                alert(`При обновлении GIST возникла ошибка. Статус-код: ${updateResponse.status}`);
                                return;
                            }

                            localStorage.setItem(contentKey, JSON.stringify(GISTWords));

                            if (dictType === 'words')
                                alert(`Слово ${setBigFirstLetter(focusedWord[key])} успешно удалено`);
                            else
                                alert(`Заметка ${focusedWord[key]} успешно удалена`);

                            dictWords.splice(focusedWordIndex, 1);

                            if (dictWords.length === 0) {
                                window.location.href = 'my_dictionaries.html';
                            } else {
                                parentElement.style.display = 'none';
                                parentElement.remove();
                                setTitle();
                                updateWordCardIds();
                            }

                        } catch(error) {
                            alert('❌ Error updating GIST:', error.message);
                        }
                    })();
            }
                break;
            }
            case 'checker': {
                if (t.checked) {
                    checkedWords[focusedWord['original']] = {'word': focusedWord, 'card': parentElement};
                    checkedWordsCounter++;
                } else {
                    delete checkedWords[focusedWord['original']];
                    checkedWordsCounter--;
                }
                break;
            }
        }
    }
}

function setTitle() {
    var dictName = `${dictLang} словарь`;

    document.title = dictName;

    var wordBase = '';
    var possibleEnds = [];

    if (dictType === 'words') {
        wordBase = 'слов';
        possibleEnds = ['о', 'а', ''];
    } else {
        wordBase = 'замет';
        possibleEnds = ['ка', 'ки', 'ок'];
    }

    document.querySelector('h1').innerText = `${dictName} (${dictWords.length} ${chooseRightEnding(wordBase, possibleEnds, dictWords.length)})`;

    if (dictLang !== 'Немецкий')
        symbolsDiv.style.display = 'none';
}

function setWords(words, startWordIndex, isExist) {
    var imgWidth = '12%';
    var imgHeight = '9%';

    var wordCards = document.querySelectorAll('.word-card');

    var dateTagIndex = dictType === 'words' ? 1 : 0;

    words.forEach(dictWord => {
        let wordCard = null;
        var sayWordImg = null;
        var sayWordImgFunc = null;
        let langAccentSelector = null;
        var originalWordTag = null;
        var transcriptionTag = null;
        var dateTag = null;
        var deleteWordImg = null;
        var editWordImg = null;
        var wordChecker = null;
        var wordCheckerLabel = null;

        if (isExist) {
            wordCard = wordCards[startWordIndex];

            var imgTags = wordCard.querySelectorAll('img');
            var h4Tags = wordCard.querySelectorAll('h4');

            if (dictType === 'words') {
                sayWordImg = imgTags[0];

                if (dictLang === 'Английский') {
                    langAccentSelector = wordCard.querySelector('select');
                    sayWordImgFunc = () => prepareSayWord(dictWord['original'], langAccentSelector);
                } else {
                    sayWordImgFunc = () => sayWord(dictWord['original'], langCodeMap[dictLang]);
                }

                transcriptionTag = h4Tags[0];
            }

            originalWordTag = wordCard.querySelector('h1');

            dateTag = h4Tags[dateTagIndex];

            deleteWordImg = imgTags[1];

            editWordImg = imgTags[2];
        } else {
            wordCard = document.createElement('div');
            wordCard.className = 'word-card';
            wordCard.id = `word-${startWordIndex}`;

            if (dictType === 'words') {
                sayWordImg = document.createElement('img');
                sayWordImg.src = 'img/say_word_icon.png';
                sayWordImg.classList.add('speaker');

                sayWordImg.style.width = imgWidth;
                sayWordImg.style.height = imgHeight;
                sayWordImg.style.marginTop = '5%';

                if (dictLang === 'Английский') {
                    langAccentSelector = document.createElement('select');

                    langAccentSelector.appendChild(new Option('GB', 'en-GB'));
                    langAccentSelector.appendChild(new Option('US', 'en-US'));

                    wordCard.appendChild(langAccentSelector);
                    wordCard.appendChild(document.createElement('br'));

                    sayWordImgFunc = () => prepareSayWord(dictWord['original'], langAccentSelector);
                } else {
                    sayWordImgFunc = () => sayWord(dictWord['original'], langCodeMap[dictLang]);
                }
            }

            originalWordTag = document.createElement('h1');
            originalWordTag.className = 'word';

            if (dictType === 'words') {
                transcriptionTag = document.createElement('h4');
                transcriptionTag.style.color = 'brown';
            }

            dateTag = document.createElement('h4');
            dateTag.style.color = 'brown';

            deleteWordImg = document.createElement('img');
            deleteWordImg.src = 'img/delete_word_icon.png';

            deleteWordImg.style.width = imgWidth;
            deleteWordImg.style.height = imgHeight;

            deleteWordImg.title = 'Удалить';
            deleteWordImg.className = 'deletor';

            editWordImg = document.createElement('img');

            editWordImg.src = 'img/edit_icon.png';

            editWordImg.style.width = imgWidth;
            editWordImg.style.height = imgHeight;

            editWordImg.title = 'Редактировать';
            editWordImg.className = 'editor';

            wordChecker = document.createElement('input');
            wordChecker.type = 'checkbox';
            wordChecker.id = `checker-${startWordIndex}`;
            wordChecker.className = 'checker';
            wordChecker.style.marginLeft = '120%';

            wordCheckerLabel = document.createElement('label');
            wordCheckerLabel.innerText = 'Выделить';
            wordCheckerLabel.style.fontSize = '20px';
            wordCheckerLabel.style.marginLeft = '115%';
            wordCheckerLabel.htmlFor = `checker-${startWordIndex}`;

            if (dictType === 'words')
                wordCard.appendChild(sayWordImg);

            wordCard.appendChild(originalWordTag);

            if (dictType === 'words')
                wordCard.appendChild(transcriptionTag);

            wordCard.appendChild(dateTag);
            wordCard.appendChild(deleteWordImg);
            wordCard.appendChild(editWordImg);
            wordCard.appendChild(wordChecker);
            wordCard.appendChild(wordCheckerLabel);

            divWithWordCards.appendChild(wordCard);
        }

        originalWordTag.innerText = setBigFirstLetter(dictWord[dictType === 'words' ? 'original' : 'name']);

        if (dictType === 'words')
            transcriptionTag.innerText = dictWord['transcription'];

        dateTag.innerText = dictWord['dateToAdd'];

        startWordIndex++;
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
    var inputWord = replaceSpecialSyms(searchInput.value.toLowerCase().trim());

    if (inputWord === '') {
            dictWords.forEach((_, idx) => {
                var wordCard = document.querySelector(`#word-${idx}`);
                wordCard.style.display = 'block';
            });
            document.querySelector('h1').innerText = document.querySelector('h1').innerText.replace(/\([^)]*\)/g, `(${dictWords.length} ${chooseRightEnding('слов', ['о', 'а', ''], dictWords.length)})`);
    }

    var findWordIndexes = new Set();
    dictWords.forEach((word, idx) => {
        if (replaceSpecialSyms(word['original'].toLowerCase()).includes(inputWord)) {
            findWordIndexes.add(idx);
        } else if (replaceSpecialSyms(word['translate'].toLowerCase()).includes(inputWord)) {
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

            document.querySelector('h1').innerText = document.querySelector('h1').innerText.replace(/\([^)]*\)/g, `(${totalMatches} ${chooseRightEnding('слов', ['о', 'а', ''], totalMatches)})`);
        }
    } else {
        alert('Совпадений не найдено');
    }

    searchInput.value = '';
}

function sortWords(sortType) {
    if (dictWords.length === 1)
        return;

    if (sortType == 'alphabet') {
        var key = dictType === 'words' ? 'original' : 'name';
        dictWords = dictWords.sort((wordInfo, wordInfo2) => wordInfo[key].localeCompare(wordInfo2[key]));
    } else {
        dictWords = dictWords.sort((wordInfo, wordInfo2) => new Date(wordInfo2['dateToAdd']) - new Date(wordInfo['dateToAdd']));
    }

    setWords(dictWords, 0, true);
}

function deleteAllWords() {
    var remainWords = [];
    var deletedWords = [];

    if (checkedWordsCounter === 0) {
        if (confirm('Вы действительно хотите удалить все слова из этого словаря?'))
            deletedWords = dictWords;
        else
            return;
    } else {
        if (confirm(`Вы действительно хотите удалить ${checkedWordsCounter} ${chooseRightEnding('слов', ['о', 'а', ''], checkedWordsCounter)} из этого словаря?`))
            deletedWords = Object.values(checkedWords).map(el => el['word']);
        else
            return;
    }

    var GISTWords = JSON.parse(localStorage.getItem(contentKey));
    var uniqueOriginals = new Set(deletedWords.map(deletedWord => `${deletedWord['original']}-${deletedWord['language']}`));
    remainWords = GISTWords.filter(GISTWord => !uniqueOriginals.has(`${GISTWord['original']}-${GISTWord['language']}`));

    var updateData = {
        files: {
            [WORDS_FILE_NAME]: {
                content: JSON.stringify(remainWords)
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

            localStorage.setItem(contentKey, JSON.stringify(remainWords));

            if (checkedWordsCounter > 0 && checkedWordsCounter !== dictWords.length) {

                dictWords = dictWords.filter(dictWord => !checkedWords.hasOwnProperty(dictWord['original']));

                Object.values(checkedWords).map(el => el['card']).forEach(card => {
                    card.style.display = 'none';
                    card.remove();
                });

                setTitle();

                checkedWords = {};
                checkedWordsCounter = 0;

                updateWordCardIds();
            } else {
                alert('Все слова из данного словаря успешно удалены');
                window.location.href = 'my_dictionaries.html';
            }

        } catch(error) {
            alert('❌ Error updating GIST:', error.message);
        }
    })();
}

function updateWordCardIds() {
    var idx = 0;
    for (var cardDiv of divWithWordCards.children)
        cardDiv.id = `word-${idx++}`;
}

function downloadDict() {

    var data = [];
    var columns = Array.from(USING_COLUMNS_IN_CSV);

    data.push(columns);

    dictWords.forEach(dictWord => {
        var row = [];
        columns.forEach(column => row.push(dictWord[column]));
        data.push(row);
    });

    var csvContent = '';

    data.forEach(row => {
      csvContent += row.join(CSV_FILE_DELIMITER) + '\n';
    });

    var blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `words_${dictLang}.csv`;

    document.body.appendChild(link);
    link.click();

    // Не забудьте отозвать URL из памяти
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

function enabledDisabledUploadDictBtn() {
    if (fileInput.files[0])
        uploadDictBtn.classList.remove('img-disabled');
    else
        uploadDictBtn.classList.add('img-disabled');
}

function uploadDict() {
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function(event) {
            var content = event.target.result;

            try {
                var lines = content.split('\n');

                var columns = lines[0].split(CSV_FILE_DELIMITER);

                for (var column of columns) {
                    if (!USING_COLUMNS_IN_CSV.has(column)) {
                        alert('Неверные названия столбцов в загруженном файле');
                        return;
                    }
                }

                var GISTWords = [];
                getUpdatedWordsList().then(result => {
                        GISTWords = result;

                        localStorage.setItem(contentKey, JSON.stringify(GISTWords));

                        dictWords = GISTWords.filter(GISTWord => GISTWord['language'] === dictLang);

                        var initLen = dictWords.length;

                        lines = lines.splice(1);

                        var uniqueOriginals = new Set(dictWords.map(dictWord => dictWord['original'].toLowerCase()));

                        lines.forEach(line => {
                            if (line !== '') {
                                var parts = line.split(CSV_FILE_DELIMITER);

                                if (columns.length !== parts.length)
                                    return;

                                if (uniqueOriginals.has(parts[0].toLowerCase()))
                                    return;

                                var newWord = {};

                                columns.forEach((column, idx) => newWord[column] = parts[idx]);

                                newWord['language'] = dictLang;
                                newWord['dateToAdd'] = new Date().toISOString().replace('T', ' ').slice(0, 16);

                                dictWords.push(newWord);
                                GISTWords.push(newWord);
                            }
                        });

                        var totalAddedWords = dictWords.length - initLen;

                        if (totalAddedWords > 0) {
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

                                    localStorage.setItem(contentKey, JSON.stringify(GISTWords));

                                    setTitle();
                                    setWords([...dictWords].splice(initLen), initLen, false);
                                } catch(error) {
                                    alert('❌ Error updating GIST:', error.message);
                                }
                            })();
                        }

                        alert(totalAddedWords > 0 ? `Добавлено слов: ${totalAddedWords}` : 'Ни одно слово не было добавлено.');
                });
            } catch(error) {
                alert('Не удалось загрузить слова из файла');
            }
        };

        reader.onerror = function(error) {
            alert('Ошибка чтения файла');
        };

        reader.readAsText(file);
    } else {
        alert('Вы не загрузили файл со словами');
    }
}

function addSpecialSymbolToInput(specialSymbol) {
    searchInput.value += specialSymbol;
}

setTitle();
setWords(dictWords, 0, false);