function loadQuestions() {
    let questionsDiv = document.querySelector("#questions");
    for (let q of questionsData) {
        let question = new Question(q);
        questions.push(question)
        let root = question.generateHTML();
        questionsDiv.appendChild(root);
    }
}

function setVW(e) {
    let r = document.querySelector(":root");
    let vw = document.body.clientWidth / 100;
    r.style.setProperty("--vw", `${vw}px`);
}

window.addEventListener("resize", setVW);

let questions = [];
loadQuestions();
setVW({});
