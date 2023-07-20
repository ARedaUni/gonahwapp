
"use strict";

const svowel = {
    "DAMMA": "\u064f\u25cc",
    "DAMMATAN": "\u064c\u25cc",
    "FATHA": "\u064e\u25cc",
    "FATHATAN": "\u064b\u25cc",
    "KASRA": "\u0650\u25cc",
    "KASRATAN": "\u064d\u25cc",
    "SUKOON": "\u0652\u25cc",

    getShortVowels: () => Object.values(svowel).slice(0,7),
    isShortVowel: (value) => svowel.getShortVowels().some(x => x === value),
    toggleTanween: (x) => {
        const code = x.codePointAt(0);
        switch (code) {
            case svowel.DAMMATAN.codePointAt(0):
            case svowel.FATHATAN.codePointAt(0):
            case svowel.KASRATAN.codePointAt(0):
                return String.fromCodePoint(code + 3) + "\u25cc";
            case svowel.DAMMA.codePointAt(0):
            case svowel.FATHA.codePointAt(0):
            case svowel.KASRA.codePointAt(0):
                return String.fromCodePoint(code - 3) + "\u25cc";
            default:
                return x;
        }
    },
};

class Util {
    static getSkeleton(text) {
        const vowels = svowel.getShortVowels().join("");
        return text.split("").filter(x => vowels.indexOf(x) === -1).join("");
    }

    static getLetterPacks(text) {
        let letters = [];
        for (let i = 0; i < text.length; ++i) {
            const c = text[i];
            if (c === "," || c === "?" || c === "؟" || c === " " || (c >= "ء" && c <= "ي")) {
                letters.push(c);
            } else {
                letters[letters.length - 1] += c;
            }
        }
        return letters.map(x => Util._letterPackToObject(x));
    }

    static _letterPackToObject(letterPack) {
        let packObject = {};
        packObject.letter = letterPack[0];
        if (letterPack[1] && letterPack[1] !== svowel.SHADDA[0]) {
            packObject.svowel = letterPack[1] + "\u25cc";
            if (letterPack[2] === svowel.SHADDA[0]) {
                packObject.shadda = true;
            } else {
                packObject.shadda = false;
            }
        } else if (letterPack[2]) {
            packObject.svowel = letterPack[2] + "\u25cc";
            packObject.shadda = true;
        }
        return packObject;
    }
}


const QuestionViewHelper = {
    init(view) {
        view.HTML = {};
        view.HTML.root = document.createElement("div");
        view.HTML.root.className = "question";
    },

    defaultPrompt(view) {
        view.HTML.prompt = document.createElement("p");
        let promptNode = document.createTextNode(view.data.prompt);
        view.HTML.prompt.appendChild(promptNode);
        view.HTML.root.appendChild(view.HTML.prompt);
    },

    defaultQuestion(view) {
        this.init(view);
        this.defaultPrompt(view);

        // Create feedback
        view.HTML.feedback = document.createElement("span");
        view.HTML.feedback.className = "feedback";
        view.HTML.prompt.appendChild(view.HTML.feedback);

        // Create hint
        view.HTML.hint = document.createElement("p");
        view.HTML.hint.className = "hint";
        view.hint = "";
        view.HTML.root.appendChild(view.HTML.hint);

        if (view.data.hint) {
            view.HTML.hint.innerText = view.data.hint;
        }
    },

    unlockQuestion(refView, questionState) {
        const parent = refView.HTML.root.parentElement;
        questionStates.push(questionState);
        let questionView = questionState.getView();
        let node = questionView.init();
        questionHTMLs.push(node);
        let ref;
        if (ref = refView.HTML.root.nextElementSibling) {
            parent.insertBefore(node, ref);
        } else {
            parent.appendChild(node);
        }
        setVW();
    },
}

class SubmitButton {
    constructor(onSubmit) {
        this.onSubmit = onSubmit;
        this.HTML = {};
        let btn = this.HTML.root = document.createElement("div");
        btn.innerText = "Submit";
        btn.className = "submit";
        btn.button = this;

        this.disable();
    }

    getRootHTML() {
        return this.HTML.root;
    }

    disable() {
        if (this.disabled) return;
        this.disabled = true;
        this.HTML.root.setAttribute("disabled", "");
        this.HTML.root.removeEventListener("click", this.onSubmit);
    }

    enable() {
        if (!this.disabled) return;
        this.disabled = false;
        this.HTML.root.removeAttribute("disabled");
        this.HTML.root.addEventListener("click", this.onSubmit);
    }

    show() {
        this.HTML.root.removeAttribute("hidden");
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }

    click() {
        this.HTML.root.click();
    }
}

class Keyboard {
    constructor() {
        this.rows = {};
        this.characterKeys = [];
        this.allKeys = [];

        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "arabic-keyboard";
    }

    render() {
        for (let key of this.allKeys) {
            key.render();
        }
    }

    getRootHTML() {
        return this.HTML.root;
    }

    resetCharacterKeys() {
        for (let key of this.characterKeys) {
            key.setFlag("normal");
        }
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }

    show() {
        this.HTML.root.removeAttribute("hidden");
    }
    
