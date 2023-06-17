"use strict";

class ShortVowelQS {
    static CORRECT = 0
    static TOGGLE_TANWEEN = 1
    static TOGGLE_SHADDA = 2
    static WRONG = 3

    constructor(answer) {
        this.answer = answer;
        this.prompt = "Insert the correct vowels";
        this.skeleton = Util.getSkeleton(this.answer);
        this.answerLP = Util.getLetterPacks(this.answer);
        this.attempts = [];
    }

    // Assumes letters are the same
    try(value, push=true) {
        let valueLP = Util.getLetterPacks(value);
        let flags = [];
        let correct = true;
        for (let i = 0; i < valueLP.length; ++i) {
            if (valueLP[i].svowel === this.answerLP[i].svowel &&
                valueLP[i].shadda === this.answerLP[i].shadda) {
                flags.push({flag: ShortVowelQS.CORRECT, value: valueLP[i]});
            } else if (valueLP[i].svowel &&
                svowel.toggleTanween(valueLP[i].svowel) === this.answerLP[i].svowel) {
                flags.push({flag: ShortVowelQS.TOGGLE_TANWEEN, value: valueLP[i]});
                correct = false;
            } else if (valueLP[i].shadda !== this.answerLP[i].shadda) {
                flags.push({flag: ShortVowelQS.TOGGLE_SHADDA, value: valueLP[i]});
                correct = false;
            } else {
                flags.push({flag: ShortVowelQS.WRONG, value: valueLP[i]});
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
        return this.view = new ShortVowelQV(this);
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class ShortVowelQV {
    constructor(data) {
        this.data = data;
    }

    init() {
        QuestionViewHelper.init(this);
        QuestionViewHelper.defaultPrompt(this);

        this.keyboard = new Keyboard();
        this.keyboard.view = this;
        this.keyboard.HTML.shadda = {};
        this.keyboard.addShortVowels(ShortVowelQV._onShortVowelClick,
            true, true);
        this.keyboard.addSubmitButton(ShortVowelQV._onSubmitClick,
            this.keyboard.HTML.svowelRow);

        this.HTML.skeleton = document.createElement("div");
        this.HTML.skeleton.className = "svowel-skeleton";
        this.letters = [];
        const skeleton_letters = this.data.skeleton.split("");
        for (let sk_letter of skeleton_letters) {
            let letter = new Letter(sk_letter, this);
            this.letters.push(letter);
            this.HTML.skeleton.appendChild(letter.init(ShortVowelQV._onLetterClick));
        }
        this.selectedLetter = this.letters[0];
        this.selectedLetter.selected = true;
        this.selectedLetter.update();

        this.HTML.hint = document.createElement("p");
        this.HTML.hint.className = "hint";
        this.HTML.hint.innerText = "You can select a letter by clicking on it!";

        this.HTML.root.appendChild(this.HTML.hint);
        this.HTML.root.appendChild(this.HTML.skeleton);
        this.HTML.root.appendChild(this.keyboard.HTML.root);
        return this.HTML.root;
    }

    update() {
        if (this.data.lastAttempt && this.data.lastAttempt.correct) {
            this.complete();
            return;
        }

        this._resetToSkeleton();
        this.keyboard.HTML.submitBtn.setAttribute("hidden", "");
        this.keyboard.HTML.submitBtn.setAttribute("disabled", "");
        for (let letter of this.letters) {
            letter.update();
        }

        this.keyboard.update();

        if (this.canSubmit()) {
            this.keyboard.HTML.submitBtn.removeAttribute("hidden");
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
        }
    }

    next() {
        let index = this.getIndexOfSelectedLetter();
        if (index !== -1) {
            this.selectedLetter.selected = false;
        }
        let counter = 0;
        index = (index + 1) % this.letters.length;

        while (counter < this.letters.length && (this.letters[index].letter === " " ||
               this.letters[index].flag === Letter.CORRECT)) {
            index = (index + 1) % this.letters.length;
            counter++;
        }

        if (counter > this.letters.length) {
            throw new RangeError("No letters are available to select");
        }

        this.selectedLetter = this.letters[index];
        this.selectedLetter.selected = true;
    }

    getIndexOfSelectedLetter() {
        for (let i = 0; i < this.letters.length; ++i) {
            if (this.letters[i].selected) {
                return i;
            }
        }
        return -1;
    }

    canSubmit() {
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const text = this.HTML.skeleton.children[i].innerText;
            if (text === " ") continue;
            if (this.keyboard.HTML.activeKeys[i] == undefined) return false;
        }
        return true;
    }

    complete() {
        let check = document.createElement("span");
        check.innerText = `${this.data.answer} ✅`;
        check.className = "correct";
        this.HTML.skeleton.innerHTML = "";
        this.HTML.skeleton.appendChild(check);
        this.keyboard.hide();
        this.HTML.hint.setAttribute("hidden", "");
        for (let letter of this.HTML.skeleton.children) {
            letter.removeEventListener("click", ShortVowelQV._onLetterClick);
        }
    }

    _resetToSkeleton() {
        let skeleton_letters = this.data.skeleton.split("");
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const letter = this.HTML.skeleton.children[i];
            letter.innerText = skeleton_letters[i];
        }
    }

    static _onSubmitClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        let result = view.data.try(
            Array.from(view.HTML.skeleton.children)
            .map(x => x.innerText)
            .join(""));
        for (let i = 0; i < view.HTML.skeleton.children.length; ++i) {
            const el = view.HTML.skeleton.children[i];
            el.flag = result.flags[i].flag
        }
        view.selectedIndex = -1;
        view.next();
        view.update();
    }

    static _onShortVowelClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        const text = e.target.innerText;
        if (text === svowel.SHADDA) {
            view.selectedLetter.shadda = !view.selectedLetter.shadda;
        } else {
            view.selectedLetter.svowel = text;
            view.next();
        }
        view.selectedLetter.flag = null;
        view.update();
    }

