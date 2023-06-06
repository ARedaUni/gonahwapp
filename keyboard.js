"use strict";

class Keyboard {

    constructor() {
        this.HTML = {};
        this.HTML.root = document.createElement("div");
        this.HTML.root.className = "arabic-keyboard";
        this.HTML.characterKeys = [];
    }

    static setupForSV(view) {
        let kb = new Keyboard();
        kb.HTML.activeKeys = [];
        kb.HTML.redKeys = [];
        kb.HTML.greenKeys = [];
        kb.view = view;
        kb.data = view.data;
        kb.addShortVowels(
            Keyboard._onSVClick,
            view.data.keyboard.single, view.data.keyboard.double);
        if (view.data.keyboard.letters) {
            kb.addLetters(Keyboard._onSVClick);
        }
        kb.addSubmitButton(Keyboard._onSVSubmit, kb.HTML.bottomRow);
        return kb;
    }

    static setupForSA(view) {
        let kb = new Keyboard();
        kb.view = view;
        kb.data = view.data;
        kb.input = view.input;
        kb.addShortVowels(
            Keyboard._SAClick,
            view.data.input.svowels, view.data.input.svowels);
        kb.addLetters(Keyboard._onSAClick);
        kb.addSpaceButton(Keyboard._onSASpaceClick);
        kb.addBackspaceButton(Keyboard._onSABackspaceClick);
        return kb;
    }

    static _onSAClick(e) {
        const text = e.target.innerText;
        const kb = e.target.keyboard;
        const input = kb.view.input;
        // check if harakah or letter
        input.setValue(input.getValue() + text);
        kb.HTML.spaceRow.space.removeAttribute("active");
    }

    static _onSASpaceClick(e) {
        const kb = e.target.keyboard;
        const input = kb.input;
        let value = input.getValue();

        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.removeAttribute("active");
            input.setValue(value.slice(0, value.length - 1));
            return;
        }
        kb.HTML.spaceRow.space.setAttribute("active", "");
        input.setValue(value + " ");
    }

    static _onSABackspaceClick(e) {
        const kb = e.target.keyboard;
        const input = kb.input;
        let value = input.getValue();
        if (value.length === 0) return;

        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.removeAttribute("active");
        }

        input.setValue(value.slice(0, value.length - 1));
        value = input.getValue();
        if (value[value.length - 1] === " ") {
            kb.HTML.spaceRow.space.setAttribute("active", "");
        }
    }

    static _onSVClick(e) {
        const kb = e.target.keyboard;
        kb.hint = null;
        if (e.ctrlKey || e.metaKey) {
            let index = kb.HTML.activeKeys.indexOf(e.target);
            if (index === -1) {
                let answersLeft = kb.data.answersLeft();
                if (kb.HTML.activeKeys.length === answersLeft) {
                    kb.hint = `You can't select more than ${answersLeft}`;
                } else {
                    kb.HTML.activeKeys.push(e.target);
                }
            }
            else {
                kb.HTML.activeKeys.splice(index, 1);
            }
        } else {
            kb.HTML.activeKeys = [e.target];
        }

        kb.view.update();
    }

    static _onSVSubmit(e) {
        const kb = e.target.keyboard;
        kb.data.try(...kb.HTML.activeKeys.map(k => k.innerText));
        for (let entry of kb.HTML.activeKeys) {
            entry.removeEventListener("click", Keyboard._onSVClick);
            if (kb.data.verify(entry.innerText)) {
                kb.HTML.greenKeys.push(entry);
            } else {
                kb.HTML.redKeys.push(entry);
            }
        }
        kb.HTML.activeKeys = [];
        kb.view.update();
    }

    hide() {
        this.HTML.root.setAttribute("hidden", "");
    }
    
    addShortVowels(onClick, single=true, double=true) {
        this.HTML.svowelRow = document.createElement("div");
        let svowelRowChars = [];
        if (single)
            svowelRowChars.push(svowel.DAMMA, svowel.FATHA, svowel.KASRA, svowel.SUKOON);
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

    addBackspaceButton(onBackspace) {
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
