'use strict'

var GIST_ID = 'c381ba451d14c051e0307cea0bb76a92';

var WORDS_FILE_NAME = 'words.json';

var API = 'https://api.github.com/gists/' + GIST_ID;

var HEADERS = {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
              };

var GIST_TOKEN_NAME = 'gist_token';

var LOCAL_STORAGE_GIST_KEY = 'gist_words';

var GAME_WORDS_KEY = 'game_words';
var IS_GAME_WITH_CARDS = 'is_game_with_cards';
var PRIMARY_GAME_LANG = 'primary_game_lang';

var DICT_LANG_KEY = 'dictLang';

var CSV_FILE_DELIMITER = ';';

var USING_COLUMNS_IN_CSV = new Set(['original', 'translate', 'transcription']);

var setBigFirstLetter = (word) => word.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

var langCodeMap = {
    'Английский (GB)' : 'en-GB',
    'Английский (US)' : 'en-US',
    'Немецкий' : 'de'
}

function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}