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

function isTanween(diacriticName) {
    return diacriticName === "DAMMATAN" ||
        diacriticName === "FATHATAN" ||
        diacriticName === "KASRATAN";
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
            return word.substring(lastLetter, word.length);
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
            return word.substring(0, lastLetter);
        }
    }
    return word;
}

function getFirstVowelName(word) {
    console.assert(typeof word === "string");
    for (let i = 0; i < word.length; ++i) {
        const name = getDiacriticName(word[i]);
        if (name != null && name !== "SHADDA") {
            return name;
        }
    }
    return null;
}

class WordState {
    static FLAGS = ["correct", "incorrect", "na"]
    constructor(wordAnswer, flag="na", isPunctuation=false) {
        this.setFlag(flag);
        // TODO: I could optimize this
        this._baseWord = getWordBeginning(wordAnswer);
        this._answer = getWordEnding(wordAnswer);
        this._facade = removeVowels(this.getAnswer());
        this._isPunctuation = isPunctuation;
    }

    isPunctuation() {
        return this._isPunctuation;
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
        this.setFlag("incorrect");
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
        console.assert(WordState.FLAGS.indexOf(value) !== -1);
        this._flag = value;
    }

    static computeFlag(wordAns) {
        if (getWordEnding(wordAns) === "") {
            return "na";
        }
        return "incorrect";
    }

    static generateWords(sentenceAnswer) {
        let startingIndex = 0;
        let words = [];
        for (let i = 1; i < sentenceAnswer.length; ++i) {
            let c = sentenceAnswer[i];
            if (c === ' ') {
                let word = sentenceAnswer.substring(startingIndex, i);
                words.push(new WordState(word, WordState.computeFlag(word)));
                startingIndex = i + 1;
                i++;
                continue;
            }
            if (c === ',' || c === ':' || c === '.' || c === '،') {
                let word = sentenceAnswer.substring(startingIndex, i);
                words.push(new WordState(word, WordState.computeFlag(word)));
                words.push(new WordState(c, "na", true));
                startingIndex = i + 1;
                i++;
                continue;
            }
        }
        if (startingIndex !== sentenceAnswer.length) {
            let word = sentenceAnswer.substring(
                startingIndex, sentenceAnswer.length);
            words.push(new WordState(word, WordState.computeFlag(word)));
        }
        return words;
    }

    generateEndings() {
        if (this.getFlag() === "na") return [];
        const strippedEnding = removeVowels(this.getAnswer());
        const tanween = isTanween(getFirstVowelName(this.getAnswer()));
        if (tanween) {
            return [
                strippedEnding.substring(0, 1) + diacritics["DAMMATAN"] + strippedEnding.substring(1),
                strippedEnding.substring(0, 1) + diacritics["FATHATAN"] + strippedEnding.substring(1),
                strippedEnding.substring(0, 1) + diacritics["KASRATAN"] + strippedEnding.substring(1),
                strippedEnding.substring(0, 1) + diacritics["SUKOON"] + strippedEnding.substring(1),
            ];
        }
        return [
            strippedEnding.substring(0, 1) + diacritics["DAMMA"] + strippedEnding.substring(1),
            strippedEnding.substring(0, 1) + diacritics["FATHA"] + strippedEnding.substring(1),
            strippedEnding.substring(0, 1) + diacritics["KASRA"] + strippedEnding.substring(1),
            strippedEnding.substring(0, 1) + diacritics["SUKOON"] + strippedEnding.substring(1),
        ];
    }
}

