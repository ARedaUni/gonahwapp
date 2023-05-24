class Question {
    constructor(data) {
        this.data = data;
        this.done = false; // is the question complete?
    }

    complete() {
        this.HTML.input.root.setAttribute("hidden", "");
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(", ");
        this.HTML.hint.removeAttribute("hidden");
        this.done = true;

        // all questions complete
        if (questions.reduce((a, b) => a && b.done, true)) {
            let incorrect_guesses = questions.reduce((a, b) => a + b.input.wrong.length, 0);
            let p = document.createElement("p");
            p.className = "done";
            p.innerText = `Incorrect guesses: ${incorrect_guesses}`;
            if (incorrect_guesses > 0) {
                p.className = "wrong";
            } else {
                p.className = "correct";
            }
            document.querySelector("#questions").appendChild(p);
        }
    }

    // () => HTMLDivElement
    generateHTML() {
        return this.generateSingleQuestion();
    }

    updateHint() {
        if (this.hasOwnProperty("input")) {
            if (this.input.guesses[this.input.guesses.length - 1].correct) {
                this.HTML.hint.removeAttribute("hidden");
            }
        } else {
            return;
        }
        let answersLeft = this.data.answers.length - this.input.correct.length;
        if (answersLeft === 1) {
            this.HTML.hint.innerText = "There is one answer left";
        } else {
            this.HTML.hint.innerText = `There are ${answersLeft} answers left`;
        }
    }

    // temporary name
    generateSingleQuestion() {
        // Create root
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "question";

        // Create prompt
        this.HTML.prompt = document.createElement("p");
        this.HTML.prompt.setAttribute("type", "regular");
        let promptNode = document.createTextNode(this.data.prompt);
        this.HTML.prompt.appendChild(promptNode);
        this.HTML.root.appendChild(this.HTML.prompt);

        // Create hint
        this.HTML.hint = document.createElement("p");
        this.HTML.hint.className = "hint";
        this.HTML.hint.setAttribute("hidden", "");
        this.updateHint();
        this.HTML.root.appendChild(this.HTML.hint);

        // Create keyboard
        this.generateKeyboard();
        return this.HTML.root;
    }

    generateKeyboard() {
        const keyboard_click = function(e) {
            const q = this.question;
            if (q.input.grayed.indexOf(e.target) !== -1 ||
                q.input.wrong.indexOf(e.target) !== -1 ||
                q.input.correct.indexOf(e.target) !== -1) {
                return;
            }

            if (q.input.activeKey)
                q.input.activeKey.removeAttribute("active");
            else
                q.HTML.input.submitBtn.removeAttribute("disabled")
            q.input.activeKey = e.target;
            e.target.setAttribute("active", "");
            q.HTML.prompt.setAttribute("feedback", e.target.innerText);
        };

        const submit = function(e) {
            const q = this.question;
            // Check the answer
            let correct = false;
            for (let a of q.data.answers) {
                if (q.input.activeKey.innerText === a) {
                    correct = true;
                    break;
                }
            }
            // Make itself disabled
            q.HTML.input.submitBtn.setAttribute("disabled", "");
            // Either mark the answer wrong or right
            if (correct) {
                q.input.activeKey.setAttribute("correct", "");
                q.input.correct.push(q.input.activeKey);
                q.HTML.prompt.setAttribute("feedback", "✅");
            } else {
                q.input.activeKey.setAttribute("wrong", "");
                q.input.wrong.push(q.input.activeKey);
                q.HTML.prompt.setAttribute("feedback", "❌");
            }
            // Remove the activekey
            q.input.guesses.push({guess: q.input.activeKey.innerText, correct});
            q.input.activeKey = null;
            q.updateHint();

            // If the question is complete:
            if (q.input.correct.length === q.data.answers.length) {
                q.complete();
            }
        };

        function createButtons(chars, row, q) {
            for (let char of chars) {
                const button = document.createElement("div");
                button.question = q;
                const node = document.createTextNode(char);
                button.appendChild(node);
                button.addEventListener("click", keyboard_click);
                row.appendChild(button);
            }
        }

        console.warn("Keyboard only accepts one letter per submission!!");
        this.input = {};
        this.HTML.input = {};
        this.HTML.input.root = document.createElement("div");
        this.HTML.input.root.className = "arabic-keyboard";
        this.input.activeKey = undefined;
        this.input.grayed = [];
        this.input.correct = [];
        this.input.wrong = [];
        this.input.guesses = [];

        this.HTML.input.svowelRow = document.createElement("div");
        this.HTML.input.topRow = document.createElement("div");
        this.HTML.input.middleRow = document.createElement("div");
        this.HTML.input.bottomRow = document.createElement("div");
        
        let svowelRowChars = [];
        if (this.data.input.single) {
            svowelRowChars.push(svowel.DAMMA, svowel.FATHA,
            svowel.KASRA, svowel.SUKOON);
        }
        if (this.data.input.double) {
            svowelRowChars.push(svowel.DAMMATAN, svowel.FATHATAN, svowel.KASRATAN);
        }

        const topRowChars = ["ض", "ص", "ث", "ق", "ف",
            "غ", "ع", "ه", "خ", "ح", "ج", "د"];
        const middleRowChars = ["ذ", "ش", "س", "ي", "ب",
            "ل","ا","ت","ن","م","ك","ط"];
        const bottomRowChars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
            "ة", "و", "ز", "ظ"];

        createButtons(svowelRowChars, this.HTML.input.svowelRow, this);
        if (this.data.input.letters) {
            createButtons(topRowChars, this.HTML.input.topRow, this);
            createButtons(middleRowChars, this.HTML.input.middleRow, this);
            createButtons(bottomRowChars, this.HTML.input.bottomRow, this);            
        }

        let submitNode = document.createTextNode("➡");
        let submitDiv = document.createElement("div");
        submitDiv.question = this;
        submitDiv.appendChild(submitNode);
        submitDiv.addEventListener("click", submit);
        submitDiv.setAttribute("disabled", "");
        this.HTML.input.submitBtn = submitDiv;
        this.HTML.input.bottomRow.appendChild(submitDiv);

        this.HTML.input.root.appendChild(this.HTML.input.svowelRow);
        this.HTML.input.root.appendChild(this.HTML.input.topRow);
        this.HTML.input.root.appendChild(this.HTML.input.middleRow);
        this.HTML.input.root.appendChild(this.HTML.input.bottomRow);
        this.HTML.root.appendChild(this.HTML.input.root);
    }
}

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
