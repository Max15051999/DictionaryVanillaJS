'use strict'

var tokenBtn = document.querySelector('.tokenBtn');
var gistBtn = document.querySelector('.gistBtn');

var container = document.querySelector('.container');
var tokenNotSetContainer = document.querySelector('.token-not-set-container');


function setButtonText() {
    var btnText;
    var badToken = 'Вы ввели невалидный токен';

    var tokenAction = function(message) {
        var newToken = prompt(message);

        if (newToken !== null && newToken.trim() !== '') {
            localStorage.setItem(GIST_TOKEN_NAME, newToken);
            btnText = 'Update GIST TOKEN';
            tokenBtn.innerText = btnText;
            gistBtn.style.visibility = 'visible';
            tokenNotSetContainer.style.display = 'none';
            container.style.display = 'block';

            (async () => {
                var GISTFile = await getFileFromGIST(newToken);

                if (GISTFile !== null)
                    await saveFileContent(GISTFile['content']);
                else
                    alert('Не удалось загрузить данные с Github Gist');

            })();
        } else {
            alert(badToken);
        }

        // console.log(localStorage.getItem(GIST_TOKEN_NAME));
    };

    if (localStorage.getItem(GIST_TOKEN_NAME) !== null) {
        btnText = 'Update GIST TOKEN';
        container.style.display = 'block';

        gistBtn.style.visibility = 'visible';

        gistBtn.onclick = async function() {
            var GISTFile = await getFileFromGIST(localStorage.getItem(GIST_TOKEN_NAME));

            if (GISTFile !== null)
                await saveFileContent(GISTFile['content']);
            else
                alert('Не удалось загрузить данные с Github Gist');
        }
    } else {
        btnText = 'Set GIST TOKEN';
        tokenNotSetContainer.style.display = 'block';
    }

    tokenBtn.innerText = btnText;
    tokenBtn.onclick = () => tokenAction(btnText);
}

async function saveFileContent(content) {
    try {
        localStorage.setItem(LOCAL_STORAGE_GIST_KEY, content);
        alert('Данные с GIST успешно обновдены');
        // console.log(localStorage.getItem(LOCAL_STORAGE_GIST_KEY));
    } catch (error) {

    }
}

setButtonText();
// localStorage.removeItem(GIST_TOKEN_NAME)
// console.log(localStorage.getItem(GIST_TOKEN_NAME));