class SentenceState {
    static FLAGS = ["correct", "incorrect", "unattempted"];

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
        let result = "";
        let first = true;
        for (let w of this.getWords()) {
            if (!w.isPunctuation() && !first) {
                result += " ";
            }
            result += w.getWordBeginning() + w.getFacade();
            first = false;
        }
        return result;
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        console.assert(SentenceState.FLAGS.some(x => x === value));
        this._flag = value;
    }

    getBigView(inputContainer=undefined, nahwQv=undefined) {
        if (this._bigView)
            return this._bigView;
        return this._bigView = new SentenceBigView(this, inputContainer, nahwQv);
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

        this.progressView = new ProgressView(this);
        this.HTML.root.appendChild(this.progressView.getRootHTML());

        this.HTML.main = document.createElement("div");
        this.HTML.main.classList.add("nahw-question-main");
        this.HTML.root.appendChild(this.HTML.main);
        
        const prevEl = document.createElement("div");
        prevEl.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"></path> </g></svg>`;
        prevEl.classList.add("nahw-nav");
        prevEl.classList.add("nahw-nav-right");
        prevEl.addEventListener("click", (e) => this.prevPage());
        
        this.HTML.main.inner = document.createElement("div");
        this.HTML.main.inner.classList.add("nahw-question-main-inner");
        this.HTML.main.inner.text = document.createElement("div");
        this.HTML.main.inner.appendChild(this.HTML.main.inner.text);
        
        this.input = new InputView();
        this.HTML.main.inner.appendChild(this.input.getRootHTML());

        const nextEl = this.HTML.nextBtn = document.createElement("div");
        nextEl.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path clip-rule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"></path> </g></svg>`;
        nextEl.classList.add("nahw-nav");
        nextEl.classList.add("nahw-nav-left");
        nextEl.addEventListener("click", (e) => this.nextPage());
        
        this.HTML.main.appendChild(prevEl);
        this.HTML.main.appendChild(this.HTML.main.inner);
        this.HTML.main.appendChild(nextEl);

        const submitEl = document.createElement("div");
        submitEl.innerText = "Submit";
        submitEl.classList.add("nahw-submit");
        submitEl.classList.add("nahw-submit-inactive");

        this.HTML.root.appendChild(submitEl);

        this.lastPage = -1;

        document.body.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "ArrowRight") {
                this.nextPage();
            } else if (e.ctrlKey && e.key === "ArrowLeft") {
                this.prevPage();
            } else if ((e.ctrlKey && e.key === "ArrowUp") || e.key === "Home") {
                if (this.currentPage === 0) return;
                this.lastPage = this.currentPage;
                this.selectPage(0);
            } else if (e.ctrlKey && e.key === "ArrowDown") {
                if (this.lastPage !== -1) {
                    this.selectPage(this.lastPage);
                }
            } else if (e.key === "End") {
                this.lastPage = -1;
                this.selectPage(this.data.getSentences().length);
            }
        });

        window.addEventListener("hashchange", (e) => {
            this.renderFromURL();
        });

        if (!this.renderFromURL()) {
            this.nextPage();
        }
    }

    renderFromURL() {
        let success = true;
        const pageNum = parseInt(window.location.hash.substring(1));
        if (isNaN(pageNum)) success = false;
        if (pageNum < 0) success = false;
        if (pageNum > this.data.getSentences().length + 1) success = false;
        if (!success) {
            history.replaceState(null, "", "#0");
            return false;
        }
        this.selectPage(pageNum);
        return true;
    }

    getCurrentPageNumber() {
        return this._currentPage;
    }

    // TODO: Render error page if invalid (add when sentences can be loaded using URL)
    selectPage(val) {
        console.assert(val >= 0);
        console.assert(val < this.data.getSentences().length + 1);
        if (this.getCurrentSentenceState() != undefined) {
            this.getCurrentSentenceState().getBigView().unsubscribe();
        }
        this._currentPage = val;
        this.renderPage();
    }

    prevPage() {
        this.lastPage = -1;
        if (this.getCurrentPageNumber() == undefined) {
            this.selectPage(0);
            return;
        }
        let page = this.getCurrentPageNumber() - 1;
        if (page === -1) {
            page = this.data.getSentences().length;
        }
        this.selectPage(page);
    }

    nextPage() {
        this.lastPage = -1;
        if (this.getCurrentPageNumber() == undefined) {
            this.selectPage(0);
        } else {
            this.selectPage((this.getCurrentPageNumber() + 1) % 
                (this.data.getSentences().length + 1));
        }
    }

    getCurrentSentenceState() {
        if (this.getCurrentPageNumber() === 0 ||
        this.getCurrentPageNumber() == undefined) {
            return null;
        }
        console.assert(this.getCurrentPageNumber() > 0);
        console.assert(this.getCurrentPageNumber() - 1 < this.data.getSentences().length);
        return this.data.getSentences()[this.getCurrentPageNumber() - 1];
    }

    renderPage() {
        console.assert(this.getCurrentPageNumber() != undefined, "There is no page to render");
        history.replaceState(null, "", `#${this._currentPage}`);
        this.progressView.selectPage(this._currentPage);
        if (this.getCurrentPageNumber() === 0) {
            this.mainPage();
        } else {
            this.sentencePage(this.getCurrentSentenceState());
        }
    }

    // TODO: Switch to SentenceSmallView
    mainPage() {
        this.getInputView().hide();
        this.HTML.main.inner.text.innerHTML = "";
        const textEl = document.createElement("p");
        textEl.classList.add("nahw-full-text");
        textEl.setAttribute("lang", "ar");
        for (let i = 0; i < this.data.getSentences().length; ++i) {
            let sentence = this.data.getSentences()[i];
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
            span.onclick = (e) => this.selectPage(i + 1);
            textEl.appendChild(span);
        }
        // TODO: Add submit
        // Append all elements
        this.HTML.main.inner.text.appendChild(textEl);
    }

    sentencePage(sentenceState) {
        console.assert(sentenceState instanceof SentenceState);
        this.getInputView().show();
        const bigView = sentenceState.getBigView(this.getInputView(), this);
        if (bigView.empty()) {
            this.getInputView().hide();
        } else {
            this.getInputView().change(bigView.getSelectedWord());
        }
        this.HTML.main.inner.text.innerHTML = "";
        this.HTML.main.inner.text.appendChild(bigView.getRootHTML());
        bigView.subscribe();
    }

    getInputView() {
        return this.input;
    }

    getRootHTML() {
        return this.HTML.root;
    }
}

