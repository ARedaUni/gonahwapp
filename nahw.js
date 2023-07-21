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

function getLastLetter(word) {
    console.assert(typeof word === "string");
    const vowelIndex = getWordEndingNameAndIndex(word).index;
    if (vowelIndex === -1) {
        if (getDiacriticName(word[word.length - 1]) === "SHADDA") {
            return word.substr(word.length - 2, 2);
        }
        return word.substr(word.length - 1, 1);
    }
    if (word[vowelIndex + 1] && getDiacriticName(word[vowelIndex + 1]) === "SHADDA") {
        return word.substr(vowelIndex - 1, 3);
    }
    if (getDiacriticName(word[vowelIndex - 1]) === "SHADDA") {
        return word.substr(vowelIndex - 2, 3);
    }
    return word.substr(vowelIndex - 1, 2);
}

function getAllLettersButLast(word) {
    const index = word.indexOf(getLastLetter(word));
    return word.substr(0, index);
}

class WordState {
    static flags = ["correct", "incorrect", "unattempted", "na"]
    constructor(wordAnswer, flag="na") {
        this.setFlag(flag);
        // TODO: I could optimize this
        this._baseWord = getAllLettersButLast(wordAnswer);
        this._answer = getLastLetter(wordAnswer);
        this._answerVowelName = getWordEndingName(wordAnswer);
        this._facade = removeWordEnding(this.getAnswer());
        this._facadeVowelName = null;
    }

    getAnswer() {
        return this._answer;
    }

    getAnswerVowelName() {
        return this._answerVowelName;
    }

    getBaseWord() {
        return this._baseWord;
    }

    getFacade() {
        return this._facade;
    }

    getFacadeVowelName() {
        return this._facadeVowelName;
    }

    attempt(vowelEnding="") {
        console.assert(typeof vowelEnding === "string");
        if (this.getFlag() === "na") return;
        if (vowelEnding === "") {
            this.setFlag("unattempted");
            this._facade = removeWordEnding(this.getAnswer());
            return;
        }
        console.assert(diacritic[vowelEnding], `${vowelEnding} is not a diacritic`);
        this._facadeVowelName = vowelEnding;
        if (this.getFlag() !== "unattempted") {
            this._facade[this._facade.length - 1] = vowelEnding;
        } else {
            this._facade += diacritic[vowelEnding];
        }
        if (vowelEnding === this.getAnswerVowelName()) {
            this.setFlag("correct");
        } else {
            this.setFlag("incorrect");
        }
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

    getBigView() {
        if (this._bigView)
            return this._bigView;
        return this._bigView = new SentenceBigView(this);
    }

    getSmallView() {
        if (this._smallView)
            return this._smallView;
        return this._smallView = new SentenceSmallView(this);
    }
}

class NahwQS {
    static FLAGS = ["wrong", "correct"]

    constructor(answers) {
        console.assert(answers != undefined);
        this._sentences = answers.map(x => new SentenceState(x));
    }

