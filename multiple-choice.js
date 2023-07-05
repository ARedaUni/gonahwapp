"use strict";

class MultipleChoiceQS {
    constructor(prompt, answers, selectMany, hint, kb, unlocksQS) {
        this.prompt = prompt;
        this.keyboard = {
            single: kb.single || false,
            double: kb.double || false,
            letters: kb.letters || false,
            custom: kb.custom || []};
        this.hint = hint || "";
        this.answers = answers;
        this.selectMany = selectMany || false;
        this.attempts = [];
        this.correctAnswers = [];
        this.unlocksQS = unlocksQS;
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
        return this.view = new MultipleChoiceQV(this);
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

class MultipleChoiceQV {
    constructor(data) {
        this.data = data;
    }

    init() {
        QuestionViewHelper.defaultQuestion(this);

        let prompText = this.data.prompt;
        if (this.data.answers.length === 1 || !this.data.selectMany) {
            let ar = false;
            let index = prompText.indexOf("??");
            if (index === -1) {
                index = prompText.indexOf("؟؟")
                ar = true;
            }
            if (index !== -1) {
                let ref = this.HTML.prompt.childNodes[0];
                let n1 = document.createTextNode(prompText.substr(0, index));
                let fill = document.createElement("span");
                fill.innerText = ar ? "؟؟" : "??";
                fill.className = "regular";
                let n2 = document.createTextNode(prompText.substr(index + 2));
                this.HTML.prompt.insertBefore(n1, ref);
                this.HTML.prompt.insertBefore(fill, ref);
                this.HTML.prompt.insertBefore(n2, ref);
                this.HTML.prompt.removeChild(ref);
                this.HTML.prompt.fill = fill;
            }
        }

        this.keyboard = new Keyboard();
        this.keyboard.view = this;
        this.keyboard.data = this.data;
        this.keyboard.addShortVowels(MultipleChoiceQV._onButtonClick,
            this.data.keyboard.single, this.data.keyboard.double);
        if (this.data.keyboard.letters) {
            this.keyboard.addLetters(MultipleChoiceQV._onButtonClick);
        }
        if (this.data.keyboard.custom) {
            for (let i = 0; i < this.data.keyboard.custom.length; ++i) {
                let row = this.keyboard.addRow(i);
                let buttons = this.data.keyboard.custom[i];
                for (let button of buttons) {
                    this.keyboard.addButton(button, row,
                        MultipleChoiceQV._onButtonClick);
                }
            }
        }
        this.keyboard.addSubmitButton(MultipleChoiceQV._onSubmit,
            this.keyboard.lastRow);
        this.HTML.root.appendChild(this.keyboard.HTML.root);
        return this.HTML.root;
    }

    update() {
        this.keyboard.update();

        if (this.keyboard.HTML.activeKeys.length > 0) {
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
            this.keyboard.HTML.submitBtn.removeAttribute("hidden");
        } else {
            this.keyboard.HTML.submitBtn.setAttribute("disabled", "");
            this.keyboard.HTML.submitBtn.setAttribute("hidden", "");
        }
    
        this.HTML.hint.innerText = this.hint || this.data.hint;
        this._updateFeedback();

        let answersLeft = this.data.answersLeft();
        if ((this.data.selectMany && answersLeft === 0) ||
            (!this.data.selectMany && answersLeft < this.data.answers.length)) {
            this.complete();
        }
    }

    complete() {
        this.keyboard.hide();
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(", ") + " ✅";
        if (this.unlocksQS) {
            QuestionViewHelper.unlockQuestion(this, this.unlocksQS);
        }
    }

    _updateFeedback() {
        if (this.HTML.prompt.fill) {
            if (this.keyboard.HTML.activeKeys[0]) {
                this.HTML.prompt.fill.innerText =
                    this.keyboard.HTML.activeKeys[0].innerText;
                this.HTML.prompt.fill.className = "regular";
            } else if (this.data.lastAttempt) {
                let key = this.data.lastAttempt[0];
                this.HTML.prompt.fill.innerText = key.value;
                this.HTML.prompt.fill.className = key.correct ? "correct" : "wrong";
            }
            return;
        }
        this.HTML.feedback.innerHTML = "";
        if (this.keyboard.HTML.activeKeys.length !== 0) {
            for (let key of this.keyboard.HTML.activeKeys) {
                let fKey = document.createElement("span");
                fKey.className = "regular";
                if (this.HTML.feedback.innerHTML.length > 0) {
                    fKey.innerText = ", ";
                }
                fKey.innerText += key.innerText + " ";
                this.HTML.feedback.appendChild(fKey);
            }
        } else if (this.data.lastAttempt) {
            for (let key of this.data.lastAttempt) {
                let fKey = document.createElement("span");
                fKey.className = key.correct ? "correct" : "wrong";
                if (this.HTML.feedback.innerHTML.length > 0) {
                    fKey.innerText = ",";
                }
                fKey.innerText += key.value + " ";
                this.HTML.feedback.appendChild(fKey);
            }
        }
    }

    static _onButtonClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        view.hint = null;
        if (e.ctrlKey || e.metaKey) {
            let index = kb.HTML.activeKeys.indexOf(e.target);
            if (index === -1) {
                let answersLeft = kb.data.answersLeft();
                if (kb.HTML.activeKeys.length === answersLeft) {
                    view.hint = `You can't select more than ${answersLeft}`;
                } else if (!kb.data.selectMany && kb.HTML.activeKeys.length > 0) {
                    view.hint = `You can't select more than 1`;                    
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

    static _onSubmit(e) {
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
