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
            return makeEndingStandard(word.substring(lastLetter, word.length));
        }
    }
    return "";
}

function makeEndingStandard(ending) {
    console.assert(typeof ending === "string");
    console.assert(ending.length <= 3);
    if (ending.length > 0) {
        console.assert(getDiacriticName(ending[0]) === null, "First index must be a letter:", ending);
    }
    if (ending.length <= 2) return ending;
    let result = "";
    let vowelName = null;
    let firstVowelFound = false;
    let shaddaFound = false;
    for (let i = 0; i < ending.length; ++i) {
        const letter = ending[i];
        if (!firstVowelFound && i < 3) {
            vowelName = getDiacriticName(letter);
            if (vowelName !== null && vowelName !== "SHADDA") {
                firstVowelFound = true;
                continue;
            }
        }
        if (!shaddaFound && i < 3) {
            if (getDiacriticName(letter) === "SHADDA") {
                shaddaFound = true;
                continue;
            }
        }
        result += letter;
    }
    if (!firstVowelFound) {
        console.error("No vowel on the first letter in ending:", ending);
        return;
    }
    if (shaddaFound) {
        result = result.substring(0, 1) + diacritics[vowelName] + diacritics["SHADDA"] + result.substring(1);
    } else {
        result = result.substring(0, 1) + diacritics[vowelName] + result.substring(1);
    }
    return result;
}

