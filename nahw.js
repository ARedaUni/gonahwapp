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

function isShortVowel(diacriticName) {
    console.assert(typeof diacriticName === "string");
    console.assert(diacritics[diacriticName],
        `Diacritic ${diacriticName} is not a diacritic`);
    return diacriticName !== "SHADDA";
}

function getDiacriticName(diacritic) {
    console.assert(typeof diacritic === "string");
    console.assert(diacritic.length === 1);
    const index = Object.values(diacritics).indexOf(diacritic);
    if (index === -1) return null;
    return Object.keys(diacritics)[index];
}

function removeVowels(word) {
    let result = "";
    for (let i = 0; i < word.length; ++i) {
        const c = word[i];
        const diacriticName = getDiacriticName(c);
        if (diacriticName === null) {
            result += c;
            continue;
        }
        if (!isShortVowel(diacriticName)) {
            result += c;
        }
    }
    return result;
}

// A word ending is when the non-mabni tashkeel starts
function getWordEnding(word) {
    console.assert(typeof word === "string");
    let lastLetter = -1;
    for (let i = 0; i < word.length; ++i) {
        const c = word[i];
        const diacriticName = getDiacriticName(c);
        if (diacriticName === null) {
            lastLetter = i;
            continue;
        }
        if (diacriticName !== "SHADDA") {
            return word.substr(lastLetter, word.length - lastLetter);
        }
    }
    return "";
}

function getWordBeginning(word) {
    console.assert(typeof word === "string");
    let lastLetter = -1;
    for (let i = 0; i < word.length; ++i) {
        const c = word[i];
        const diacriticName = getDiacriticName(c);
        if (diacriticName === null) {
            lastLetter = i;
            continue;
        }
        if (diacriticName !== "SHADDA") {
            return word.substr(0, lastLetter);
        }
    }
    return word;
}

class WordState {
    static flags = ["correct", "incorrect", "unattempted", "na"]
    constructor(wordAnswer, flag="na") {
        this.setFlag(flag);
        // TODO: I could optimize this
        this._baseWord = getWordBeginning(wordAnswer);
        this._answer = getWordEnding(wordAnswer);
        this._facade = removeVowels(this.getAnswer());
    }

    getAnswer() {
        return this._answer;
    }

    getWordBeginning() {
        return this._baseWord;
    }

    getFacade() {
        return this._facade;
    }

    reset() {
        this.setFlag("unattempted");
        this._facade = removeVowels(this.getAnswer());
    }

