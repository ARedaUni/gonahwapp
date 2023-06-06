"use strict";

class Input {
    static flag = {
        CORRECT: 0,
        WRONG_PLACE: 1,
        NOT_FOUND: 2
    }

    constructor(view) {
        this.view = view;
        this.data = view.data;
    }

    render(init=false) {
        if (init) {
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
        if (input.data.try(value).correct) {
            view.update();
            return;
        }

        // Basically Wordle
        input.valueFlags = value.split(" ").map(value => {return {flag: null, value};});
        const answerWords = input.data.skeletonAnswer.split(" ");
        for (let x = 0; x < input.valueFlags.length; ++x) {
            const vw = input.valueFlags[x].value;
            if (vw === answerWords[x]) {
                input.valueFlags[x].flag = Input.flag.CORRECT;
            } else if (answerWords.some(aw => aw === vw)) {
                input.valueFlags[x].flag = Input.flag.WRONG_PLACE;
            } else {
                input.valueFlags[x].flag = Input.flag.NOT_FOUND;
            }
        }
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