// Checks if the letter ending is in the order of LETTER - TASHKEEL - SHADDA - EVERYTHING ELSE
function isEndingStandard(ending) {
    console.assert(typeof ending === "string");
    if (ending === "") return true;
    let d0 = getDiacriticName(ending[0]);
    let d1 = getDiacriticName(ending[1]);
    let d2 = getDiacriticName(ending[2]);
    if (ending.length >= 1 && d0 !== null) return false;
    if (ending.length >= 2 && d1 === null) return false;
    if (ending.length === 3 && (d1 === "SHADDA" || d2 !== "SHADDA")) return false;
    return true;
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

class Word {
    static FLAGS = ["correct", "incorrect", "unattempted", "skipped", "na"]
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
        console.assert(Word.FLAGS.indexOf(value) !== -1);
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
                let word = sentenceAnswer.substring(startingIndex, i);
                words.push(new Word(word, Word.computeFlag(word)));
                startingIndex = i + 1;
                i++;
                continue;
            }
            if (c === ',' || c === ':' || c === '.' || c === '،') {
                let word = sentenceAnswer.substring(startingIndex, i);
                words.push(new Word(word, Word.computeFlag(word)));
                words.push(new Word(c, "na", true));
                startingIndex = i + 1;
                i++;
                continue;
            }
        }
        if (startingIndex !== sentenceAnswer.length) {
            let word = sentenceAnswer.substring(
                startingIndex, sentenceAnswer.length);
            words.push(new Word(word, Word.computeFlag(word)));
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

class Sentence {
    static FLAGS = ["correct", "incorrect", "unattempted"];

    constructor(sentenceAnswer, flag="unattempted") {
        this._words = Word.generateWords(sentenceAnswer);
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
        console.assert(Sentence.FLAGS.some(x => x === value));
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

    [Symbol.iterator]() {
        return {
            index: -1,
            self: this,
            next() {
                this.index += 1;
                let word = this.self.getWords()[this.index];
                while (word && (word.getFlag() === "na" || word.getFlag() === "correct")) {
                    this.index += 1;
                    word = this.self.getWords()[this.index];
                }
                if (word == undefined) {
                    return {
                        value: null,
                        done: true,
                    };
                }
                return {
                    value: word,
                    done: false,
                };
            }
        }
    }
}

class NahwQuestion {

    constructor(answers) {
        console.assert(answers != undefined);
        this._sentences = answers.map(x => new Sentence(x));
        this._choice = null;
        this._pageListeners = [];
        this._selectionListeners = [];
        this._submissionListeners = [];
        this.resetPageIterator();
    }

    calculateTotalPages() {
        this._totalPages = this.getSentences().reduce(
            (x, s) => x + s.getWords().filter(w => w.getFlag() !== "na" && w.getFlag() !== "correct").length, 0
        );
    }

    // Iterates through all words (excluding correct & na words)
    resetPageIterator() {
        this.calculateTotalPages();
        this._currentPage = null;
        this._iterator = {
            self: this,
            sentenceIndex: -1,
            sentenceIt: null,
            pageNumber: -1,
            next() {
                this.pageNumber += 1;
                if (this.sentenceIt == null) {
                    this.sentenceIndex += 1;
                    const sentence = this.self.getSentences()[this.sentenceIndex];
                    console.log("next():", this.sentenceIndex);
                    if (sentence == undefined) {
                        return {
                            value: null,
                            done: true,
                        };
                    }
                    this.sentenceIt = sentence[Symbol.iterator]();
                }
                const r = this.sentenceIt.next();
                if (r.done) {
                    this.sentenceIt = null;
                    this.pageNumber -= 1;
                    return this.next();
                }
                const w = r.value;
                const s = this.self.getSentences()[this.sentenceIndex];
                console.log("next():", w);
                return {
                    value: {word: w, sentence: s, pageNumber: this.pageNumber, sentenceNumber: this.sentenceIndex},
                    done: false,
                };
            }
        };
    }

    getCurrentSentenceNumber() {
        if (this.getCurrentPage()?.done) {
            console.error("Can't return sentence number if iteration is done:", this.getCurrentPage());
        }
        return this.getCurrentPage()?.value?.sentenceNumber || null;
    }

    getTotalSentences() {
        return this.getSentences().length;
    }

    getCurrentPageNumber() {
        if (this.getCurrentPage()?.done) {
            console.error("Can't return page number if iteration is done:", this.getCurrentPage());
        }
        return this.getCurrentPage()?.value?.pageNumber;
    }

    getCurrentSentence() {
        if (this.getCurrentPage()?.done) {
            console.error("Can't return page sentence if iteration is done:", this.getCurrentPage());
        }
        return this.getCurrentPage()?.value?.sentence || null;
    }

    getCurrentWord() {
        if (this.getCurrentPage()?.done) {
            console.error("Can't return current word if iteration is done", this.getCurrentPage());
        }
        return this.getCurrentPage()?.value?.word || null;
    }

    getCurrentPage() {
        return this._currentPage;
    }

    nextPage() {
        const oldPage = this._currentPage;
        this._currentPage = this._iterator.next();
        console.log("nextPage():", this._currentPage);
        this._choice = null;
        this._pageListeners.forEach(x => x.onPageChange(oldPage, this._currentPage));
    }
    
    getTotalPages() {
        return this._totalPages;
    }

    addPageChangeListener(obj) {
        console.assert(typeof obj.onPageChange === "function", "Object must have an onPageChange method");
        this._pageListeners.push(obj);
    }

    selectChoice(choice) {
        const oldChoice = this.getChoice();
        this._choice = choice;
        this.getCurrentWord()?.attempt(choice);
        this._selectionListeners.forEach(x => x.onSelectionChange(oldChoice, choice));
    }

    getChoice() {
        return this._choice;
    }

    addSelectionChangeListener(obj) {
        console.assert(typeof obj.onSelectionChange === "function", "Object must have an onSelectionChange method");
        this._selectionListeners.push(obj);
    }

    addSubmissionListener(obj) {
        console.assert(typeof obj.onSubmission === "function", "Object must have an onSubmission method");
        this._submissionListeners.push(obj);
    }

    submit() {
        this._submissionListeners.forEach(x => x.onSubmission(this.getCurrentPage(), this.getChoice(), this.getCurrentWord().getFlag()));
    }

    skip() {
        this.getCurrentWord().setFlag("skipped");
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


class NahwQuestionElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        .container {
            height: 100%;
            width: 100%;
        }

        .top {
            padding-top: 1rem;
        }

        nahw-text {
            margin: 0 auto;
            width: 90%;
            height: 23vh;
        }

        nahw-text.big {
            margin: 0 auto;
            width: 90%;
            margin-top: clamp(1rem, 7rem, 7vw);
        }

        #header {
            height: 10px;
            width: 50%;
            margin: 0 auto;
            padding-top: .5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }

        p {
            margin: 0;
            padding: 0;
            text-align: center;
            color: var(--progress-complete-value);
            font-family: inter;
        }

        nahw-exit-button {
            opacity: .6;
            position: relative;
            top: 2px;
            margin-right: 1rem;
        }

        nahw-progress-bar {
            height: 100%;
            width: 90%;
        }

        nahw-input {
            width: 50%;
            margin: 0 auto;
        }
    </style>
    <div class="container">
        <div class="top">
            <p>COMPLETE!</p>
            <header id="header">
                <nahw-exit-button></nahw-exit-button>
                <nahw-progress-bar></nahw-progress-bar>
            </header>
        </div>
        <nahw-text></nahw-text>
        <nahw-footer></nahw-footer>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwQuestionElement.templateHTML;

        this._container = root.querySelector(".container");
        this._nahwText = root.querySelector("nahw-text");
        this._nahwProgressBar = root.querySelector("nahw-progress-bar");
        this._nahwFooter = root.querySelector("nahw-footer");
        this._nahwInput = document.createElement("nahw-input");
        this._completeP = root.querySelector("p");
    }

    connectedCallback() {
        if (!this.isConnected) return;
    }

    onPageChange(_oldPage, newPage) {
        if (newPage == null) {
            this._nahwText.classList.remove("big");
            if (this._nahwInput.parentNode) {
                this._nahwInput.parentNode.removeChild(this._nahwInput);
            }
            this._completeP.style.display = "none";
        } else if (!newPage.done) {
            this._nahwText.classList.add("big");
            if (!this._nahwInput.parent) {
                this._container.insertBefore(this._nahwInput, this._nahwFooter);
            }
            this._completeP.style.display = "none";
        } else {
            if (this._nahwInput.parentNode) {
                this._nahwInput.parentNode.removeChild(this._nahwInput);
            }
            this._completeP.style.display = "block";
        }
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        this._nahwText.bindToState(state);
        this._nahwProgressBar.bindToState(state);
        this._nahwFooter.bindToState(state);
        this._nahwInput.bindToState(state);
        state.addPageChangeListener(this);
        this.onPageChange(null, state.getCurrentPage());
    }
}

class NahwExitButtonElement extends HTMLElement {
    static templateHTML = `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,400,0,0" />
    <style>
        :host {
            display: inline;
        }

        span {
            user-select: none;
            -webkit-user-select: none;
            cursor: pointer;
            line-height: 10px;
        }

        .hide {
            display: none;
        }

        a {
            color: inherit;
        }
    </style>
    <a href="index.html"><span class="material-symbols-outlined">close</span></a>`;
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwExitButtonElement.templateHTML;
        this._span = root.querySelector("span");
    }
}