    attempt(wordEnding="") {
        console.assert(typeof wordEnding === "string");
        if (this.getFlag() === "na") {
            return;
        }
        this._facade = wordEnding;
        if (wordEnding === this.getAnswer()) {
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
        if (getWordEnding(wordAns) === "") {
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
        return this.getWords().map(x => x.getWordBeginning() + x.getFacade()).join(" ");
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

        this.progressView = new ProgressView(data.getSentences().length);
        this.HTML.root.appendChild(this.progressView.getRootHTML());
        this.pageActionButtons();

        this.HTML.main = document.createElement("div");
        this.HTML.main.classList.add("nahw-question-main");
        this.HTML.root.appendChild(this.HTML.main);

        document.body.addEventListener("keydown", (e) => {
            if (e.ctrlKey) {
                if (e.key === "ArrowRight") {
                    this.nextPage();
                } else if (e.key === "ArrowLeft") {
                    this.prevPage();
                }
            }
        });
        this.nextPage();
    }

    pageActionButtons() {
        const pageNavButtonsEl = this.HTML.pageNavButtons =
            document.createElement("div");
        pageNavButtonsEl.classList.add("nahw-action-container");
        const nextEl = this.HTML.nextBtn = document.createElement("div");
        nextEl.innerText = "🡺";
        nextEl.classList.add("nahw-nav");
        nextEl.view = this;
        nextEl.state = this.data;
        nextEl.onclick = (e) => e.target.view.nextPage();

        const prevEl = document.createElement("div");
        prevEl.innerText = "🡸";
        prevEl.classList.add("nahw-nav");
        prevEl.view = this;
        prevEl.state = this.data;
        prevEl.onclick = (e) => e.target.view.prevPage();

        const submitEl = document.createElement("div");
        submitEl.innerText = "Submit";
        submitEl.classList.add("nahw-submit");
        submitEl.classList.add("nahw-submit-inactive");
        submitEl.view = this;
        submitEl.state = this.data;
        // submitEl.onclick = (e) => e.target.view.prevPage();

        pageNavButtonsEl.appendChild(prevEl);
        pageNavButtonsEl.appendChild(submitEl);
        pageNavButtonsEl.appendChild(nextEl);
        this.HTML.root.appendChild(pageNavButtonsEl);
    }

    // TODO: Render error page if invalid (add when sentences can be loaded using URL)
    selectPage(val) {
        console.assert(val >= 0);
        console.assert(val < this.data.getSentences().length + 1);
        this.currentPage = val;
        this.renderPage();
    }

    prevPage() {
        if (this.currentPage == undefined) {
            this.currentPage = 0;
        } else {
            this.currentPage -= 1;
            if (this.currentPage === -1) {
                this.currentPage = this.data.getSentences().length;
            }
        }
        this.renderPage();
    }

    nextPage() {
        if (this.currentPage == undefined) {
            this.currentPage = 0;
        } else {
            this.currentPage = (this.currentPage + 1) % 
                (this.data.getSentences().length + 1);
        }
        this.renderPage();
    }

    renderPage() {
        this.progressView.selectPage(this.currentPage);
        if (this.currentPage === 0) {
            this.mainPage();
        } else {
            this.sentencePage(this.data.getSentences()[this.currentPage - 1]);
        }        
    }

    // TODO: Switch to SentenceSmallView
    mainPage() {
        this.HTML.main.innerHTML = "";
        // Create text (TODO: Make sentence clickable)
        const textEl = this.HTML.text = document.createElement("p");
        textEl.classList.add("nahw-full-text");
        textEl.setAttribute("lang", "ar");
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
        // TODO: Create back-to-question or back-to-text
        // TODO: Add submit
        // Append all elements
        this.HTML.main.appendChild(textEl);
    }

    sentencePage(sentenceState) {
        console.assert(sentenceState instanceof SentenceState);
        this.HTML.main.innerHTML = "";
        this.HTML.main.appendChild(sentenceState.getBigView().getRootHTML());
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
    constructor(numOfQuestions) {
        this._numOfQuestions = numOfQuestions;
        this.HTML = Object.create(null);
        const topBarEl = this.HTML.root = document.createElement("div");
        topBarEl.classList.add("nahw-top-bar");

        const mainPageEl = this.HTML.mainPage = document.createElement("div");
        mainPageEl.classList.add("nahw-top-bar-page");
        mainPageEl.classList.add("nahw-top-bar-square");
        topBarEl.appendChild(mainPageEl);

        this.HTML.sentencePage = [];
        for (let i = 0; i < numOfQuestions; ++i) {
            const sentencePageEl = document.createElement("div");
            sentencePageEl.classList.add("nahw-top-bar-page");
            sentencePageEl.classList.add("nahw-top-bar-circle");
            this.HTML.sentencePage.push(sentencePageEl);
            topBarEl.appendChild(sentencePageEl);
        }
    }

    getRootHTML() {
        return this.HTML.root;
    }

    // 0 = main page
    selectPage(val) {
        if (this._selected != undefined) {
            this.unselectPage();
        }
        if (val === 0) {
            this.HTML.mainPage.classList.add("nahw-top-bar-fill");
            this._selected = 0;
            return;
        }
        this.HTML.sentencePage[val - 1].classList.add("nahw-top-bar-fill");
        this._selected = val;
    }

    unselectPage() {
        if (this._selected == undefined) {
            return;
        }
        if (this._selected === 0) {
            this.HTML.mainPage.classList.remove("nahw-top-bar-fill");
            return;
        }
        this.HTML.sentencePage[this._selected - 1].classList.remove("nahw-top-bar-fill");
    }
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
        baseEl.innerText = wordState.getWordBeginning();
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
