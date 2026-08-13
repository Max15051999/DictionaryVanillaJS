'use strict'

var GIST_ID = 'c381ba451d14c051e0307cea0bb76a92';

var WORDS_FILE_NAME = 'words.json';

var URL = 'https://api.github.com/gists/' + GIST_ID;

var HEADERS = {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
              };

var GIST_TOKEN_NAME = 'gist_token';

var LOCAL_STORAGE_GIST_KEY = 'gist_words';

var DICT_LANG_KEY = 'dictLang';

var setBigFirstLetter = (word) => word.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

var langCodeMap = {
    'Английский' : 'en',
    'Немецкий' : 'de'
}