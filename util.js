"use strict";

const svowel = {
    "DAMMA": "\u064f\u25cc",
    "DAMMATAN": "\u064c\u25cc",
    "FATHA": "\u064e\u25cc",
    "FATHATAN": "\u064b\u25cc",
    "KASRA": "\u0650\u25cc",
    "KASRATAN": "\u064d\u25cc",
    "SUKOON": "\u0652\u25cc",
    "SHADDA": "\u0651\u25cc",

    getVowels: () => Object.values(svowel).map(v => v[0]).slice(0,8),
    toggleTanween: (x) => {
        const code = x.codePointAt(0);
        switch (code) {
            case svowel.DAMMATAN.codePointAt(0):
            case svowel.FATHATAN.codePointAt(0):
            case svowel.KASRATAN.codePointAt(0):
                return String.fromCodePoint(code + 3);
            case svowel.DAMMA.codePointAt(0):
            case svowel.FATHA.codePointAt(0):
            case svowel.KASRA.codePointAt(0):
                return String.fromCodePoint(code - 3);
            default:
                return x;
        }
    },
};

class Util {
    static getSkeleton(text) {
        const vowels = svowel.getVowels();
        return text.split("").filter(x => vowels.indexOf(x) === -1).join("");
    }

    static getLetterPacks(text) {
        let letters = [];
        for (let i = 0; i < text.length; ++i) {
            const c = text[i];
            if (c === " " || (c >= "ء" && c <= "ي")) {
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
            packObject.svowel = letterPack[1];
            if (letterPack[2] === svowel.SHADDA[0]) {
                packObject.shadda = true;
            } else {
                packObject.shadda = false;
            }
        } else if (letterPack[2]) {
            packObject.svowel = letterPack[2];
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
        view.hint = {};
        view.HTML.root.appendChild(view.HTML.hint);

        if (view.data.hint) {
            view.HTML.hint.innerText = view.data.hint;
        }
    }
}

class Keyboard {
    constructor() {
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "arabic-keyboard";
        this.HTML.characterKeys = [];
        this.HTML.activeKeys = [];
        this.HTML.redKeys = [];
        this.HTML.greenKeys = [];
    }

    update() {
        for (let k of this.HTML.characterKeys) {
            k.removeAttribute("active");
            k.removeAttribute("wrong");
            k.removeAttribute("correct");
        }

        for (let k of this.HTML.activeKeys) {
            if (k) {
                k.setAttribute("active", "");
            }
        }

        for (let k of this.HTML.redKeys) {
            if (k) {
                k.setAttribute("wrong", "");
            }
        }

        for (let k of this.HTML.greenKeys) {
            if (k) {
                k.setAttribute("correct", "");
            }
        }
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }
    
    addShortVowels(onClick, single=true, double=true) {
        this.HTML.svowelRow = document.createElement("div");
        let svowelRowChars = [];
        if (single)
            svowelRowChars.push(svowel.SHADDA, svowel.DAMMA, svowel.FATHA, svowel.KASRA, svowel.SUKOON);
        if (double)
            svowelRowChars.push(svowel.DAMMATAN, svowel.FATHATAN, svowel.KASRATAN);
        this._createButtons(onClick, svowelRowChars, this.HTML.svowelRow);
        this.HTML.root.appendChild(this.HTML.svowelRow);
    }

    addLetters(onClick) {
        this.HTML.topRow = document.createElement("div");
        this.HTML.middleRow = document.createElement("div");
        this.HTML.bottomRow = document.createElement("div");

        const topRowChars = ["ض", "ص", "ث", "ق", "ف",
            "غ", "ع", "ه", "خ", "ح", "ج", "د"];
        const middleRowChars = ["ذ", "ش", "س", "ي", "ب",
            "ل","ا","ت","ن","م","ك","ط"];
        const bottomRowChars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
            "ة", "و", "ز", "ظ"];

        this._createButtons(onClick, topRowChars, this.HTML.topRow);
        this._createButtons(onClick, middleRowChars, this.HTML.middleRow);
        this._createButtons(onClick, bottomRowChars, this.HTML.bottomRow);

        this.HTML.root.appendChild(this.HTML.topRow);
        this.HTML.root.appendChild(this.HTML.middleRow);
        this.HTML.root.appendChild(this.HTML.bottomRow);

    }

    addSubmitButton(onSubmit, row) {
        let submitNode = document.createTextNode("➡");
        let submitDiv = document.createElement("div");
        submitDiv.keyboard = this;
        submitDiv.className = "arabic-keyboard-btn submit-btn";
        submitDiv.appendChild(submitNode);
        submitDiv.addEventListener("click", onSubmit);
        submitDiv.setAttribute("disabled", "");
        this.HTML.submitBtn = submitDiv;
        row.appendChild(submitDiv);
    }

    addSpaceButton(onSpace) {
        let spaceBtn = document.createElement("div");
        spaceBtn.className = "arabic-keyboard-btn space-btn";
        spaceBtn.innerText = " ";
        spaceBtn.keyboard = this;
        spaceBtn.addEventListener("click", onSpace);
        this.HTML.spaceRow = document.createElement("div");
        this.HTML.spaceRow.appendChild(spaceBtn);
        this.HTML.spaceRow.space = spaceBtn;
        this.HTML.root.appendChild(this.HTML.spaceRow);
    }

    addBackspaceButton(onBackspace, row) {
        if (row == undefined) row = this.HTML.topRow;
        let backspaceBtn = document.createElement("div");
        backspaceBtn.className = "arabic-keyboard-btn backspace-btn";
        backspaceBtn.innerText = "⌫";
        backspaceBtn.keyboard = this;
        backspaceBtn.addEventListener("click", onBackspace);
        this.HTML.topRow.appendChild(backspaceBtn);
    }

    _createButtons(onClick, chars, row) {
        for (let char of chars) {
            const button = document.createElement("div");
            button.className = "arabic-keyboard-btn";
            button.keyboard = this;
            const node = document.createTextNode(char);
            button.appendChild(node);
            row.appendChild(button);
            this.HTML.characterKeys.push(button);
            button.addEventListener("click", onClick);
        }
    }
}
