'use strict'

async function getFileFromGIST(token) {

    HEADERS['Authorization'] = token;

    try {
        var response = await fetch(URL, {headers: HEADERS});
        var data = await response.json();
        var wordsFile = data['files'][WORDS_FILE_NAME];
        return wordsFile;
    } catch (error) {
        return null;
    }
}