class NahwTooltipElement extends HTMLElement {
    static templateHTML = `
    <style>
        span {
            background-color: var(--tooltip-bg);
            width: max-content;
            box-shadow: 0 3px 1px var(--tooltip-stroke);
            border: 0 1px solid var(--tooltip-stroke);
            font-family: Inter;
            font-size: 1.5rem;
            border-radius: 16px;
            padding: .5rem 1rem;
            transform: translateX(-50%);
            display: block;
        }
        
        .normal {
            color: var(--tooltip);
        }

        .incorrect {
            color: var(--tooltip-incorrect);
            text-decoration: underline;
        }
    </style>
    <span><slot></slot></span>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwTooltipElement.templateHTML;
        this._container = root.querySelector("span");
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === "type") {
            console.assert(newValue === "normal" || newValue === "incorrect");
            this._container.classList = newValue;
        }
    }

    static get observedAttributes() {
        return ["type"];
    }
}

class NahwTextElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
        }

        p {
            font-size: clamp(1rem, 4rem, 4vw);
            user-select: none;
            text-align: justify;
            direction: rtl;
            font-family: Amiri;
        }

        p > span {
            color: var(--text);
            transition: color .2s, background-color .2s;
            padding: 0;
            position: relative;
        }

        p.big {
            font-size: clamp(1rem, 5rem, 5vw);
            margin: 0 auto;
            text-align: center;
        }

        span.ending {
            content: "";
            width: 100%;
            height: 80%;
            position: absolute;
            display: block;
            background-color: var(--highlight-inactive);
            top: 0;
            left: 0;
            opacity: 61%;
        }
        
        span.ending.active {
            background-color: var(--highlight-active);
        }

        span.ending.incorrect {
            background-color: var(--highlight-incorrect);
            opacity: 40%;
            cursor: pointer;
        }

        span.ending.skipped {
            background-color: var(--highlight-skipped);
            opacity: 50%;
        }

        nahw-tooltip {
            position: absolute;
            top: -50%;
            left: 50%;
            z-index: 1;
        }
    </style>
    <p></p>`;
    
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwTextElement.templateHTML;
        this._container = root.querySelector("p");
    }

    onPageChange(_oldPage, newPage) {
        if (newPage == null) {
            this.loadParagraphFacade();
        } else if (!newPage.done) {
            this.loadSentenceFacade();
        } else {
            this.loadParagraphFacade();
        }
    }

    onSelectionChange(_oldSelection, _newSelection) {
        this.loadSentenceFacade();
    }
    
    loadSentenceFacade() {
        this._container.innerHTML = "";
        this._container.classList.add("big");
        const sentence = this.getState().getCurrentSentence();
        for (let word of sentence.getWords()) {
            const beginningSpan = document.createElement("span");
            beginningSpan.innerText = word.getWordBeginning();
            const endingSpan = document.createElement("span");
            endingSpan.innerText = word.getFacade();
            const endingSpanHighlight = document.createElement("span");
            endingSpanHighlight.classList.add("ending");
            if (word === this.getState().getCurrentWord()) {
                endingSpanHighlight.classList.add("active");
            }
            endingSpan.appendChild(endingSpanHighlight);
            this._container.appendChild(beginningSpan);
            this._container.appendChild(endingSpan);
            this._container.appendChild(document.createTextNode(" "));
        }
    }

    loadParagraphFacade() {
        this._container.innerHTML = "";
        this._container.classList.remove("big");
        for (let sentence of this.getState().getSentences()) {
            for (let word of sentence.getWords()) {
                const beginningSpan = document.createElement("span");
                beginningSpan.innerText = word.getWordBeginning();
                const endingSpan = document.createElement("span");
                endingSpan.innerText = word.getFacade();
                if (word.getFlag() === "incorrect" || word.getFlag() === "skipped") {
                    const endingSpanHighlight = document.createElement("span");
                    endingSpanHighlight.classList.add("ending", word.getFlag());
                    endingSpan.appendChild(endingSpanHighlight);
                    this._tooltip = document.createElement("nahw-tooltip");
                    endingSpanHighlight.addEventListener("mouseenter", () => {
                        if (word.getFlag() === "skipped") {
                            this._tooltip.setAttribute("type", "normal");
                            this._tooltip.innerText = "skipped";
                        } else {
                            this._tooltip.setAttribute("type", "incorrect");
                            this._tooltip.innerText = "ERROR(temp)";
                        }
                        endingSpan.appendChild(this._tooltip);
                    });
                    endingSpanHighlight.addEventListener("mouseleave", () => {
                        endingSpan.removeChild(this._tooltip);
                    });
                }
                if (!word.isPunctuation()) {
                    this._container.appendChild(document.createTextNode(" "));
                }
                this._container.appendChild(beginningSpan);
                this._container.appendChild(endingSpan);
            }
        }
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        state.addPageChangeListener(this);
        state.addSelectionChangeListener(this);
        this.onPageChange(null, state.getCurrentPage());
    }

    getState() {
        return this._state;
    }
}

