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

class NahwQuestion {

    constructor(answers) {
        console.assert(answers != undefined);
        this._sentences = answers.map(x => new SentenceState(x));
        this._page = 0;
        this._pageListeners = [];
    }

    getPageNumber() {
        return this._page;
    }

    nextPage() {
        this._page += 1;
        this._pageListeners.forEach(x => x.onPageChange(this._page - 1, this._page));
    }
    
    addPageChangeListener(obj) {
        console.assert(obj.onPageChange != undefined, "Object must have an onPageChange method");
        this._pageListeners.push(obj);
    }

    getTotalPages() {
        return this.getSentences().reduce((x, s) => x + s.getWords().filter(w => w.getFlag() !== "na").length, 0);
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
        nahw-text {
            text-align: center;
            margin: 0 auto;
            width: 90%;
        }

        #header {
            height: 10px;
            width: 50%;
            margin: 1rem auto;
            display: flex;
            align-items: center;
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
    </style>
    <div>
        <header id="header">
            <nahw-exit-button></nahw-exit-button>
            <nahw-progress-bar></nahw-progress-bar>
        </header>
        <nahw-text></nahw-text>
        <nahw-footer></nahw-footer>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwQuestionElement.templateHTML;

        this._nahwText = root.querySelector("nahw-text");
        this._nahwProgressBar = root.querySelector("nahw-progress-bar");
        this._nahwFooter = root.querySelector("nahw-footer");
    }

    connectedCallback() {
        if (!this.isConnected) return;
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        this._nahwText.bindToState(state);
        this._nahwProgressBar.bindToState(state);
        this._nahwFooter.bindToState(state);
    }
}

class NahwExitButtonElement extends HTMLElement {
    static templateHTML = `
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,-25" /> 
    <a href="index.html"><span class="material-symbols-outlined">close</span></a>`;
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwExitButtonElement.templateHTML;
        this._span = root.querySelector("span");
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

        span {
            color: var(--text);
            transition: color .2s, background-color .2s;
            padding-right: .2em;
            padding-left: .2em;
        }
    </style>
    <p></p>`;
    
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwTextElement.templateHTML;
        this._container = root.querySelector("p");
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        for (let sentence of state.getSentences()) {
            const span = document.createElement("span");
            span.innerText = sentence.getFacade() + "\u200c";
            this._container.appendChild(span);
        }
    }
}

class NahwButtonElement extends HTMLElement {
    static templateHTML = `
    <style>
        button {
            border-radius: 16px;
            font-weight: 800;
            border-width: thin;
            border-style: solid;
            padding: 1rem 1.5rem;
            cursor: pointer;
            appearance: none;
            width: 150px;
            title-transform: uppercase;
            font-size: 1.2rem;
        }

        button:active:not(.inactive) {
            box-shadow: none !important;
            transform: translate(0, 3px);
        }

        .secondary {
            background-color: var(--button-secondary-fill);
            color: var(--button-secondary);
            box-shadow: 0 3px var(--button-secondary-shadow);
            border-color: var(--button-secondary-stroke);
        }

        .primary {
            background-color: var(--button-primary-fill);
            color: var(--button-primary);
            box-shadow: 0 3px var(--button-primary-shadow);
            border-color: var(--button-primary-stroke);
        }

        .inactive {
            color: var(--button-inactive);
            background-color: var(--button-inactive-fill);
            box-shadow: 0;
            cursor: not-allowed;
            border-color: var(--button-inactive-fill);
        }
    </style>
    <button type="button"><slot>SLOT</slot></button>
    `;
    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwButtonElement.templateHTML;
        this._container = root.querySelector("button");
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
            type === "inactive");
        this._container.className = type;
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === "type") {
            this.setType(newValue);
        }
    }

    static get observedAttributes() {
        return ["type"];
    }
}

class NahwFooterElement extends HTMLElement {
    static templateHTML = `
    <style>
        :host {
            display: block;
            box-sizing: border-box;
        }
        
        #footer-container {
            background-color: var(--footer-bg);
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 20%;
            border-top: 2px solid var(--footer-stroke)
        }

        #button-container {
            display: flex;
            width: 80%;
            height: 100%;
            align-items: center;
            justify-content: space-between;
            margin: 0 auto;
        }

        a {
            text-decoration: none;
            color: inherit;
        }
    </style>
    <div id="footer-container">
        <div id="button-container">
            <nahw-button type="secondary">SECONDARY</nahw-button>
            <nahw-button type="primary">PRIMARY</nahw-button>
        </div>
    </div>`;

    constructor() {
        super();
        const root = this.attachShadow({mode: "open"});
        root.innerHTML = NahwFooterElement.templateHTML;

        this._secondaryButton = root.querySelectorAll("nahw-button")[0];
        this._primaryButton = root.querySelectorAll("nahw-button")[1];
    }

    updateBoth(primary, secondary) {
        this._primaryButton.innerHTML = primary;
        this._secondaryButton.innerHTML = secondary;
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        if (this.getState().getPageNumber() === 0) {
            this.updateBoth("START", `<a href="index.html">RETURN</a>`);
            this._primaryButton.putEventListener(state.nextPage.bind(state));
        }
        state.addPageChangeListener(this);
    }

    onPageChange(_oldPage, _newPage) {
        this._primaryButton.setAttribute("type", "inactive");
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
    }

    updateBar() {
        if (this.getState().getPageNumber() === 0) {
            this.setValue(0);
        }
    }

    bindToState(state) {
        console.assert(state instanceof NahwQuestion);
        this._state = state;
        this.updateBar();
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