"use strict";

class SingleValueQS {
    constructor(prompt, answers, hint, keyboard) {
        this.prompt = prompt;
        this.keyboard = keyboard;
        this.hint = hint;
        this.answers = answers;
        this.attempts = [];
        this.correctAnswers = [];
    }

    // [string] -> [{correct: bool, value: string}]
    try(...values) {
        let trials = values.map(
            value => {return {correct: this.verify(value), value}});
        trials
            .filter(x => x.correct && !this.correctAnswers.some(y => y === x))
            .forEach(x => this.correctAnswers.push(x.value));
        this.attempts.push(trials);
        return trials;
    }

    getView() {
        if (this.view)
            return this.view
        return this.view = new SingleValueQV(this);
    }

    // string -> bool
    verify(value) {
        return this.answers.indexOf(value) !== -1;
    }

    // () -> int
    answersLeft() {
        return this.answers.length - this.correctAnswers.length;
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class SingleValueQV {
    constructor(data) {
        this.data = data;
    }

    init() {
        QuestionViewHelper.defaultQuestion(this);            
        this.keyboard = new Keyboard();
        this.keyboard.view = this;
        this.keyboard.addShortVowels(
            SingleValueQV._onButtonClick,
            this.data.keyboard.single, this.data.keyboard.double);
        if (view.data.keyboard.letters) {
            keyboard.addLetters(SingleValueQV._onButtonClick);
        }
        this.keyboard.addSubmitButton(SingleValueQV._onButtonClick,
            this.keyboard.HTML.bottomRow);
        this.HTML.root.appendChild(this.keyboard.HTML.root);
        return this.HTML.root;
    }

    update() {
        this.keyboard.update();

        if (this.keyboard.HTML.activeKeys.length > 0) {
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
        } else {
            this.keyboard.HTML.submitBtn.setAttribute("disabled", "");
        }
    
        this.HTML.hint.innerText = this.keyboard.hint || this.data.hint;
        this._updateFeedback();

        if (this.data.answersLeft() === 0) {
            this.complete();
        }
    }

    complete() {
        this.keyboard.hide();
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(" ") + " ✅";
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

    static _onButtonClick(e) {
        const kb = e.target.keyboard;
        kb.hint = null;
        if (e.ctrlKey || e.metaKey) {
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
        } else {
            kb.HTML.activeKeys = [e.target];
        }

        kb.view.update();
    }

    static _onSVSubmit(e) {
        const kb = e.target.keyboard;
        kb.data.try(...kb.HTML.activeKeys.map(k => k.innerText));
        for (let entry of kb.HTML.activeKeys) {
            entry.removeEventListener("click", Keyboard._onSVClick);
            if (kb.data.verify(entry.innerText)) {
                kb.HTML.greenKeys.push(entry);
            } else {
                kb.HTML.redKeys.push(entry);
            }
        }
        kb.HTML.activeKeys = [];
        kb.view.update();
    }
}