class NahwButtonElement extends HTMLElement {
    static templateHTML = `
    <style>
        div {
            border-radius: 16px;
            font-weight: 800;
            border-width: thin;
            border-style: solid;
            padding: 1rem 1.5rem;
            cursor: pointer;
            min-width: 100px;
            text-align: center;
            title-transform: uppercase;
            font-size: 1.2rem;
            user-select: none;
        }

        div:active:not(.inactive) {
            box-shadow: none !important;
            transform: translate(0, 3px);
        }

        .secondary {
            background-color: var(--button-secondary-fill);
            color: var(--button-secondary);
            box-shadow: 0 5px var(--button-secondary-shadow);
            border-color: var(--button-secondary-stroke);
        }

        .primary {
            background-color: var(--button-primary-fill);
            color: var(--button-primary);
            box-shadow: 0 5px var(--button-primary-shadow);
            border-color: var(--button-primary-stroke);
        }

        .red {
            background-color: var(--button-red-fill);
            color: var(--button-red);
            box-shadow: 0 5px var(--button-red-shadow);
            border-color: var(--button-red-stroke);
        }

        .inactive {
            color: var(--button-inactive);
            background-color: var(--button-inactive-fill);
            box-shadow: 0;
            cursor: not-allowed;
            border-color: var(--button-inactive-fill);
        }
    </style>
    <div><slot>SLOT</slot></div>
    `;
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwButtonElement.templateHTML;
        this._container = root.querySelector("div");
        root.appendChild(this._container);
        this.setType(this.getAttribute("type"));
    }

    putEventListener(func) {
        if (this._eventListener) {
            this._container.removeEventListener("click", this._eventListener);
        }
        this._eventListener = func;
        this._container.addEventListener("click", this._eventListener);
    }

    resetListener() {
        this._container.removeEventListener("click", this._eventListener);
        this._eventListener = null;
    }

    setType(type) {
        console.assert(type === "primary" ||
            type === "secondary" ||
            type === "inactive" ||
            type === "red");
        this._container.className = type;
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === "type") {
            this.setType(newValue);
        }
    }

    click() {
        if (this._eventListener) {
            this._eventListener();
        }
    }

    static get observedAttributes() {
        return ["type"];
    }
}

