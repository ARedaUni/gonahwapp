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

function loadQuestionState(question) {
    if (question == undefined) return undefined;
    if (question.type === "short-answer") {
        return new ShortAnswerQS(question.prompt, question.answer,
            question.image, question.hint, question.lang,
            loadQuestionState(question.unlocks));
    } else if (question.type === "short-vowel") {
        return new ShortVowelQS(question.answer,
            loadQuestionState(question.unlocks));
    } else {
        throw new TypeError(`Unsupported type ${question.type}`);        
    }
}

function loadQuiz(quiz) {
    const titleEl = document.getElementById("title");
    titleEl.innerText = quiz.title;

    return quiz.questions.map(x => loadQuestionState(x));
}

let questionStates = loadQuiz(quizzes[1]);
let questionHTMLs = [];
loadQuestions();
