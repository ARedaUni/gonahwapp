"use strict";

// Removes all vowels.
class ShortAnswerQS {
    static FLAGS = ["wrong", "close", "correct"];

    constructor(prompt, answer, image, hint, lang, unlocksQS=null) {
        console.assert(typeof(prompt) === "string");
        console.assert(typeof(answer) === "string");
        console.assert(typeof(image) === "string");
        console.assert(typeof(hint) === "string");
        console.assert(typeof(lang) === "string");
        console.assert(typeof(unlocksQS) === "object");
        
        this.prompt = prompt;
        this.lang = lang;
        this.image = image;
        this.hint = hint;
        this.answer = Util.getSkeleton(answer);
        this.attempts = [];
        this.unlocksQS = unlocksQS;
    }

    try(value, push=true) {
        console.assert(typeof(value) === "string");
        console.assert(typeof(push) === "boolean");

        let valueWords = value.split(" ");
        let flags = [];
        const answerWords = this.answer.split(" ");
        let correct = valueWords.length === answerWords.length;
        for (let x = 0; x < valueWords.length; ++x) {
            const vw = valueWords[x];
            if (vw === answerWords[x]) {
                flags.push({flag: "correct", value: vw});
            } else if (answerWords.some(aw => aw === vw)) {
                flags.push({flag: "close", value: vw});
                correct = false;
            } else {
                flags.push({flag: "wrong", value: vw});
                correct = false;
            }
        }

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

    getLastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class ShortAnswerQV {
    constructor(data) {
        console.assert(typeof(data) === "object");
        this.data = data;
        QuestionViewHelper.defaultQuestion(this);
        if (this.data.image) {
            this.HTML.img = document.createElement("img");
            this.HTML.img.src = this.data.image;                
            this.HTML.root.appendChild(this.HTML.img);
        }
        this.input = new Input(this);
        this.HTML.root.appendChild(this.input.getRootHTML());
        if (this.data.lang === "ar") {
            let kb = this.keyboard = new Keyboard();
            kb.view = this;
            kb.data = this.data;
            kb.input = this.input;
            kb.addLetters(ShortAnswerQV._onButtonClick);
            kb.addSpaceButton(ShortAnswerQV._onSpaceClick);
            kb.addBackspaceButton(kb.getRow("topRow"),
                ShortAnswerQV._onBackspaceClick);

            this.HTML.root.appendChild(this.keyboard.getRootHTML());                
        }
        this.submitButton = new SubmitButton(ShortAnswerQV._onSubmit);
        this.submitButton.view = this;
        this.HTML.root.appendChild(this.submitButton.getRootHTML());
    }

    getRootHTML() {
        return this.HTML.root;
    }

    render() {
        if (!this.data.getLastAttempt()) return;
        if (this.data.getLastAttempt().correct) {
            this.complete();
            return;
        }
        this.HTML.feedback.innerHTML = "❌ ";
        for (let {flag, value} of this.data.getLastAttempt().flags) {
            let fValue = document.createElement("span");
            fValue.innerText = value + " ";
            fValue.className = flag;
            this.HTML.feedback.appendChild(fValue);
        }
    }

    complete() {
        const answer = this.data.answer;
        this.HTML.feedback.innerText = `✅ ${answer}`;
        this.HTML.feedback.className = "feedback correct";
        this.submitButton.hide();
        this.keyboard.hide();
        this.input.hide();
        this.HTML.hint.setAttribute("hidden", "");
        let qs = this.data.unlocksQS;
        if (qs) {
            QuestionViewHelper.unlockQuestion(this, qs);
        }
    }

    static _onSubmit(e) {
        const view = e.target.button.view;
        const input = view.input;
        const value = input.getValue().trim();
        input.data.try(value)
        view.render();
    }

    static _onButtonClick(e) {
        const text = e.target.innerText;
        const kb = e.target.button.keyboard;
        const spaceBtn = kb.getSpaceButton();
        const input = kb.view.input;
        // check if harakah or letter
        input.appendValue(text);
        spaceBtn.setFlag("normal");
        spaceBtn.render();
        kb.view.submitButton.enable();
    }

    static _onSpaceClick(e) {
        const kb = e.target.button.keyboard;
        const spaceBtn = kb.getSpaceButton();
        const input = kb.input;
        let value = input.getValue();

        if (value.length === 0) return;

        if (value[value.length - 1] === " ") {
            spaceBtn.setFlag("normal");
            input.setValue(value.slice(0, value.length - 1));
            spaceBtn.render();
            return;
        }
        spaceBtn.setFlag("active");
        input.appendValue(" ");
        spaceBtn.render();
    }

    static _onBackspaceClick(e) {
        const kb = e.target.button.keyboard;
        const spaceBtn = kb.getSpaceButton();
        const input = kb.input;
        let value = input.getValue();
        if (value.length === 0) return;

        if (value[value.length - 1] === " ") {
            spaceBtn.setFlag("normal");
            spaceBtn.render();
        }

        input.setValue(value.slice(0, value.length - 1));
        value = input.getValue();
        if (value[value.length - 1] === " ") {
            spaceBtn.setFlag("active");
            spaceBtn.render();
        }

        if (value.length > 0) {
            kb.view.submitButton.enable();
        } else {
            kb.view.submitButton.disable();
        }
    }
}

class Input {
    constructor(view) {
        console.assert(typeof(view) === "object");
        this.view = view;
        this.data = view.data;
        // Root
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "short-answer";

        // Input field
        this.HTML.inputField = document.createElement("input");
        this.HTML.inputField.setAttribute("type", "text");
        this.HTML.inputField.setAttribute("placeholder", "هذا...");
        this.HTML.inputField.input = this;
        this.HTML.inputField.view = view;
        this.HTML.inputField.addEventListener("keydown", Input._filter);
        this.HTML.inputField.addEventListener("input", Input._onInput);
        this.HTML.root.appendChild(this.HTML.inputField);

        // RTL
        if (this.data.lang === "ar") {
            this.HTML.inputField.setAttribute("rtl", "");
        }
    }

    getRootHTML() {
        return this.HTML.root;
    }

    getValue() {
        return this.HTML.inputField.value;
    }

    setValue(value) {
        console.assert(typeof(value) === "string");
        this.HTML.inputField.value = value;
    }

    appendValue(value) {
        console.assert(typeof(value) === "string");
        this.setValue(this.getValue() + value);
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
        this.HTML.inputField.setAttribute("hidden", "");
    }

    show() {
        this.HTML.root.removeAttribute("hidden");
        this.HTML.inputField.removeAttribute("hidden");
        this.HTML.button.removeAttribute("hidden");
    }

    static _onInput(e) {
        const value = e.target.input.getValue();
        const view = e.target.view;
        const kb = view.keyboard;
        const space = kb.getSpaceButton();
        if (!kb) return;
        if (value[value.length - 1] === " ") {
            space.setFlag("active");
        } else {
            space.setFlag("normal");
        }
        space.render();

        if (value.length > 0) {
            view.submitButton.enable();
        } else {
            view.submitButton.disable();
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
            input.view.submitButton.click();
            return;
        }

        if (input.data.lang === "ar" && !isSpecial) {
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
