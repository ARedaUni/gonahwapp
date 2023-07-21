"use strict";

const diacritics = {
    "DAMMA": "\u064f",
    "DAMMATAN": "\u064c",
    "FATHA": "\u064e",
    "FATHATAN": "\u064b",
    "KASRA": "\u0650",
    "KASRATAN": "\u064d",
    "SUKOON": "\u0652",
    "SHADDA": "\u0651",

}

function getDiacriticName(diacritic) {
    console.assert(typeof diacritic === "string");
    console.assert(diacritic.length === 1);
    const index = Object.values(diacritics).indexOf(diacritic);
    if (index === -1) return null;
    return Object.keys(diacritics)[index];
}

function getWordEndingNameAndIndex(word) {
    console.assert(typeof word === "string");
    let index = word.length - 1;
    let diacriticName = getDiacriticName(word[index]);
    if (diacriticName === null) return {diacriticName: null, index: -1};
    if (diacriticName === "SHADDA") {
        index = word.length - 2;
        diacriticName = getDiacriticName(word[index]);
    }
    return {diacriticName, index};
}

function getWordEndingName(word) {
    return getWordEndingNameAndIndex(word).diacriticName;
}

function removeWordEnding(word) {
    let index = getWordEndingNameAndIndex(word).index;
    return word.split(word[index]).join("");
}

class WordState {
    static flags = ["correct", "incorrect", "unattempted", "na"]
    constructor(wordAnswer, flag="na") {
        this.setFlag(flag);
        if (this.getFlag() === "na") {
            this.setFacade(wordAnswer);
        } else {
            this.setFacade(removeWordEnding(wordAnswer));
        }
        this._answerWord = wordAnswer;
        this._answerVowel = getWordEndingName(wordAnswer);
    }

    getAnswer() {
        return this._answerWord;
    }

    getAnswerVowelEndingName() {
        return this._answerVowel;
    }

    getFacade() {
        return this._facade;
    }

    setFacade(value) {
        console.assert(typeof value === "string");
        this._facade = value;
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        console.assert(WordState.flags.indexOf(value) !== -1);
        this._flag = value;
    }

    static computeFlag(wordAns) {
        if (getWordEndingName(wordAns) == null) {
            return "na";
        }
        return "unattempted";
    }

    static generateWords(sentenceAnswer) {
        let startingIndex = 0;
        let words = [];
        for (let i = 1; i < sentenceAnswer.length; ++i) {
            let c = sentenceAnswer[i];
            if (c === ' ') {
                let word = sentenceAnswer.substr(startingIndex, i - startingIndex);
                words.push(new WordState(word, WordState.computeFlag(word)));
                startingIndex = i + 1;
                i++;
                continue;
            }
            if (c === ',' || c === ':' || c === '.' || c === '،') {
                let word = sentenceAnswer.substr(startingIndex, i - startingIndex);
                words.push(new WordState(word, WordState.computeFlag(word)));
                words.push(new WordState(c, "na"));
                startingIndex = i + 1;
                i++;
                continue;
            }
        }
        if (startingIndex !== sentenceAnswer.length) {
            let word = sentenceAnswer.substr(
                startingIndex, sentenceAnswer.length - startingIndex);
            words.push(new WordState(word, WordState.computeFlag(word)));
        }
        return words;
    }
}

class SentenceState {
    static flags = ["correct", "incorrect", "unattempted"];

    constructor(sentenceAnswer, flag="unattempted") {
        this._words = WordState.generateWords(sentenceAnswer);
    }

    getWords() {
        return this._words;
    }

    getAnswer(val) {
        return this.getWords().map(x => x.getAnswer()).join(" ");
    }

    getFacade() {
        return this.getWords().map(x => x.getFacade()).join(" ");
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        console.assert(SentenceState.flags.some(x => x === value));
        this._flag = value;
    }
}

class NahwQS {
    static FLAGS = ["wrong", "correct"]

    constructor(answers) {
        console.assert(answers != undefined);
        this._sentences = answers.map(x => new SentenceState(x));
    }

