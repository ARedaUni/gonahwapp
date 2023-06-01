"use strict";

function loadQuestions() {
    let questionsDiv = document.querySelector("#questions");
    for (let q of questionData) {
        let root;
        if (q instanceof SVQuestionState) {
            let qv = new SVQuestionView(q);
            questionViews.push(qv);
            root = qv.render(true);
        } else {
            let errorMsg = `Type ${q.constructor.name} is not supported!`;
            console.error(errorMsg);
            root = document.createElement("div");
            root.className = "question";
            root.appendChild(document.createTextNode(errorMsg));
        }
        questionsDiv.appendChild(root);
    }
}

function setVW() {
    let r = document.querySelector(":root");
    let vw = document.body.clientWidth / 100;
    r.style.setProperty("--vw", `${vw}px`);
}

window.addEventListener("resize", setVW);

let questionViews = [];
loadQuestions();
setVW();