    getView() {
        if (this._view)
            return this._view
        return this._view = new NahwQV(this);
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
        this.HTML = Object.create(null);

        this.HTML.root = document.createElement("div");
        this.HTML.root.classList.add("nahw-question");
        this.topBar();
        this.sentencePage(this.data.getSentences()[0]);
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

    nextButton() {
        const nextEl = document.createElement("div");
        nextEl.innerText = "Next";
        nextEl.classList.add("nahw-next");
    }

    mainPage() {
        this.HTML.root.innerHTML = "";
        // Create text (TODO: Make sentence clickable)
        const textEl = this.HTML.text = document.createElement("p");
        textEl.classList.add("nahw-full-text");
        for (let sentence of this.data.getSentences()) {
            const span = document.createElement("span");
            // U+200C = Zero Width Non-Joiner
            // It prevents adjacent letters from forming ligatures
            // Perfect since:
            // I want a margin between sentences (done with CSS)
            // I don't want a space since that shows up when hovering
            // I don't want letters connecting between sentences (i.e U+200C)
            // NOTE: display: block does the same thing BUT
            // it breaks text-align: justify, while the unicode doesn't
            span.innerText = sentence.getFacade() + "\u200c";
            span.classList.add("nahw-full-text-sentence");
            span.setAttribute("lang", "ar");
            textEl.appendChild(span);
        }
        // TODO: Create next button
        // TODO: Create back-to-question or back-to-text
        // TODO: Add submit
        // Append all elements
        this.HTML.root.appendChild(textEl);
    }

    sentencePage(sentenceState) {
        console.assert(sentenceState instanceof SentenceState);
        this.HTML.root.innerHTML = "";
        this.topBar();

        this.HTML.root.appendChild(sentenceState.getBigView().getRootHTML());

        // TODO: Add input options


    }

    getRootHTML() {
        return this.HTML.root;
    }

}

// TODO: Write
class SubmitView {

}

// TODO: Write
class ProgressView {

}

// TODO: Write
class SentenceBigView {
    constructor(sentenceState) {
        console.assert(sentenceState instanceof SentenceState);
        this._sentenceState = sentenceState;
        this._words = []; // list of WordView

        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("p");

        this.HTML.root.classList.add("nahw-big-sentence");
        this.HTML.root.setAttribute("lang", "ar");
        for (let word of sentenceState.getWords()) {
            const wordView = new WordView(word);
            this._words.push(wordView);
            this.HTML.root.appendChild(wordView.getRootHTML());
            this.HTML.root.appendChild(document.createTextNode(" "));
        }
        this.getWords()[1].select();
        this.getWords()[1].render();
    }

    getRootHTML() {
        return this.HTML.root;
    }

    getSentenceState() {
        return this._sentenceState;
    }

    getWords() {
        return this._words;
    }
}

class WordView {
    constructor(wordState) {
        console.assert(wordState instanceof WordState);
        this._wordState = wordState;
        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("span");
        this.HTML.root.classList.add("nahw-big-sentence-word");
        this.HTML.root.setAttribute("lang", "ar");
        const baseEl = this.HTML.base = document.createElement("span");
        baseEl.innerText = wordState.getBaseWord();
        const endingEl = this.HTML.ending = document.createElement("span");
        endingEl.innerText = wordState.getFacade();

        this.HTML.root.appendChild(baseEl);
        this.HTML.root.appendChild(endingEl);
        if (wordState.getFlag() !== "na") {
            const highlightEl = this.HTML.highlight = document.createElement("div");
            highlightEl.classList.add("nahw-big-sentence-word-highlight");
            endingEl.classList.add("nahw-big-sentence-word-hoverable");
            this.HTML.ending.appendChild(highlightEl);
            this.unselect();
        }
        this.render();
    }

    getRootHTML() {
        return this.HTML.root;
    }

    getWordState() {
        return this._wordState;
    }

    select() {
        if (this.getWordState().getFlag() === "na") {
            console.error("Can't select a word that's not applicable");
            return;
        }
        this._selected = true;
    }

    unselect() {
        if (this.getWordState().getFlag() === "na") {
            console.error("Can't unselect a word that's not applicable");
            return;
        }
        this._selected = false;
    }

    isSelected() {
        return this._selected;
    }

    render() {
        if (this.getWordState().getFlag() === "na") {
            return;
        }
        if (this.isSelected()) {
            if (!this.HTML.highlight.classList.replace("nahw-highlight-inactive",
                "nahw-highlight-active")) {
                this.HTML.highlight.classList.add("nahw-highlight-active");
            }
        } else {
            if (!this.HTML.highlight.classList.replace("nahw-highlight-active",
                "nahw-highlight-inactive")) {
                this.HTML.highlight.classList.add("nahw-highlight-inactive");
            }
        }
    }
}


class SentenceSmallView {

}

// TODO: Write
class InputView {

}

// TODO: Write
class ErrorView {

}
