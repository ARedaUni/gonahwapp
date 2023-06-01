"use strict";

class Keyboard {

    constructor(view, data, onClick, onSubmit) {
        this.view = view;
        this.data = data;
        this.onClick = onClick;
        this.onSubmit = onSubmit;
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "arabic-keyboard";
        this.HTML.baseKeys = [];
        this.HTML.activeKeys = [];
        this.HTML.redKeys = [];
        this.HTML.greenKeys = [];
        this._addShortVowels(data.keyboard.single, data.keyboard.double);
        if (data.keyboard.letters) {
            this._addLetters();
        }
        if (data.keyboard.space) {
            this._addSpace();
        }
        this._addSubmitButton();
    }

    // TODO: Rewrite submit and onclick to utilize render
    render() {
        for (let key of this.HTML.baseKeys) {
            key.removeAttribute("active");
        }
        for (let key of this.HTML.activeKeys) {
            key.setAttribute("active", "");
        }
        for (let key of this.HTML.greenKeys) {
            key.setAttribute("correct", "");
        }
        for (let key of this.HTML.redKeys) {
            key.setAttribute("wrong", "");
        }
        if (this.HTML.activeKeys.length > 0) {
            this.HTML.submitBtn.removeAttribute("disabled");
        } else {
            this.HTML.submitBtn.setAttribute("disabled", "");
        }
        return this.HTML.root;
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }

    _getHTMLKey(text) {
        for (let key of this.HTML.baseKeys) {
            if (key.innerText === text) {
                return key;
            }
        }
        return null;
    }

    _addShortVowels(single=true, double=true) {
        this.HTML.svowelRow = document.createElement("div");
        let svowelRowChars = [];
        if (single)
            svowelRowChars.push(svowel.DAMMA, svowel.FATHA, svowel.KASRA, svowel.SUKOON);
        if (double)
            svowelRowChars.push(svowel.DAMMATAN, svowel.FATHATAN, svowel.KASRATAN);
        this._createButtons(svowelRowChars, this.HTML.svowelRow);
        this.HTML.root.appendChild(this.HTML.svowelRow);
    }

    _addLetters() {
        this.HTML.topRow = document.createElement("div");
        this.HTML.middleRow = document.createElement("div");
        this.HTML.bottomRow = document.createElement("div");

        const topRowChars = ["ض", "ص", "ث", "ق", "ف",
            "غ", "ع", "ه", "خ", "ح", "ج", "د"];
        const middleRowChars = ["ذ", "ش", "س", "ي", "ب",
            "ل","ا","ت","ن","م","ك","ط"];
        const bottomRowChars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
            "ة", "و", "ز", "ظ"];

        this._createButtons(topRowChars, this.HTML.topRow);
        this._createButtons(middleRowChars, this.HTML.middleRow);
        this._createButtons(bottomRowChars, this.HTML.bottomRow);            

        this.HTML.root.appendChild(this.HTML.topRow);
        this.HTML.root.appendChild(this.HTML.middleRow);
        this.HTML.root.appendChild(this.HTML.bottomRow);

    }

    _addSubmitButton() {
        let submitNode = document.createTextNode("➡");
        let submitDiv = document.createElement("div");
        submitDiv.keyboard = this;
        submitDiv.className = "arabic-keyboard-btn submit-btn";
        submitDiv.appendChild(submitNode);
        submitDiv.addEventListener("click", this.onSubmit);
        submitDiv.setAttribute("disabled", "");
        this.HTML.submitBtn = submitDiv;
        this.HTML.bottomRow.appendChild(submitDiv);        
    }

    _createButtons(chars, row) {
        for (let char of chars) {
            const button = document.createElement("div");
            button.className = "arabic-keyboard-btn";
            button.keyboard = this;
            const node = document.createTextNode(char);
            button.appendChild(node);
            row.appendChild(button);
            this.HTML.baseKeys.push(button);
            button.addEventListener("click", this.onClick);
        }
    }
}