class NahwFooterElement extends HTMLElement {
    static templateHTML = `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,-25" />
    <style>
        :host {
            display: block;
            box-sizing: border-box;
        }
        
        .footer-container {
            background-color: var(--footer-bg);
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 20vh;
            border-top: 2px solid var(--footer-stroke);
        }

        .button-container {
            display: flex;
            width: 80%;
            height: 100%;
            align-items: center;
            justify-content: space-between;
            margin: 0 auto;
        }

        .left {
            display: flex;
            align-items: center;
        }

        .feedback-icon {
            background-color: #fff;
            padding: 2rem;
            border-radius: 100%;
            border: 1px solid #fff;
            float: left;
            margin-right: 1rem;
        }

        .feedback-icon svg {
            transform: scale(120%);
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .footer-container.wrong {
            color: var(--footer-wrong) !important;
            background-color: var(--footer-wrong-bg);
        }

        .footer-container.wrong .feedback-correct {
            display: none;
        }

        .footer-container.correct {
            color: var(--footer-correct) !important;
            background-color: var(--footer-correct-bg);
        }

        .footer-container.correct .feedback-wrong {
            display: none;
        }

        .footer-container.wrong .secondary, .footer-container.correct .secondary {
            display: none;
        }

        .footer-container:not(.wrong, .correct) .feedback {
            display: none;
        }

        .feedback h1 {
            line-height: 0;
        }

        .feedback > h1 {
            width: 30rem;
        }

        .feedback-buttons {
            display: flex;
            margin: 0;
            line-height: 0;
        }

        .feedback-buttons p {
            margin: 0;
            margin-right: 1rem;
        }
    </style>
    <div class="footer-container">
        <div class="button-container">
            <div class="left">
                <nahw-button class="secondary" type="secondary">SECONDARY</nahw-button>
                <div class="feedback feedback-wrong">
                    <div class="feedback-icon">
                        <svg class="wrong-icon" width="32" height="31" viewBox="0 0 32 31" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.91 15.4384L30.24 9.10842C31.2044 8.09976 31.7356 6.75365 31.72 5.35822C31.7043 3.9628 31.143 2.62895 30.1563 1.64217C29.1695 0.655399 27.8356 0.094115 26.4402 0.0784614C25.0448 0.0628077 23.6987 0.594028 22.69 1.55842L16.36 7.88842L10 1.55842C8.99135 0.594028 7.64524 0.0628077 6.24982 0.0784614C4.85439 0.094115 3.52054 0.655399 2.53377 1.64217C1.54699 2.62895 0.985717 3.9628 0.970063 5.35822C0.954409 6.75365 1.48562 8.09976 2.45001 9.10842L8.78001 15.4384L2.45001 21.7684C1.48562 22.7771 0.954409 24.1232 0.970063 25.5186C0.985717 26.914 1.54699 28.2479 2.53377 29.2347C3.52054 30.2214 4.85439 30.7827 6.24982 30.7984C7.64524 30.814 8.99135 30.2828 10 29.3184L16.33 22.9884L22.66 29.3184C23.6687 30.2828 25.0148 30.814 26.4102 30.7984C27.8056 30.7827 29.1395 30.2214 30.1263 29.2347C31.113 28.2479 31.6743 26.914 31.69 25.5186C31.7056 24.1232 31.1744 22.7771 30.21 21.7684L23.91 15.4384Z" fill="#EC0B1B"/></svg>
                    </div>
                    <h1>Correct solution:</h1>
                    <p>This is a <b><u>past tense verb</u></b> so it ends with a <i>fatha</i>.</p>
                    <div class="feedback-buttons">
                        <p><span class="material-symbols-outlined">flag</span> REPORT</p>
                        <p><span class="material-symbols-outlined">article_shortcut</span>REVIEW RULE</p>
                    </div>
                </div>
                <div class="feedback feedback-correct">
                    <div class="feedback-icon">
                        <svg class="correct-icon" width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 5.5L15.2067 24.3278C14.8136 24.7017 14.194 24.694 13.8103 24.3103L5.5 16" stroke="#80B42C" stroke-width="10" stroke-linecap="round"/></svg>
                    </div>
                    <h1>Great job!</h1>
                    <p>This is a <b><u>past tense verb</u></b> so it ends with a <i>fatha</i>.</p>
                    <div class="feedback-buttons">
                        <p><span class="material-symbols-outlined">flag</span> REPORT</p>
                        <p><span class="material-symbols-outlined">article_shortcut</span>REVIEW RULE</p>
                    </div>
                </div>
            </div>
            <nahw-button type="primary">PRIMARY</nahw-button>
        </div>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwFooterElement.templateHTML;

        this._container = root.querySelector(".footer-container");
        this._secondaryButton = root.querySelectorAll("nahw-button")[0];
        this._primaryButton = root.querySelectorAll("nahw-button")[1];
        this._enterFunc = (e) => {
            if (e.key === "Enter") {
                this._primaryButton.click();
            }
        };
    }

    connectedCallback() {
        if (this._enterFunc) {
            document.body.addEventListener("keydown", this._enterFunc);
        }
    }

    disconnectedCallback() {
        if (this._enterFunc) {
            document.body.removeEventListener("keydown", this._enterFunc);
        }
    }

    updateBoth(primary, secondary) {
        this._primaryButton.innerHTML = primary;
        this._secondaryButton.innerHTML = secondary;
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        this.getState().addPageChangeListener(this);
        this.getState().addSelectionChangeListener(this);
        this.getState().addSubmissionListener(this);
        this.onPageChange(null, this.getState().getCurrentPage());
    }

    onSelectionChange(_oldSelection, _newSelection) {
        this._primaryButton.setAttribute("type", "primary");
        if (_oldSelection == null) {
            this._primaryButton.putEventListener(() => {
                this.getState().submit();
            });
        }
    }

    onSubmission(_currentPage, _choice, flag) {
        this._primaryButton.innerHTML = "CONTINUE";
        this._primaryButton.putEventListener(this.getState().nextPage.bind(this.getState()));
        if (flag === "correct") {
            this.showCorrectFeedback();
        } else {
            this.showWrongFeedback();
        }
    }
    
    showWrongFeedback() {
        this._primaryButton.setType("red");
        this._container.classList.add("wrong");
        this._container.classList.remove("correct");
    }

    showCorrectFeedback() {
        this._primaryButton.setType("primary");
        this._container.classList.remove("wrong");
        this._container.classList.add("correct");
    }

    hideFeedback() {
        this._container.classList.remove("wrong");
        this._container.classList.remove("correct");
    }

    onPageChange(_oldPage, newPage) {
        if (newPage == null) {
            this.updateBoth("START", `<a href="index.html">RETURN</a>`);
            this._primaryButton.putEventListener(this.getState().nextPage.bind(this.getState()));
            return;
        }
        if (newPage.done) {
            this.updateBoth("CONTINUE", "REVIEW");
            this.hideFeedback();
            this._primaryButton.setAttribute("type", "primary");
            this._secondaryButton.putEventListener(() => {
                this.getState().resetPageIterator();
                this.getState().nextPage();
            });
            return;
        }
        this.hideFeedback();
        this._primaryButton.setAttribute("type", "inactive");
        this._primaryButton.resetListener();
        this._secondaryButton.putEventListener(() => {
            this.getState().skip();
            this.getState().nextPage();
        });
        this.updateBoth("SELECT", "SKIP");
    }

    getState() {
        return this._state;
    }
}

class NahwProgressBarElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
        }

        div {
            height: inherit;
            background-color: var(--progress-bg);
            border-radius: 25px;
            box-shadow:
                inset 0 1px 1px rgba(255, 255, 255, .3),
                inset 0 -1px 1px rgba(255, 255, 255, .3);
        }

        #value {
            display: block;
            height: 100%;
            border-top-left-radius: 25px;
            border-bottom-left-radius: 25px;
            background-color: var(--progress-value);
            overflow: hidden;
            position: relative;
        }

        #glow {
            position: absolute;
            top: 25%;
            width: 98%;
            left: 1%;
            height: 3px;
            background-color: var(--progress-glow);
            border-radius: 25px;
        }

        #value.filled {
            border-top-right-radius: 25px;
            border-bottom-right-radius: 25px;
            background-color: var(--progress-complete-value)
        }

    </style>
    <div>
        <span id="value" style="width: 80%">
            <span id="glow"></span>
        </span>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwProgressBarElement.templateHTML;
        this._valueSpan = root.querySelector("#value");
    }

    setValue(value) {
        this._valueSpan.style.width = `${value}%`;
        if (value === 100) {
            this._valueSpan.classList.add("filled");
        } else {
            this._valueSpan.classList.remove("filled");
        }
    }

    updateBar() {
        let pgNum = this.getState().getCurrentPageNumber();
        if (pgNum == null) {
            this.setValue(0);
        } else {
            pgNum += 1;
            this.setValue(pgNum / this.getState().getTotalPages() * 100);
        }
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        state.addSubmissionListener(this);
        state.addPageChangeListener(this);
        this.updateBar();
    }

    onSubmission() {
        let pgNum = this.getState().getCurrentPageNumber();
        if (pgNum == null) {
            this.setValue(0);
        } else {
            pgNum += 1;
            this.setValue(pgNum / this.getState().getTotalPages() * 100);
        }
    }

    onPageChange(_oldPage, newPage) {
        if (newPage.done) {
            this.setValue(100);
            return;
        }
        let pgNum = this.getState().getCurrentPageNumber();
        if (pgNum == null) {
            this.setValue(0);
        } else {
            this.setValue(pgNum / this.getState().getTotalPages() * 100);
        }
    }

    getState() {
        return this._state;
    }
}

class NahwInputElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
        }

        div {
            display: flex;
            justify-content: space-between;
        }

        .hidden {
            display: none;
        }
    </style>
    <div>
        <nahw-input-card>TEST</nahw-input-card>
        <nahw-input-card>TEST</nahw-input-card>
        <nahw-input-card>TEST</nahw-input-card>
        <nahw-input-card>TEST</nahw-input-card>
    </div>`;
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwInputElement.templateHTML;
        this._container = root.querySelector("div");
        for (let i = 0; i < this._container.children.length; ++i) {
            const card = this._container.children[i];
            card.setShortcut("" + (i + 1));
        }
    }

    onPageChange(_oldPage, newPage) {
        if (newPage == null || newPage.done) {
            this._container.classList.add("hidden");
            return;
        }
        this._container.classList.remove("hidden");
        const word = newPage.value.word;
        const endings = word.generateEndings();
        for (let i = 0; i < this._container.children.length; ++i) {
            const el = this._container.children[i];
            const ending = endings[i];
            el.setChoice(ending);
        }
    }

    bindToState(state) {
        this._state = state;
        for (let card of this._container.children) {
            card.bindToState(state);
        }
        state.addPageChangeListener(this);
        this.onPageChange(null, state.getCurrentPage());
    }

    getState() {
        return this._state || null;
    }
}

class NahwInputCardElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
        }

        .container {
            height: 32vh;
            width: 9.5vw;
            background-color: var(--input-card-fill);
            border-radius: 12px;
            border: 2px solid var(--input-card-stroke);
            box-shadow: 0 4px var(--input-card-stroke);
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .selectable {
            cursor: pointer;
        }

        .choice {
            font-size: 7rem;
            user-select: none;
            font-family: Amiri;
        }

        .shortcut {
            position: absolute;
            right: 10%;
            bottom: 2%;
            user-select: none;
            color: var(--input-card-shortcut);
            font-weight: 800;
            font-size: 1.5rem;
            border-radius: 8px;
        }

        .active {
            background-color: var(--input-card-active-fill);
            border-color: var(--input-card-active-stroke);
            box-shadow: 0 4px var(--input-card-active-stroke);
        }

    </style>
    <div class="container selectable">
        <p class="choice"><slot></slot></p>
        <p class="shortcut">1</p>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwInputCardElement.templateHTML;
        this._container = root.querySelector(".container");
        this._choice = root.querySelector(".choice");
        this._shortcut = root.querySelector(".shortcut");
    }
    
    bindToState(state) {
        this._state = state;
        state.addSelectionChangeListener(this);
        state.addPageChangeListener(this);
        state.addSubmissionListener(this);
        this._onClick = () => state.selectChoice(this._choice.innerText);
        this._container.addEventListener("click", this._onClick);
    }

    setChoice(choice) {
        this._container.removeEventListener("click", this._onClick);
        this._choice.innerText = choice;
        this._onClick = () => this.getState().selectChoice(this._choice.innerText);
        this._container.addEventListener("click", this._onClick);
    }

    onSelectionChange(_oldSelection, newSelection) {
        if (newSelection === this._choice.innerText) {
            this._container.classList.add("active");
        } else {
            this._container.classList.remove("active");
        }
    }

    onPageChange(_oldPage, _newPage) {
        this._container.classList.remove("active");
        this._container.classList.add("selectable");
        this._container.addEventListener("click", this._onClick);
    }

    onSubmission() {
        this._container.removeEventListener("click", this._onClick);
        this._container.classList.remove("selectable");
    }

    setShortcut(key) {
        console.assert(typeof key === "string");
        console.assert(key.length === 1);
        this._shortcutFunc = (e) => {
            if (e.key === key) {
                this._container.click();
            }
        };
        this._shortcut.innerText = key;
    }
    
    connectedCallback() {
        if (this._shortcutFunc) {
            document.body.addEventListener("keydown", this._shortcutFunc);
        }
    }

    disconnectedCallback() {
        if (this._shortcutFunc) {
            document.body.removeEventListener("keydown", this._shortcutFunc);
        }
    }

    getState() {
        return this._state;
    }
}

customElements.define("nahw-question", NahwQuestionElement);
customElements.define("nahw-text", NahwTextElement);
customElements.define("nahw-footer", NahwFooterElement);
customElements.define("nahw-progress-bar", NahwProgressBarElement);
customElements.define("nahw-exit-button", NahwExitButtonElement);
customElements.define("nahw-button", NahwButtonElement);
customElements.define("nahw-input", NahwInputElement);
customElements.define("nahw-input-card", NahwInputCardElement);
customElements.define("nahw-tooltip", NahwTooltipElement);
