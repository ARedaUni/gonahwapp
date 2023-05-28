"use strict";

class Question {
    constructor(data) {
        this.data = data;
        this.done = false; // is the question complete?
    }

    complete() {
        this.HTML.keyboard.root.setAttribute("hidden", "");
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(", ");
        this.HTML.hint.removeAttribute("hidden");
        this.done = true;

        // all questions complete
        if (questions.reduce((a, b) => a && b.done, true)) {
            let incorrect_guesses = questions.reduce((a, b) => a + b.keyboard.wrong.length, 0);
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
        // Create root
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "question";

        if (this.data.type === "arabic-keyboard-single") {
            this._generateSingleQuestion();
        } else if (this.data.type === "short-answer") {
            this._generateShortAnswer();
        } else {
            console.error(`${this.data.type} is not supported!`);
            this.HTML.prompt = document.createElement("p");
            this.HTML.prompt.appendChild(document.createTextNode(`Question type ${this.data.type} not supported`));
            this.HTML.root.appendChild(this.HTML.prompt);
        }

        return this.HTML.root;
    }

    // arabic-keyboard-single
    _generateSingleQuestion() {
        this._generateDefaultPrompt();
        this._generateKeyboard();
        this._bindKeyboardForSingle();
    }

    _generateShortAnswer() {
        this._generateDefaultPrompt();
        this._generateInput();
        this._generateKeyboard();
        this._bindKeyboardForShort();
    }

    _generateInput() {
        this.HTML.input = {};
        this.HTML.input.root = document.createElement("div");
        this.HTML.input.root.className = "short-answer";
        this.HTML.root.appendChild(this.HTML.input.root);

        this.HTML.input.text = document.createElement("input");
        this.HTML.input.text.question = this;
        this.HTML.input.text.setAttribute("type", "text");
        if (this.data.input.lang === "ar") {
            this.HTML.input.text.setAttribute("rtl", "");
        }

        this.HTML.input.root.appendChild(this.HTML.input.text);

        this.HTML.input.button = document.createElement("button");
        this.HTML.input.button.innerText = ">";
        this.HTML.input.button.question = this;
        if (this.data.input.lang === "ar") {
            this.HTML.input.button.setAttribute("rtl", "");
        }
        this.HTML.input.root.appendChild(this.HTML.input.button);

        this.HTML.input.button.addEventListener("click", (e) => {
            console.warn("Doesn't support incorrect answers");
            const t = e.target;
            const q = t.question;
            const value = q.HTML.input.text.value;
            const answer = q.data.answer;
            if (answer === value) {
                q.HTML.feedback.innerText = `✅ ${answer}`;
                q.HTML.feedback.className = "feedback correct";
                q.HTML.keyboard.root.setAttribute("hidden", "");
                q.HTML.input.root.setAttribute("hidden", "");
                q.HTML.input.text.setAttribute("hidden", "");
                q.HTML.input.button.setAttribute("hidden", "");
            } else {
                
            }
        });

        this.HTML.input.text.addEventListener("input", (e) => {
            let t = e.target;
            let q = t.question;
            if (t.value[t.value.length - 1] === " ") {
                q.HTML.keyboard.spaceRow.space.setAttribute("active", "");
            } else {
                q.HTML.keyboard.spaceRow.space.removeAttribute("active");
            }
        });

        this.HTML.input.text.addEventListener("keydown", (e) => {
            let t = e.target;
            const q = t.question;
            const lastChar = t.value[t.selectionStart - 1];
            const nextChar = t.value[t.selectionStart];
            const isSpecial = e.key === "Backspace" ||
                e.key.indexOf("Arrow") !== -1 ||
                e.key === " " || e.key.ctrlKey;
            if (e.key === "Enter") {
                q.HTML.input.button.click();
                return;
            }

            if (q.data.input.lang === "ar" && !isSpecial) {
                if (q.data.input.svowels) {
                    if (!(e.key >= "ء" && e.key <= svowel.SUKOON[0])) {
                        e.preventDefault();
                    }
                } else if (!(e.key >= "ء" && e.key <= "ي")) {
                    e.preventDefault();
                }
            }

            if (e.key === " ") {
                if (lastChar === " " || t.selectionStart === 0) {
                    e.preventDefault();
                } else if (nextChar === " ") {
                    t.selectionStart += 1;
                    e.preventDefault();
                }
            }
        });
    }

    _generateDefaultPrompt() {
        // Create prompt
        this.HTML.prompt = document.createElement("p");
        let promptNode = document.createTextNode(this.data.prompt);
        this.HTML.prompt.appendChild(promptNode);
        this.HTML.root.appendChild(this.HTML.prompt);

        // Create feedback
        this.HTML.feedback = document.createElement("span");
        this.HTML.feedback.className = "feedback";
        this.HTML.prompt.appendChild(this.HTML.feedback);

        // Create hint
        this.HTML.hint = document.createElement("p");
        this.HTML.hint.className = "hint";
        this.hint = {};
        this.HTML.root.appendChild(this.HTML.hint);

        if (this.data.hint) {
            this.HTML.hint.innerText = this.data.hint;
        } else {
            this._updateHint();
        }
    }

    _updateHint(overSelecting=false) {
        if (!this.data.hasOwnProperty("keyboard")) {
            this.HTML.hint.innerText = this.data.hint;
            return;
        }
        let answersLeft = this.data.answers.length - this.keyboard.correct.length;
        if (overSelecting) {
            this.HTML.hint.innerText = `You cannot select more than ${answersLeft} answers`;
            return;
        }

        if (answersLeft === 1) {
            this.HTML.hint.innerText = "There is one answer left";
        } else {
            this.HTML.hint.innerText = `There are ${answersLeft} answers left`;
        }
    }

    // Grades is an array like: [{correct: false, entry: 'a'}]
    _updateFeedback(grades=null) {
        const OVERRIDE_LTR = "\u202D";
        this.HTML.feedback.innerHTML = "";
        if (!grades) {
            this.HTML.feedback.innerHTML = 
                `<span class="regular">${OVERRIDE_LTR}${this.keyboard.activeKeys.map(k => k.innerText).join(", ")}</span>`;
        } else {
            for (let i = 0; i < grades.length; ++i) {
                let g = grades[i];
                this.HTML.feedback.innerHTML += `<span class="${g.correct ? "correct" : "wrong"}">${OVERRIDE_LTR}${g.entry}`;
                if (i !== grades.length - 1) {
                    this.HTML.feedback.innerHTML += ",";
                }
                this.HTML.feedback.innerHTML += "</span>";
            }
        }
    }

    _bindKeyboardForSingle() {
        const keyboard_click = function(e) {
            const q = this.question;
            if (q.keyboard.grayed.indexOf(e.target) !== -1 ||
                q.keyboard.wrong.indexOf(e.target) !== -1 ||
                q.keyboard.correct.indexOf(e.target) !== -1) {
                return;
            }

            q._updateHint();
            if (!q.keyboard.activeKeys)
                q.keyboard.activeKeys = [];

            if (!e.ctrlKey) {
                q.keyboard.activeKeys.forEach(k => k.removeAttribute("active"));
                q.keyboard.activeKeys = [e.target];
                e.target.setAttribute("active", "");
            } else {
                let index = q.keyboard.activeKeys.indexOf(e.target);
                if (index === -1) {
                    let answersLeft = q.data.answers.length - q.keyboard.correct.length;
                    if (q.keyboard.activeKeys.length === answersLeft) {
                        q._updateHint(`You can't select more than ${answersLeft}`);
                    } else {
                        e.target.setAttribute("active", "");
                        q.keyboard.activeKeys.push(e.target);
                    }
                }
                else {
                    q.keyboard.activeKeys.splice(index, 1)[0].removeAttribute("active");
                }
            }

            q._updateFeedback();

            if (q.keyboard.activeKeys.length > 0) {
                q.HTML.keyboard.submitBtn.removeAttribute("disabled");
            } else {
                q.HTML.keyboard.submitBtn.setAttribute("disabled", "");
            }
        };

        const submit = function(e) {
            const q = this.question;
            q.HTML.keyboard.submitBtn.setAttribute("disabled", "");
            // Check the answer
            let entries = [];
            for (let entry of q.keyboard.activeKeys) {
                // Wrong answer
                if (q.data.answers.indexOf(entry.innerText) === -1) {
                    entries.push({correct: false, entry: entry.innerText});
                    q.keyboard.wrong.push(entry);
                    entry.setAttribute("wrong", "");
                } else {
                    entries.push({correct: true, entry: entry.innerText});
                    q.keyboard.correct.push(entry);
                    entry.setAttribute("correct", "");
                }
            }

            q._updateFeedback(entries);

            // Remove the activekey
            q.keyboard.guesses.push(...entries);
            q.keyboard.activeKeys.forEach(k => k.removeAttribute("active"));
            q.keyboard.activeKeys = [];
            q._updateHint();

            // If the question is complete:
            if (q.keyboard.correct.length === q.data.answers.length) {
                q.complete();
            }
        };

        this.keyboard.activeKeys = undefined;
        this.keyboard.grayed = [];
        this.keyboard.correct = [];
        this.keyboard.wrong = [];
        this.keyboard.guesses = [];

        for (let key of this.HTML.keyboard.defaultKeys) {
            key.addEventListener("click", keyboard_click);
        }

        let submitNode = document.createTextNode("➡");
        let submitDiv = document.createElement("div");
        submitDiv.question = this;
        submitDiv.className = "arabic-keyboard-btn submit-btn";
        submitDiv.appendChild(submitNode);
        submitDiv.addEventListener("click", submit);
        submitDiv.setAttribute("disabled", "");
        this.HTML.keyboard.submitBtn = submitDiv;
        this.HTML.keyboard.bottomRow.appendChild(submitDiv);
    }

    _bindKeyboardForShort() {
        const keyboard_click = function(e) {
            const q = e.target.question;
            // check if harakah or letter
            q.HTML.input.text.value += e.target.innerText;
            q.HTML.keyboard.spaceRow.space.removeAttribute("active");
        }

        const backspace = function(e) {
            console.error("Backspace is not supported yet!")
        }

        const space = function(e) {
            const q = e.target.question;
            let value = q.HTML.input.text.value;

            if (value[value.length - 1] === " ") {
                q.HTML.keyboard.spaceRow.space.removeAttribute("active");
                q.HTML.input.text.value = value.slice(0, value.length - 1);
                return;
            }
            q.HTML.keyboard.spaceRow.space.setAttribute("active", "");
            q.HTML.input.text.value += " ";
        }

        for (let key of this.HTML.keyboard.defaultKeys) {
            key.addEventListener("click", keyboard_click);
        }

        // add backspace + space
        let spaceBtn = document.createElement("div");
        spaceBtn.className = "arabic-keyboard-btn space-btn";
        spaceBtn.innerText = " ";
        spaceBtn.question = this;
        spaceBtn.addEventListener("click", space);
        this.HTML.keyboard.spaceRow = document.createElement("div");
        this.HTML.keyboard.spaceRow.appendChild(spaceBtn);
        this.HTML.keyboard.spaceRow.space = spaceBtn;
        this.HTML.keyboard.root.appendChild(this.HTML.keyboard.spaceRow);

        let backspaceBtn = document.createElement("div");
        backspaceBtn.className = "arabic-keyboard-btn backspace-btn";
        backspaceBtn.innerText = "⌫";
        backspaceBtn.question = this;
        backspaceBtn.addEventListener("click", backspace);
        this.HTML.keyboard.topRow.appendChild(backspaceBtn);
    }

    // I could also pass delegates instead of doing new binding functions
    _generateKeyboard() {
        function createButtons(chars, row, q) {
            for (let char of chars) {
                const button = document.createElement("div");
                button.className = "arabic-keyboard-btn";
                button.question = q;
                const node = document.createTextNode(char);
                button.appendChild(node);
                row.appendChild(button);
                q.HTML.keyboard.defaultKeys.push(button);
            }
        }

        this.keyboard = {};
        this.HTML.keyboard = {};
        this.HTML.keyboard.root = document.createElement("div");
        this.HTML.keyboard.root.className = "arabic-keyboard";
        this.HTML.keyboard.defaultKeys = [];

        this.HTML.keyboard.svowelRow = document.createElement("div");
        this.HTML.keyboard.topRow = document.createElement("div");
        this.HTML.keyboard.middleRow = document.createElement("div");
        this.HTML.keyboard.bottomRow = document.createElement("div");
        
        let svowelRowChars = [];
        if (this.data.keyboard.single) {
            svowelRowChars.push(svowel.DAMMA, svowel.FATHA,
            svowel.KASRA, svowel.SUKOON);
        }
        if (this.data.keyboard.double) {
            svowelRowChars.push(svowel.DAMMATAN, svowel.FATHATAN, svowel.KASRATAN);
        }

        const topRowChars = ["ض", "ص", "ث", "ق", "ف",
            "غ", "ع", "ه", "خ", "ح", "ج", "د"];
        const middleRowChars = ["ذ", "ش", "س", "ي", "ب",
            "ل","ا","ت","ن","م","ك","ط"];
        const bottomRowChars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
            "ة", "و", "ز", "ظ"];

        createButtons(svowelRowChars, this.HTML.keyboard.svowelRow, this);
        if (this.data.keyboard.letters) {
            createButtons(topRowChars, this.HTML.keyboard.topRow, this);
            createButtons(middleRowChars, this.HTML.keyboard.middleRow, this);
            createButtons(bottomRowChars, this.HTML.keyboard.bottomRow, this);            
        }

        this.HTML.keyboard.root.appendChild(this.HTML.keyboard.svowelRow);
        this.HTML.keyboard.root.appendChild(this.HTML.keyboard.topRow);
        this.HTML.keyboard.root.appendChild(this.HTML.keyboard.middleRow);
        this.HTML.keyboard.root.appendChild(this.HTML.keyboard.bottomRow);
        this.HTML.root.appendChild(this.HTML.keyboard.root);
    }
}