    // Assumes letters are the same
    try(values, push=true) {
        let valueLP = Util.getLetterPacks(value);
        let flags = [];
        let correct = true;
        for (let i = 0; i < valueLP.length; ++i) {
            if (!valueLP[i].svowel) {
                flags.push({flag: "correct", value: valueLP[i]});
                continue;
            }

            const vLP = valueLP[i];
            const aLP = this.answerLP[i];
            if (vLP.svowel === aLP.svowel &&
                vLP.shadda === aLP.shadda) {
                flags.push({flag: "correct", value: vLP});
                continue;
            }

            correct = false;

            if (svowel.toggleTanween(vLP.svowel) === aLP.svowel &&
                vLP.shadda === aLP.shadda) {
                flags.push({flag: "close_tanween", value: vLP});
            } else if (vLP.svowel === aLP.svowel && vLP.shadda !== aLP.shadda) {
                flags.push({flag: "close_shadda", value: vLP});
            } else {
                flags.push({flag: "wrong", value: vLP});
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
        return this.view = new NahwQV(this);
    }

    getSentences() {
        return this._sentences;
    }

    getAnswer() {
        return this.getSentences().map(x => x.getAnswer()).join(" ");
    }

    getFacade() {
        return this.getSentences().map(x => x.getFacade()).join(" ");
    }
}

class NahwQV {
    constructor(data) {
        this.data = data;
        this.HTML = {};

        this.HTML.root = document.createElement("div");
        this.HTML.root.classList.add("question");
        this.topBar();
        this.mainPage();
    }


    topBar() {
        // Create progress bar
        if (this.HTML.topBar) {
            this.HTML.topBar.innerHTML = "";
        }
        const topBarEl = this.HTML.topBar = document.createElement("div");
        topBarEl.classList.add("nahw-top-bar");

        const mainPageEl = document.createElement("div");
        mainPageEl.classList.add("nahw-top-bar-page");
        mainPageEl.classList.add("nahw-top-bar-square");
        mainPageEl.classList.add("nahw-top-bar-fill");
        topBarEl.appendChild(mainPageEl);

        for (let sentence in this.data.getSentences()) {
            const sentencePageEl = document.createElement("div");
            sentencePageEl.classList.add("nahw-top-bar-page");
            sentencePageEl.classList.add("nahw-top-bar-circle");
            topBarEl.appendChild(sentencePageEl);
        }

        this.HTML.root.appendChild(topBarEl);
    }

    mainPage() {
        // Create text (TODO: Make sentence clickable)
        const textEl = this.HTML.text = document.createElement("p");
        textEl.classList.add("nahw-full-text");
        for (let sentence of this.data.getSentences()) {
            const span = document.createElement("span");
            span.innerText = sentence.getFacade();
            span.classList.add("nahw-full-text-sentence");
            span.setAttribute("lang", "ar");
            textEl.appendChild(span);
        }
        // TODO: Create next button
        const actionButtonsEl = document.createElement("div");
        actionButtonsEl.classList.add("nahw-actions-container");

        const nextEl = document.createElement("div");
        nextEl.innerText = "Next";
        nextEl.classList.add("nahw-next");

        const submitEl = document.createElement("div");
        submitEl.innerText = "Submit";
        submitEl.classList.add("nahw-submit");

        actionButtonsEl.appendChild(submitEl);
        actionButtonsEl.appendChild(nextEl);

        // TODO: Create back-to-question or back-to-text
        // TODO: Add submit
        // Append all elements
        this.HTML.root.appendChild(textEl);
        this.HTML.root.appendChild(actionButtonsEl)
    }

    getRootHTML() {
        return this.HTML.root;
    }

    render() {
        const lastAttempt = this.data.getLastAttempt();
        if (lastAttempt && lastAttempt.correct) {
            this.complete();
            return;
        }

        for (let letter of this.letters) {
            letter.render();
        }

        this.keyboard.resetCharacterKeys();
        let svowelKeys = this.keyboard.getRow("svowelRow");
        if (this.selectedLetter.getShortVowel()) {
            let i = 1;
            while (svowelKeys[i].getText() !== this.selectedLetter.getShortVowel()) {
                i += 1;
            }
            svowelKeys[i].setFlag("active");
        }
        if (this.selectedLetter.hasShadda()) {
            svowelKeys[0].setFlag("active");
        }

        if (this.selectedLetter.getFlag() === "close_tanween") {
            if (svowelKeys[0].shadda) {
                svowelKeys[0].setFlag("correct");
            } else {
                svowelKeys[0].setFlag("disabled");
            }
            for (let i = 1; i < svowelKeys.length; ++i) {
                if (svowelKeys[i].getText() === this.selectedLetter.getShortVowel()) {
                    svowelKeys[i].setFlag("active");
                } else if (svowelKeys[i].getText() === svowel.toggleTanween(this.selectedLetter.getShortVowel())) {
                    svowelKeys[i].setFlag("close");
                } else {
                    svowelKeys[i].setFlag("disabled");
                }
            }
        } else if (this.selectedLetter.getFlag() === "close_shadda") {
            for (let i = 1; i < svowelKeys.length; ++i) {
                if (svowelKeys[i].getText() === this.selectedLetter.getShortVowel()) {
                    svowelKeys[i].setFlag("correct");
                } else {
                    svowelKeys[i].setFlag("disabled");
                }
                svowelKeys[0].setFlag("close");
            }
        }

        if (this.canSubmit()) {
            this.submitButton.enable();
        } else {
            this.submitButton.disable();
        }

        this.keyboard.render();
    }

    next() {
        let index = this.getIndexOfSelectedLetter();
        if (index !== -1) {
            this.selectedLetter.unselect();
        }
        let counter = 0;
        index = (index + 1) % this.letters.length;

        while (counter < this.letters.length && (!this.data.answerLP[index].svowel ||
               this.letters[index].getFlag() === "correct")) {
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
            if (this.letters[i].isSelected()) {
                return i;
            }
        }
        return -1;
    }

    canSubmit() {
        for (let i = 0; i < this.letters.length; ++i) {
            let letterView = this.letters[i];
            let letterLP = this.data.answerLP[i];

            if (letterLP.svowel && !letterView.getShortVowel()) {
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
        this.submitButton.hide();
        this.keyboard.hide();
        this.HTML.hint.setAttribute("hidden", "");
        if (this.data.unlockQS) {
            QuestionViewHelper.unlockQuestion(this, this.data.unlockQS);
        }
    }

    static _onSubmitClick(e) {
        const kb = e.target.button.keyboard;
        const view = e.target.button.view;
        const result = view.data.try(
            Array.from(view.HTML.skeleton.children)
            .map(x => x.innerText)
            .join(""));
        for (let i = 0; i < view.letters.length; ++i) {
            const letter = view.letters[i];
            const flag = result.flags[i].flag;
            letter.setFlag(flag);
        }

        view.clearSelection();
        view.next();
        view.render();
    }

    static _onShortVowelClick(e) {
        const kb = e.target.button.keyboard;
        const view = kb.view;
        const text = e.target.innerText;
        if (view.selectedLetter.getFlag() === "close_tanween" || 
            view.selectedLetter.getFlag() === "close_shadda") {
            if (view.selectedLetter.getFlag() === "close_tanween") {
                view.selectedLetter.setShortVowel(text);
            } else {
                view.selectedLetter.toggleShadda();
            }
            view.selectedLetter.setFlag("correct");
            view.next();
            view.render();
            if (view.letters.every(l => l.getFlag("correct"))) {
                view.submitButton.click();
            }
            return;
        }
        view.selectedLetter.setFlag("normal");
        if (text === svowel.SHADDA) {
            view.selectedLetter.toggleShadda();
        } else if (view.selectedLetter.getShortVowel() !== text) {
            view.selectedLetter.setShortVowel(text);
            view.next();
        }
        view.render();
    }

    static _onLetterClick(e) {
        let letter = e.target.letter;
        let view = e.target.letter.view;
        view.selectedLetter.unselect();
        view.selectedLetter = letter;
        letter.select();
        view.render();
    }
}

// TODO: Write
class ProgressView {

}

// TODO: Write
class SentenceView {
    constructor(sentenceText, answersText) {
        console.assert(typeof sentenceText === "string");
        this.sentenceText = sentenceText;
    }
}

// TODO: Write
class InputView {

}

// TODO: Write
class ErrorView {

}

// TODO: Represent words instead of letters
class Letter {
    static FLAGS = ["disabled", "normal", "wrong", "close_tanween", "close_shadda", "correct"]

    constructor(letter, view, callback=null) {
        console.assert(typeof(letter) === "string");
        console.assert(typeof(view) === "object");
        console.assert(typeof(callback) === "function" || callback === null);

        this._letter = letter;
        this.setShadda(false);
        this.removeShortVowel();
        this.view = view;
        this.HTML = {};
        this.unselect();
        this.HTML.root = document.createElement("span");

        this._resetClass = "no-select svowel-skeleton-letter";
        this.HTML.root.className = this._resetClass;

        this.HTML.root.innerText = this.getLetter();
        if (callback) {
            this.HTML.root.addEventListener("click", callback);
            this.setFlag("normal");
        } else {
            this.setFlag("disabled");
        }
        this.HTML.root.view = this.view;
        this.HTML.root.letter = this;
    }

    getRootHTML() {
        return this.HTML.root;
    }

    select() {
        this._selected = true;
    }

    unselect() {
        this._selected = false;
    }

    isSelected() {
        return this._selected;
    }

    setFlag(flag) {
        console.assert(Letter.FLAGS.some(x => x === flag),
            "Flag %s not recognized!", flag);
        this._flag = flag;
    }

    getFlag() {
        return this._flag;
    }

    getLetter() {
        return this._letter;
    }

    getShortVowel() {
        return this._svowel;
    }

    setShortVowel(vowel) {
        console.assert(typeof(vowel) === "string");
        console.assert(svowel.isShortVowel(vowel), "Character '%s' is not a vowel", vowel);
        this._svowel = vowel;
    }

    removeShortVowel() {
        this._svowel = "";
    }

    hasShadda() {
        return this._shadda;
    }

    setShadda(value) {
        console.assert(typeof(value) === "boolean");
        this._shadda = value;
    }

    toggleShadda() {
        this._shadda = !this._shadda;
    }

    render() {
        let innerText = this.getLetter();
        if (this.getShortVowel()) {
            innerText += this.getShortVowel()[0];
        }
        if (this.hasShadda()) {
            innerText += svowel.SHADDA[0];
        }
        this.HTML.root.innerText = innerText;
        this.HTML.root.className = this._resetClass;

        if (this.getFlag() === "correct") {
            this.HTML.root.classList.add("correct");
            this.HTML.root.removeEventListener("click",
                ShortVowelQV._onLetterClick);
        } else if (this.getFlag() === "close_tanween" || this.getFlag() === "close_shadda") {
            this.HTML.root.classList.add("close");    
        } else {
            this.HTML.root.classList.add(this.getFlag());
        }

        if (this.isSelected()) {
            this.HTML.root.classList.add("active");
        }
    }
}
