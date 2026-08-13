'use strict'

var color = localStorage.getItem('bg');

if (color != null) {
    document.body.style.background = color;
    document.getElementById('white').checked = color == 'white';
    document.getElementById('black').checked = color == 'black';
}

function changeTheme(theme) {
    document.body.style.background = theme;
    localStorage.setItem('bg', theme);
}
