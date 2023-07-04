"use strict";

class ShortVowelQS {
    static CORRECT = 0
    static TOGGLE_TANWEEN = 1
    static TOGGLE_SHADDA = 2
    static WRONG = 3

    constructor(answer, unlockQS) {
        this.answer = answer;
        this.prompt = "Insert the correct vowels";
        this.skeleton = Util.getSkeleton(this.answer);
        this.answerLP = Util.getLetterPacks(this.answer);
        this.attempts = [];
        this.unlockQS = unlockQS;
        console.log(this.answerLP);
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
        this.keyboard.HTML.submitBtn.setAttribute("hidden", "");
        this.keyboard.HTML.submitBtn.setAttribute("disabled", "");

        this.HTML.skeleton = document.createElement("div");
        this.HTML.skeleton.className = "svowel-skeleton";
        this.letters = [];
        const skeleton_letters = this.data.skeleton.split("");
        for (let i = 0; i < skeleton_letters.length; ++i) {
            let sk_letter = skeleton_letters[i];
            let letter = new Letter(sk_letter, this);
            this.letters.push(letter);
            if (this.data.answerLP[i].svowel)
                this.HTML.skeleton.appendChild(letter.init(ShortVowelQV._onLetterClick));
            else
                this.HTML.skeleton.appendChild(letter.init());

        }
        this.selectedLetter = this.letters[0];
        this.selectedLetter.select();
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
        for (let letter of this.letters) {
            letter.update();
        }

        if (this.canSubmit()) {
            this.keyboard.HTML.submitBtn.removeAttribute("hidden");
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
        }
    }

    next() {
        let index = this.getIndexOfSelectedLetter();
        if (index !== -1) {
            this.selectedLetter.unselect();
        }
        let counter = 0;
        index = (index + 1) % this.letters.length;

        while (counter < this.letters.length && (!this.data.answerLP[index].svowel ||
               this.letters[index].flag === ShortVowelQS.CORRECT)) {
            index = (index + 1) % this.letters.length;
            counter++;
        }

        if (counter > this.letters.length) {
            throw new RangeError("No letters are available to select");
        }

        this.selectedLetter = this.letters[index];
        this.selectedLetter.select();
    }

    clearSelection() {
        this.selectedLetter.unselect();
        this.selectedLetter = undefined;
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
        for (let i = 0; i < this.letters.length; ++i) {
            let letterView = this.letters[i];
            let letterLP = this.data.answerLP[i];

            if (letterLP.svowel && !letterView.svowel) {
                return false;
            }
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
        if (this.data.unlockQS) {
            QuestionViewHelper.unlockQuestion(this, this.data.unlockQS);
        }
    }

    static _onSubmitClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        let result = view.data.try(
            Array.from(view.HTML.skeleton.children)
            .map(x => x.innerText)
            .join(""));
        for (let i = 0; i < view.letters.length; ++i) {
            const letter = view.letters[i];
            const flag = result.flags[i].flag;
            letter.flag = flag;
        }

        view.clearSelection();
        view.next();
        view.update();
    }

    static _onShortVowelClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        const text = e.target.innerText;
        view.selectedLetter.flag = null;
        if (text === svowel.SHADDA) {
            view.selectedLetter.shadda = !view.selectedLetter.shadda;
        } else {
            view.selectedLetter.svowel = text;
            view.next();
        }
        view.update();
    }

    static _onLetterClick(e) {
        let letter = e.target.letter;
        let view = e.target.letter.view;
        view.selectedLetter.unselect();
        view.selectedLetter = letter;
        letter.select();
        view.update();
    }
}

class Letter {
    constructor(letter, view) {
        this.letter = letter;
        this.shadda = false;
        this.svowel = "";
        this.view = view;
        this.flag = null;
        this.HTML = {};
        this._selected = false;
        this._resetClass = "no-select svowel-skeleton-letter";
    }

    init(callback) {
        this.HTML.root = document.createElement("span");
        this.HTML.root.innerText = this.letter;
        if (callback) {
            this.HTML.root.className = this._resetClass;
            this.HTML.root.addEventListener("click", callback);
        } else {
            this.HTML.root.className = this._resetClass = "no-select";
        }
        this.HTML.root.view = this.view;
        this.HTML.root.letter = this;
        return this.HTML.root;
    }

    select() {
        this._selected = true;
    }

    unselect() {
        this._selected = false;
    }

    get selected() {
        return this._selected;
    }

    set selected(val) {
        throw new TypeError("selected is a getter");
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
        this.HTML.root.className = this._resetClass;

        switch(this.flag) {
            case ShortVowelQS.CORRECT:
                this.HTML.root.classList.add("correct");
                this.HTML.root.removeEventListener("click",
                    ShortVowelQV._onLetterClick);
                break;
            case ShortVowelQS.TOGGLE_TANWEEN:
            case ShortVowelQS.TOGGLE_SHADDA:
                this.HTML.root.classList.add("close");
                break;
            case ShortVowelQS.WRONG:
                this.HTML.root.classList.add("wrong");
                break;
            case null:
                break;
            default:
                console.error(`Flag ${this.flag} not recognized!`);
        }

        if (this._selected) {
            this.HTML.root.classList.add("regular");
        }
    }
}
