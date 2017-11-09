// ==UserScript==
// @name         MeritNation Answer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.meritnation.com/ask-answer/question/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var oDiv = document.createElement('div');
    var oSpan = document.createElement('span');
    var valu = document.getElementsByClassName('ans_text');
    oSpan.innerHTML = valu[0].innerHTML; document.body.appendChild(oDiv); oDiv.appendChild(oSpan); window.scrollTo(0,document.body.scrollHeight);
})();