// TODO: Write
class SubmitView {

}

class ProgressView {
    constructor(view) {
        this._numOfQuestions = view.data.getSentences().length;
        this.HTML = Object.create(null);
        const topBarEl = this.HTML.root = document.createElement("div");
        topBarEl.classList.add("nahw-top-bar");

        const mainPageEl = this.HTML.mainPage = document.createElement("div");
        mainPageEl.classList.add("nahw-top-bar-page");
        mainPageEl.classList.add("nahw-top-bar-square");
        mainPageEl.onclick = (e) => view.selectPage(0);
        topBarEl.appendChild(mainPageEl);

        this.HTML.sentencePage = [];
        for (let i = 0; i < this._numOfQuestions; ++i) {
            const sentencePageEl = document.createElement("div");
            sentencePageEl.classList.add("nahw-top-bar-page");
            sentencePageEl.classList.add("nahw-top-bar-circle");
            sentencePageEl.onclick = (e) => view.selectPage(i + 1);
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

class SentenceBigView {
    
    constructor(sentenceState, inputContainer, nahwQv) {
        console.assert(sentenceState instanceof SentenceState);
        this._sentenceState = sentenceState;
        this._words = []; // list of WordView

        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("p");

        this.HTML.root.classList.add("nahw-big-sentence");
        this.HTML.root.setAttribute("lang", "ar");
        let first = true;
        for (let word of sentenceState.getWords()) {
            if (!first && !word.isPunctuation()) {
                this.HTML.root.appendChild(document.createTextNode(" "));
            }
            const wordView = new WordView(word, this, inputContainer);
            this._words.push(wordView);
            this.HTML.root.appendChild(wordView.getRootHTML());
            first = false;
        }
        this.nextWord();
        this._listener = function(e) {
            if (!e.ctrlKey && e.key === "ArrowRight") {
                this.prevWord();
            } else if (!e.ctrlKey && e.key === "ArrowLeft") {
                this.nextWord();
            }
        }.bind(this);
        this._nahwQv = nahwQv;
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

    getNahwQV() {
        return this._nahwQv;
    }

    getSelectedWordNum() {
        return this._selected;
    }

    setSelectedWordNum(val) {
        console.assert(typeof val === "number");
        if (this.getSelectedWord() != undefined) {
            this.getSelectedWord().unselect();
        }
        this._selected = val;
        this.getSelectedWord().select();
    }

    getSelectedWord() {
        if (this.getSelectedWordNum() == undefined) return null;
        return this.getWords()[this.getSelectedWordNum()];
    }

    selectWord(word) {
        console.assert(word instanceof WordView);
        for (let i = 0; i < this.getWords().length; ++i) {
            const wordView = this.getWords()[i];
            if (wordView === word) {
                this.setSelectedWordNum(i);
                return;
            }
        }
        console.error("Word not found!", word);
    }

    nextWord(goToPage=false) {
        let prevSelected = this.getSelectedWordNum();
        let selected;
        if (prevSelected == undefined) {
            selected = 0;
        } else {
            selected = (prevSelected + 1);
            if (goToPage && selected >= this.getWords().length) {
                this.getNahwQV().nextPage();
                return;
            }

            selected %= this.getWords().length;
        }

        let tries = 0;
        while (!this.getWords()[selected].isHighlighted()) {
            if (tries === this.getWords().length) {
                console.error("Cannot find a valid word!");
                return;
            }
            selected += 1;
            if (goToPage && selected >= this.getWords().length) {
                this.getNahwQV().nextPage();
                return;
            }
            selected %= this.getWords().length;
        }
        this.setSelectedWordNum(selected);
    }

    prevWord() {
        let prevSelected = this.getSelectedWordNum();
        let selected;
        if (prevSelected == undefined) {
            selected = 0;
        } else {
            selected = prevSelected - 1;
            if (selected < 0) selected = this.getWords().length - 1;
        }

        let tries = 0;
        while (!this.getWords()[selected].isHighlighted()) {
            if (tries == this.getWords().length) {
                console.error("Cannot find a valid word!");
                return;
            }
            selected = selected - 1;
            if (selected < 0) selected = this.getWords().length - 1;
        }
        this.setSelectedWordNum(selected);
    }

    empty() {
        for (let word of this.getWords()) {
            if (word.isHighlighted()) {
                return false;
            }
        }
        return true;
    }

    subscribe() {
        document.body.addEventListener("keydown", this._listener);
    }

    unsubscribe() {
        document.body.removeEventListener("keydown", this._listener);
    }
}

class WordView {

    constructor(wordState, sentenceView=undefined, inputContainer=undefined) {
        console.assert(wordState instanceof WordState);
        this._wordState = wordState;
        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("span");
        this.HTML.root.classList.add("nahw-big-sentence-word");
        this.HTML.root.setAttribute("lang", "ar");
        const baseEl = this.HTML.base = document.createElement("span");
        baseEl.innerText = wordState.getWordBeginning();
        const endingEl = this.HTML.ending = document.createElement("span");
        this.HTML.ending.text = document.createElement("span");
        endingEl.appendChild(this.HTML.ending.text);
        this.HTML.ending.text.innerText = wordState.getFacade();

        this.HTML.root.appendChild(baseEl);
        this.HTML.root.appendChild(endingEl);
        if (wordState.getFlag() !== "na") {
            const highlightEl = this.HTML.highlight = document.createElement("div");
            highlightEl.classList.add("nahw-big-sentence-word-highlight");
            endingEl.classList.add("nahw-big-sentence-word-hoverable");
            this.HTML.ending.appendChild(highlightEl);
            this.unselect();
            if (sentenceView != undefined) {
                this._sentenceView = sentenceView;
                this._onHighlightClick = (function() {sentenceView.selectWord(this);}).bind(this);
                this.subscribe();
            }
            this._inputContainer = inputContainer;
        }

        this.showFeedback(false);
    }

    isHighlighted() {
        return this.HTML.highlight != undefined;
    }

    showFeedback(val) {
        this._feedback = val;
    }

    subscribe() {
        this.HTML.highlight.addEventListener("click", this._onHighlightClick);
    }

    unsubscribe() {
        this.HTML.highlight.removeEventListener("click", this._onHighlightClick);
    }

    getRootHTML() {
        return this.HTML.root;
    }

    getWordState() {
        return this._wordState;
    }

    updateFacade() {
        this.HTML.ending.text.innerText = this.getWordState().getFacade();
    }

    select() {
        if (this.getWordState().getFlag() === "na") {
            console.error("Can't select a word that's not applicable");
            return;
        }
        this._selected = true;
        if (!this.HTML.highlight.classList.replace("nahw-highlight-inactive",
            "nahw-highlight-active")) {
            this.HTML.highlight.classList.add("nahw-highlight-active");
        }
        if (this._inputContainer) {
            this._inputContainer.change(this);
        }
    }

    unselect() {
        if (this.getWordState().getFlag() === "na") {
            console.error("Can't unselect a word that's not applicable");
            return;
        }
        this._selected = false;
        if (!this.HTML.highlight.classList.replace("nahw-highlight-active",
            "nahw-highlight-inactive")) {
            this.HTML.highlight.classList.add("nahw-highlight-inactive");
        }
    }

    isSelected() {
        return this._selected;
    }

    attempt(ending) {
        this.getWordState().attempt(ending);
        this.updateFacade();
    }

    getSentenceView() {
        return this._sentenceView;
    }
}


class SentenceSmallView {

}

class InputView {
    constructor() {
        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("div");
        this.HTML.root.classList.add("nahw-input-container");
    }
    
    change(wordView) {
        this.HTML.root.innerHTML = "";
        this._currentWordView = wordView;
        this._buttons = [];
    
        for (let option of wordView.getWordState().generateEndings()) {
            const button = new InputButton(wordView, option, this);
            if (button.getText() === this._currentWordView.getWordState().getFacade()) {
                button.select();
            }
            this._buttons.push(button);
            this.HTML.root.appendChild(button.getRootHTML());
        }
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }

    show() {
        this.HTML.root.removeAttribute("hidden");
    }

    getRootHTML() {
        return this.HTML.root;
    }

    updateSelection() {
    }
}

class InputButton {
    constructor(wordView, option) {
        this.HTML = Object.create(null);
        this.HTML.root = document.createElement("div");
        this.HTML.root.classList.add("nahw-input-button")
        this.HTML.root.innerText = option;

        this.HTML.root.addEventListener("click", () => {
            wordView.attempt(option);
            wordView.getSentenceView().nextWord(true);
        });

        this._option = option;
    }

    getText() {
        return this._option;
    }

    unselect() {
        this.HTML.root.classList.remove("nahw-input-button-active");
    }

    select() {
        this.HTML.root.classList.add("nahw-input-button-active");
    }

    getRootHTML() {
        return this.HTML.root;
    }
}

// TODO: Write
class ErrorView {

}