    addShortVowels(onClick, single=true, double=true) {
        console.assert(typeof(onClick) === "function");

        let row = this.addRow("svowelRow");
        let svowelRowChars = [];
        if (single)
            svowelRowChars.push(svowel.SHADDA, svowel.DAMMA, svowel.FATHA, svowel.KASRA, svowel.SUKOON);
        if (double)
            svowelRowChars.push(svowel.DAMMATAN, svowel.FATHATAN, svowel.KASRATAN);
        this._createButtons(svowelRowChars, row, onClick);
    }

    addLetters(onClick) {
        console.assert(typeof(onClick) === "function");

        let topRow = this.addRow("topRow");
        let middleRow = this.addRow("middleRow");
        let bottomRow = this.addRow("bottomRow");

        const topRowChars = ["ض", "ص", "ث", "ق", "ف",
            "غ", "ع", "ه", "خ", "ح", "ج", "د"];
        const middleRowChars = ["ذ", "ش", "س", "ي", "ب",
            "ل","ا","ت","ن","م","ك","ط"];
        const bottomRowChars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
            "ة", "و", "ز", "ظ"];

        this._createButtons(topRowChars, topRow, onClick);
        this._createButtons(middleRowChars, middleRow, onClick);
        this._createButtons(bottomRowChars, bottomRow, onClick);
    }

    addSpaceButton(onSpace) {
        console.assert(typeof(onSpace) === "function");

        let spaceRow = this.addRow("spaceRow");
        let spaceBtn = this.addButton(" ", spaceRow, onSpace, true);
        spaceBtn.addClass("space-btn");
        spaceBtn.render();
        this.allKeys.push(spaceBtn);
    }

    getSpaceButton() {
        return this.getRow("spaceRow")[0];
    }

    addBackspaceButton(row, onBackspace) {
        console.assert(typeof(row) === "object" || typeof(row) === "object");
        console.assert(typeof(onBackspace) === "function");

        let backspaceBtn = this.addButton("⌫", row, onBackspace, true);
        this.allKeys.push(backspaceBtn);
    }

    addRow(rowName) {
        console.assert(typeof(rowName) === "string");

        this.HTML[rowName] = document.createElement("div");
        this.HTML.root.appendChild(this.HTML[rowName]);
        this.rows[rowName] = [];
        this.rows[rowName].getHTML = () => this.HTML[rowName];
        return this.rows[rowName];
    }

    getRow(name) {
        console.assert(typeof(name) === "string")
        console.assert(this.rows[name] != undefined);
        return this.rows[name];
    }


    getRowHTML(name) {
        console.assert(typeof(name) === "string")
        console.assert(this.HTML[name] != undefined);
        return this.HTML[name];
    }

    addButton(text, row, onClick, special=false) {
        console.assert(typeof(text) === "string");
        console.assert(typeof(row) === "object");
        console.assert(typeof(onClick) === "function");
        console.assert(typeof(special) === "boolean");

        const button = new KeyboardButton(text, onClick);
        button.keyboard = this;
        row.getHTML().appendChild(button.getRootHTML());
        this.allKeys.push(button);
        row.push(button);
        if (!special) {
            this.characterKeys.push(button);
        }
        return button;
    }

    _createButtons(chars, row, onClick) {
        for (let char of chars) {
            this.addButton(char, row, onClick);
        }
    }
}

class KeyboardButton {
    static FLAGS = ["disabled", "normal", "active", "wrong", "close", "correct"];

    constructor(text, onClick) {
        console.assert(typeof(text) === "string");
        console.assert(typeof(onClick) === "function");

        this.setText(text);
        this.setFlag("normal");
        this._extraClasses = "";

        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.button = this;
        this.setCallback(onClick);
        this.render();
    }

    getRootHTML() {
        return this.HTML.root;
    }

    render() {
        this.HTML.root.innerText = this.getText();
        this.HTML.root.className =
            `arabic-keyboard-btn ${this.getFlag()} ${this._extraClasses}`;
        if (["disabled", "active", "wrong", "correct"].indexOf(this.getFlag()) !== -1) {
            this.HTML.root.removeEventListener("click", this.getCallback());
        } else {
            this.HTML.root.addEventListener("click", this.getCallback());
        }
    }

    setFlag(flag) {
        console.assert(KeyboardButton.FLAGS.some(x => x === flag),
            "Flag %s is not recognized", flag);
        this._flag = flag;
    }

    getFlag() {
        return this._flag;
    }

    setText(text) {
        this._text = text;
    }

    getText() {
        return this._text;
    }

    setCallback(func) {
        console.assert(typeof(func) === "function");
        this._onClick = func;
    }

    getCallback() {
        return this._onClick;
    }

    addClass(className) {
        if (this._extraClasses.indexOf(className) !== -1) return;
        this._extraClasses += className;
    }

    removeClass(className) {
        className = className.trim();
        let index = this._extraClasses.indexOf(className);
        if (index === -1) return;
        this._extraClasses = this._extraClasses.substr(0, index) +
            this._extraClasses.substr(1 + index + className.length);
    }
}
