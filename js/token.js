'use strict'


function getUpdatedWordsList() {
    return (async function() {
        var GISTFile = await getFileFromGIST(localStorage.getItem(GIST_TOKEN_NAME));

        if (GISTFile !== null)
            return JSON.parse(GISTFile['content']);
        else
            alert('Не удалось загрузить данные с Github Gist');
    })();
}

async function saveFileContent(content) {
    try {
        localStorage.setItem(LOCAL_STORAGE_GIST_KEY, content);
        alert('Данные с GIST успешно обновлены');
        // console.log(localStorage.getItem(LOCAL_STORAGE_GIST_KEY));
    } catch (error) {
        alert(`Ошибка обновления данных: ${error}`);
    }
}

async function getFileFromGIST(token) {

    HEADERS['Authorization'] = token;

    try {
        var response = await fetch(API, {headers: HEADERS});
        var data = await response.json();
        var wordsFile = data['files'][WORDS_FILE_NAME];
        return wordsFile;
    } catch (error) {
        return null;
    }
}

// localStorage.removeItem(GIST_TOKEN_NAME)
// console.log(localStorage.getItem(GIST_TOKEN_NAME));