    static _onLetterClick(e) {
        let letter = e.target.letter;
        let view = e.target.letter.view;
        view.selectedLetter.selected = false;
        view.selectedLetter = letter;
        letter.selected = true;
        view.update();
    }
}

class Letter {
    static CORRECT = 0
    static CLOSE = 1
    static WRONG = 2
    static RESET_CLASS = "svowel-skeleton-letter"

    constructor(letter, view) {
        this.letter = letter;
        this.shadda = false;
        this.svowel = "";
        this.view = view;
        this.flag = null;
        this.HTML = {};
        this.selected = false;
    }

    init(callback) {
        this.HTML.root = document.createElement("span");
        this.HTML.root.innerText = this.letter;
        this.HTML.root.className = Letter.RESET_CLASS;
        this.HTML.root.addEventListener("click", callback);
        this.HTML.root.view = this.view;
        this.HTML.root.letter = this;
        return this.HTML.root;
    }

    update() {
        let innerText = this.letter;
        if (this.svowel) {
            innerText += this.svowel[0]
        }
        if (this.shadda) {
            innerText += svowel.SHADDA[0];
        }
        this.HTML.root.innerText = innerText;

        switch(this.flag) {
            case this.HTML.root.CORRECT:
                this.HTML.root.classList.add("correct");
                this.HTML.root.removeEventListener("click",
                    ShortVowelQV._onLetterClick);
                break;
            case this.HTML.root.CLOSE:
                this.HTML.root.classList.add("close");
                break;
            case this.HTML.root.WRONG:
                this.HTML.root.classList.add("wrong");
                break;
            case null:
                this.HTML.root.className = Letter.RESET_CLASS;
                break;
            default:
                console.error("Flag not recognized!");
        }

        if (this.selected) {
            this.HTML.root.classList.add("regular");
        }
    }
}
