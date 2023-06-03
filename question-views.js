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

class SAQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.init(this);
            QuestionViewHelper.defaultPrompt(this);
            if (this.data.image) {
                this.HTML.img = document.createElement("img");
                this.HTML.img.src = this.data.image;                
                this.HTML.root.appendChild(this.HTML.img);
            }
            this.input = new Input(this);
            this.HTML.root.appendChild(this.input.render(true));
            if (this.data.input.lang === "ar") {
                this.keyboard = Keyboard.setupForSA(this);
                this.HTML.root.appendChild(this.keyboard.HTML.root);                
            }
            return this.HTML.root;
        }

        if (this.data.answer === this.input.getValue()) {
            this.complete();
        }
        return this.HTML.root;
    }

    complete() {
        const answer = this.data.answer;
        this.HTML.feedback.innerText = `✅ ${answer}`;
        this.HTML.feedback.className = "feedback correct";
        this.keyboard.hide();
        this.input.hide();
    }
}

class SVQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.init(this);
            QuestionViewHelper.defaultPrompt(this);            
            this.keyboard = Keyboard.setupForSV(this);
            this.HTML.root.appendChild(this.keyboard.HTML.root);
            return this.HTML.root;
        }

        this.keyboard.update();
        this.HTML.hint.innerText = this.keyboard.hint || this.data.hint;
        this._updateFeedback();                

        if (this.data.answersLeft() === 0) {
            this.complete();
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
}
