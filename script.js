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

function setVW() {
    let r = document.querySelector(":root");
    let vw = document.body.clientWidth / 100;
    r.style.setProperty("--vw", `${vw}px`);
}

window.addEventListener("resize", setVW);

let questionHTMLs = [];
loadQuestions();
window.onload = setVW;

const titleEl = document.getElementById("title");
titleEl.innerText = title;;
if (titleRtl) {
    titleEl.setAttribute("rtl", "");
}
