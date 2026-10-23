'use strict'


function getUpdatedList(gistId, fromFile) {
    return (async function() {
        var GISTFile = await getFileFromGIST(BASE_API + gistId, localStorage.getItem(GIST_TOKEN_NAME), fromFile);

        if (GISTFile) {
            try {
                return JSON.parse(GISTFile['content']);
            } catch(error) {
                alert(`Не удалось распарсить файл: ${error}`);
            }
        } else {
            alert('Не удалось загрузить данные с Github Gist');
        }
    })();
}

async function saveFileContent(content) {
    try {
        localStorage.setItem(LOCAL_STORAGE_GIST_WORDS_KEY, content);
        alert('Данные с GIST успешно обновлены');
        // console.log(localStorage.getItem(LOCAL_STORAGE_GIST_WORDS_KEY));
    } catch(error) {
        alert(`Ошибка обновления данных: ${error}`);
    }
}

async function getFileFromGIST(api, token, fileName) {

    HEADERS['Authorization'] = token;

    try {
        var response = await fetch(api, {headers: HEADERS});
        var data = await response.json();
        var wordsFile = data['files'][fileName];
        return wordsFile;
    } catch(error) {
        return null;
    }
}