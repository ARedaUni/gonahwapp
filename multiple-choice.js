"use strict";

class MultipleChoiceQS {
    constructor(prompt, answers, hint, kb, selectMany=false, unlocksQS=null) {
        console.assert(typeof(prompt) === "string");
        console.assert(typeof(answers) === "object");
        console.assert(typeof(selectMany) === "boolean");
        console.assert(typeof(hint) === "string");
        console.assert(typeof(kb) === "object");
        console.assert(typeof(unlocksQS) === "object");

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

    getLastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class MultipleChoiceQV {
    constructor(data) {
        this.data = data;
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
                let row = this.keyboard.addRow(`${i}`);
                let buttons = this.data.keyboard.custom[i];
                for (let button of buttons) {
                    this.keyboard.addButton(button, row,
                        MultipleChoiceQV._onButtonClick);
                }
            }
        }

        this.submitButton = new SubmitButton(MultipleChoiceQV._onSubmit);
        this.submitButton.view = this;

        this.activeKeys = [];

        this.HTML.root.appendChild(this.keyboard.getRootHTML());
        this.HTML.root.appendChild(this.submitButton.getRootHTML());
    }

    getRootHTML() {
        return this.HTML.root;
    }

    render() {
        this.keyboard.render();

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
        this.HTML.hint.className = "correct-fg";
        this.HTML.hint.innerText = this.data.answers.join(", ") + " ✅";
        this.submitButton.hide();
        if (this.unlocksQS) {
            QuestionViewHelper.unlockQuestion(this, this.unlocksQS);
        }
    }

    _updateFeedback() {
        if (this.HTML.prompt.fill) {
            if (this.activeKeys[0]) {
                this.HTML.prompt.fill.innerText =
                    this.activeKeys[0].getText();
                this.HTML.prompt.fill.className = "active-fg";
            } else if (this.data.getLastAttempt()) {
                let key = this.data.getLastAttempt()[0];
                this.HTML.prompt.fill.innerText = key.value;
                this.HTML.prompt.fill.className = key.correct ? "correct-fg" : "wrong-fg";
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
        } else if (this.data.getLastAttempt()) {
            for (let key of this.data.getLastAttempt()) {
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
        const btn = e.target.button;
        const kb = btn.keyboard;
        const view = kb.view;
        for (let key of view.activeKeys) {
            key.setFlag("normal");
        }
        view.hint = null;
        if (e.ctrlKey || e.metaKey) {
            let index = view.activeKeys.indexOf(btn);
            if (index === -1) {
                let answersLeft = kb.data.answersLeft();
                if (view.activeKeys.length === answersLeft) {
                    view.hint = `You can't select more than ${answersLeft}`;
                } else if (!kb.data.selectMany && view.activeKeys.length > 0) {
                    view.hint = `You can't select more than 1`;                    
                } else {
                    view.activeKeys.push(btn);
                }
            }
            else {
                view.activeKeys.splice(index, 1);
            }
        } else {
            view.activeKeys = [btn];
        }

        if (view.activeKeys.length > 0) {
            view.submitButton.enable();
            for (let key of view.activeKeys) {
                key.setFlag("active");
            }
        } else {
            view.submitButton.disable();
        }

        kb.view.render();
    }

    static _onSubmit(e) {
        const view = e.target.button.view;
        const kb = view.keyboard;
        const trials = kb.data.try(...view.activeKeys.map(k => k.getText()));
        for (let i = 0; i < trials.length; ++i) {
            let t = trials[i];
            if (t.correct) {
                view.activeKeys[i].setFlag("correct");
            } else {
                view.activeKeys[i].setFlag("wrong");
            }
        }
        view.activeKeys = [];
        view.render();
    }
}
