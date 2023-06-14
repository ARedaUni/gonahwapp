"use strict";

class SVQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.defaultQuestion(this);            
            this.keyboard = Keyboard.setupForSV(this);
            this.HTML.root.appendChild(this.keyboard.HTML.root);
            return this.HTML.root;
        }

        for (let key of this.keyboard.HTML.characterKeys) {
            key.removeAttribute("active");
        }
        for (let key of this.keyboard.HTML.activeKeys) {
            key.setAttribute("active", "");
        }
        for (let key of this.keyboard.HTML.greenKeys) {
            key.setAttribute("correct", "");
        }
        for (let key of this.keyboard.HTML.redKeys) {
            key.setAttribute("wrong", "");
        }

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

        return this.HTML.root;
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
}
