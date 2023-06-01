"use strict";

const QuestionViewHelper = {
    init(view) {
        view.HTML = {};
        view.HTML.root = document.createElement("div");
        view.HTML.root.className = "question";
    },

    defaultPrompt(view) {
        // Create prompt
        view.HTML.prompt = document.createElement("p");
        let promptNode = document.createTextNode(view.data.prompt);
        view.HTML.prompt.appendChild(promptNode);
        view.HTML.root.appendChild(view.HTML.prompt);

        // Create feedback
        view.HTML.feedback = document.createElement("span");
        view.HTML.feedback.className = "feedback";
        view.HTML.prompt.appendChild(view.HTML.feedback);

        // Create hint
        view.HTML.hint = document.createElement("p");
        view.HTML.hint.className = "hint";
        view.hint = {};
        view.HTML.root.appendChild(view.HTML.hint);

        if (view.data.hint) {
            view.HTML.hint.innerText = view.data.hint;
        }
    }
}

class SVQuestionView {
    constructor(data) {
        this.data = data;
    }

    render(init=false) {
        if (init) {
            QuestionViewHelper.init(this);
            QuestionViewHelper.defaultPrompt(this);            
            this.keyboard = new Keyboard(this, this.data, SVQuestionView._onClick, SVQuestionView._onSubmit);
            this.HTML.root.appendChild(this.keyboard.render());
        } else {
            this.keyboard.render();
            this.HTML.hint.innerText = this.keyboard.hint || this.data.hint;
            this._updateFeedback();
        }

        return this.HTML.root;
    }

    complete() {
        this.keyboard.hide();
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(" ");
    }

    _updateFeedback() {
        const OVERRIDE_LTR = "\u202D";
        this.HTML.feedback.innerHTML = "";
        if (this.keyboard.HTML.activeKeys.length !== 0) {
            for (let key of this.keyboard.HTML.activeKeys) {
                let fKey = document.createElement("span");
                fKey.className = "regular";
                fKey.innerText =  OVERRIDE_LTR + key.innerText + " ";
                this.HTML.feedback.appendChild(fKey);
            }            
        } else if (this.data.lastAttempt) {
            for (let key of this.data.lastAttempt) {
                let fKey = document.createElement("span");
                fKey.className = key.correct ? "correct" : "wrong";
                fKey.innerText = OVERRIDE_LTR + key.value + " ";
                this.HTML.feedback.appendChild(fKey);
            }
        }
    }

    static _onClick(e) {
        const kb = e.target.keyboard;
        kb.hint = null;
        if (!e.ctrlKey) {
            kb.HTML.activeKeys = [e.target];
        } else {
            let index = kb.HTML.activeKeys.indexOf(e.target);
            if (index === -1) {
                let answersLeft = kb.data.answersLeft();
                if (kb.HTML.activeKeys.length === answersLeft) {
                    kb.hint = `You can't select more than ${answersLeft}`;
                } else {
                    kb.HTML.activeKeys.push(e.target);
                }
            }
            else {
                kb.HTML.activeKeys.splice(index, 1);
            }
        }

        kb.view.render();
    }

    static _onSubmit(e) {
        const kb = e.target.keyboard;
        kb.data.try(...kb.HTML.activeKeys.map(k => k.innerText));
        for (let entry of kb.HTML.activeKeys) {
            entry.removeEventListener("click", SVQuestionView._onClick);
            if (kb.data.verify(entry.innerText)) {
                kb.HTML.greenKeys.push(entry);
            } else {
                kb.HTML.redKeys.push(entry);
            }
        }
        kb.HTML.activeKeys = [];
        kb.view.render();
        if (kb.data.answersLeft() === 0) {
            kb.view.complete();
        }
    }
}

class Question {
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
}
