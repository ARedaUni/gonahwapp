"use strict";

// Ignores vowels.
class ShortAnswerQS {
    static flag = {
        CORRECT: 0,
        WRONG_PLACE: 1,
        NOT_FOUND: 2
    }

    constructor(prompt, answer, image, hint, input) {
        this.prompt = prompt;
        this.input = input;
        this.image = image;
        this.hint = hint;
        this.answer = answer;
        this.skeletonAnswer = Util.getSkeleton(answer);
        this.attempts = [];
    }

    try(value, push=true) {
        value = Util.getSkeleton(value);
        let valueWords = value.split(" ");
        let flags = [];
        const answerWords = this.skeletonAnswer.split(" ");
        for (let x = 0; x < valueWords.length; ++x) {
            const vw = valueWords[x];
            if (vw === answerWords[x]) {
                flags.push({flag: ShortAnswerQS.flag.CORRECT, value: vw});
            } else if (answerWords.some(aw => aw === vw)) {
                flags.push({flag: ShortAnswerQS.flag.WRONG_PLACE, value: vw});
            } else {
                flags.push({flag: ShortAnswerQS.flag.NOT_FOUND, value: vw});
            }
        }

        let correct = flags.length === answerWords.length && flags.every(x => x.flag === ShortAnswerQS.flag.CORRECT);
        let attempt = {correct, value, flags};
        if (push) {
            this.attempts.push(attempt);
        }
        return attempt;
    }

    getView() {
        if (this.view)
            return this.view
        return this.view = new ShortAnswerQV(this);
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class ShortAnswerQV {
    constructor(data) {
        this.data = data;
    }

    init() {
        QuestionViewHelper.defaultQuestion(this);
        if (this.data.image) {
            this.HTML.img = document.createElement("img");
            this.HTML.img.src = this.data.image;                
            this.HTML.root.appendChild(this.HTML.img);
        }
        this.input = new Input(this);
        this.HTML.root.appendChild(this.input.init());
        if (this.data.input.lang === "ar") {
            let kb = this.keyboard = new Keyboard();
            kb.view = this;
            kb.data = this.data;
            kb.input = this.input;
            kb.addLetters(ShortAnswerQV._onButtonClick);
            kb.addSpaceButton(ShortAnswerQV._onSpaceClick);
            kb.addBackspaceButton(ShortAnswerQV._onBackspaceClick);

            this.HTML.root.appendChild(this.keyboard.HTML.root);                
        }
        return this.HTML.root;
    }

    update() {
        if (this.data.lastAttempt.correct) {
            this.complete();
        } else {
            this.HTML.feedback.innerHTML = "";
            for (let {flag, value} of this.data.lastAttempt.flags) {
                let fValue = document.createElement("span");
                fValue.innerText = value + " ";
                switch (flag) {
                    case ShortAnswerQS.flag.CORRECT:
                        fValue.className = "correct";
                        break;
                    case ShortAnswerQS.flag.WRONG_PLACE:
                        fValue.className = "close";
                        break;
                    case ShortAnswerQS.flag.NOT_FOUND:
                        fValue.className = "wrong";
                        break;
                    default:
                        console.error(`Flag ${flag} is not recognized`);
                }
                this.HTML.feedback.appendChild(fValue);
            }
        }
    }

    complete() {
        const answer = this.data.skeletonAnswer;
        this.HTML.feedback.innerText = `✅ ${answer}`;
        this.HTML.feedback.className = "feedback correct";
        this.keyboard.hide();
        this.input.hide();
        this.HTML.hint.setAttribute("hidden", "");

        if (this.data.input.svowels) {
            const parent = this.HTML.root.parentElement;
            let qs = new SVowelsQuestionState(this.data.answer);
            questionData.push(qs);
            let qv = new SVowelsQuestionView(qs);
            questionViews.push(qv);
            let ref;
            if (ref = this.HTML.root.nextElementSibling) {
                parent.insertBefore(qv.update(true), ref);
            } else {
                parent.appendChild(qv.update(true));
            }
        }
    }

    static _onButtonClick(e) {
        const text = e.target.innerText;
        const kb = e.target.keyboard;
        const input = kb.view.input;
        // check if harakah or letter
        input.setValue(input.getValue() + text);
        kb.HTML.spaceRow.space.removeAttribute("active");
    }

    static _onSpaceClick(e) {
        const kb = e.target.keyboard;
        const input = kb.input;
        let value = input.getValue();

        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.removeAttribute("active");
            input.setValue(value.slice(0, value.length - 1));
            return;
        }
        kb.HTML.spaceRow.space.setAttribute("active", "");
        input.setValue(value + " ");
    }

    static _onBackspaceClick(e) {
        const kb = e.target.keyboard;
        const input = kb.input;
        let value = input.getValue();
        if (value.length === 0) return;

        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.removeAttribute("active");
        }

        input.setValue(value.slice(0, value.length - 1));
        value = input.getValue();
        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.setAttribute("active", "");
        }
    }
}


class Input {
    constructor(view) {
        this.view = view;
        this.data = view.data;
    }

    init() {
        // Root
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "short-answer";

        // Input field
        this.HTML.inputField = document.createElement("input");
        this.HTML.inputField.setAttribute("type", "text");
        this.HTML.inputField.input = this;
        this.HTML.inputField.addEventListener("keydown", Input._filter);
        this.HTML.inputField.addEventListener("input", Input._lastIsSpace);
        this.HTML.root.appendChild(this.HTML.inputField);

        // Button
        this.HTML.button = document.createElement("button");
        this.HTML.button.innerText = ">";
        this.HTML.button.input = this;
        this.HTML.button.addEventListener("click", Input._onSubmit);
        this.HTML.root.appendChild(this.HTML.button);

        // RTL
        if (this.data.input.lang === "ar") {
            this.HTML.inputField.setAttribute("rtl", "");
            this.HTML.button.setAttribute("rtl", "");
        }

        return this.HTML.root;
    }

    getValue() {
        return this.HTML.inputField.value;
    }

    setValue(value) {
        this.HTML.inputField.value = value;
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
        this.HTML.inputField.setAttribute("hidden", "");
        this.HTML.button.setAttribute("hidden", "");
    }


    static _onSubmit(e) {
        const input = e.target.input;
        const view = input.view;
        const value = input.getValue().trim();
        input.data.try(value)
        view.update();
    }

    static _lastIsSpace(e) {
        const value = e.target.input.getValue();
        const kb = e.target.input.view.keyboard;
        if (!kb) return;
        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.setAttribute("active", "");
        } else {
            kb.HTML.spaceRow.space.removeAttribute("active");
        }
    }

    static _filter(e) {
        let t = e.target;
        const input = t.input;
        const lastChar = t.value[t.selectionStart - 1];
        const nextChar = t.value[t.selectionStart];
        const isSpecial = e.key === "Backspace" ||
            e.key.indexOf("Arrow") !== -1 ||
            e.key === " " || e.ctrlKey;
        if (e.key === "Enter") {
            input.HTML.button.click();
            return;
        }

        if (input.data.input.lang === "ar" && !isSpecial) {
            if (!(e.key >= "ء" && e.key <= "ي")) {
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
    }
}
