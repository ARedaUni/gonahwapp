"use strict";

function loadQuestions() {
    let questionsDiv = document.querySelector("#questions");
    for (let q of questionStates) {
        let view = q.getView();
        let root = view.init();
        questionHTMLs.push(root);
        questionsDiv.appendChild(root);
    }
}

let questionHTMLs = [];
loadQuestions();

const titleEl = document.getElementById("title");
titleEl.innerText = title;
if (titleRtl) {
    titleEl.setAttribute("rtl", "");
}
