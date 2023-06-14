"use strict";

class ShortVowelQS {
    static flag = {
        CORRECT: 0,
        TOGGLE_TANWEEN: 1,
        TOGGLE_SHADDA: 2,
        WRONG: 3
    }

    constructor(answer) {
        this.answer = answer;
        this.prompt = "Insert the correct vowels";
        this.skeleton = Util.getSkeleton(this.answer);
        this.answerLP = Util.getLetterPacks(this.answer);
        this.attempts = [];
    }

    // Assumes letters are the same
    try(value, push=true) {
        let valueLP = Util.getLetterPacks(value);
        let flags = [];
        let correct = true;
        for (let i = 0; i < valueLP.length; ++i) {
            if (valueLP[i].svowel === this.answerLP[i].svowel &&
                valueLP[i].shadda === this.answerLP[i].shadda) {
                flags.push({flag: ShortVowelQS.flag.CORRECT, value: valueLP[i]});
            } else if (valueLP[i].svowel && svowel.toggleTanween(valueLP[i].svowel) === this.answerLP[i].svowel) {
                flags.push({flag: ShortVowelQS.flag.TOGGLE_TANWEEN, value: valueLP[i]});
                correct = false;
            } else if (valueLP[i].shadda === this.answerLP[i].shadda) {
                flags.push({flag: ShortVowelQS.flag.TOGGLE_SHADDA, value: valueLP[i]});
                correct = false;
            } else {
                flags.push({flag: ShortVowelQS.flag.WRONG, value: valueLP[i]});
                correct = false;
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
        return this.view = new ShortVowelQV(this);
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class ShortVowelQV {
    constructor(data) {
        this.data = data;
        this.selectedIndex = 0;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.init(this);
            QuestionViewHelper.defaultPrompt(this);

            this.keyboard = new Keyboard();
            this.keyboard.view = this;
            this.keyboard.HTML.shadda = {};
            this.keyboard.addShortVowels(ShortVowelQV._onShortVowelClick, true, true);
            this.keyboard.addSubmitButton(ShortVowelQV._onSubmitClick, this.keyboard.HTML.svowelRow);

            this.HTML.skeleton = document.createElement("div");
            this.HTML.skeleton.className = "svowel-skeleton";
            const skeleton_letters = this.data.skeleton.split("");
            for (let i = 0; i < skeleton_letters.length; i++) {
                let letter = document.createElement("span");
                letter.innerText = skeleton_letters[i];
                this.HTML.skeleton.appendChild(letter);
                if (letter.innerText === " ") continue;
                letter.classList.add("svowel-skeleton-letter");
                letter.index = i;
                letter.view = this;
                letter.addEventListener("click", ShortVowelQV._onLetterClick);
            }

            this.HTML.hint = document.createElement("p");
            this.HTML.hint.className = "hint";
            this.HTML.hint.innerText = "You can select a letter by clicking on it!";


            this.HTML.root.appendChild(this.HTML.hint);
            this.HTML.root.appendChild(this.HTML.skeleton);
            this.HTML.root.appendChild(this.keyboard.HTML.root);
        }

        if (this.HTML.skeleton.children[this.selectedIndex].flag === "correct") {
            if (this.data.lastAttempt.correct) {
                this.complete();
                return;
            } else {
                this.next();
                this.update();
            }
        }

        if (!init) {
            this._resetToSkeleton();
        }
        this.keyboard.HTML.submitBtn.setAttribute("hidden", "");
        this.keyboard.HTML.submitBtn.setAttribute("disabled", "");
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const letter = this.HTML.skeleton.children[i];
            let svowel;
            if (svowel = this.keyboard.HTML.activeKeys[i]) {
                letter.innerText += svowel.innerText[0];
            }
            let shadda;
            if (shadda = this.keyboard.HTML.shadda[i]) {
                letter.innerText += shadda.innerText[0];
            }
            letter.classList.remove("regular");

            if (letter.flag === "correct") {
                letter.classList.add("correct");
                letter.removeEventListener("click", ShortVowelQV._onLetterClick);
            } else if (letter.flag === "close") {
                letter.classList.add("close");
            } else if (letter.flag === "wrong") {
                letter.classList.add("wrong");
            } else {
                letter.className = "svowel-skeleton-letter";
            }
        }

        this.HTML.skeleton.children[this.selectedIndex].classList.add("regular");
        this.keyboard.update();

        if (this.canSubmit()) {
            this.keyboard.HTML.submitBtn.removeAttribute("hidden");
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
        }

        return this.HTML.root;
    }

    next() {
        this.keyboard.selectedIndex++;
        if (this.keyboard.selectedIndex >= this.HTML.skeleton.children.length) {
            this.keyboard.selectedIndex = 0;
        }
        if (this.HTML.skeleton.children[this.keyboard.selectedIndex].innerText === " ") {
            this.keyboard.selectedIndex++;
        }
    }

    canSubmit() {
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const text = this.HTML.skeleton.children[i].innerText;
            if (text === " ") continue;
            if (this.keyboard.HTML.activeKeys[i] == undefined) return false;
        }
        return true;
    }

    complete() {
        let check = document.createElement("span");
        check.innerText = `${this.data.answer} ✅`;
        check.className = "correct";
        this.HTML.skeleton.innerHTML = "";
        this.HTML.skeleton.appendChild(check);
        this.keyboard.hide();
        this.HTML.hint.setAttribute("hidden", "");
        for (let letter of this.HTML.skeleton.children) {
            letter.removeEventListener("click", ShortVowelQV._onLetterClick);
        }
    }

    _resetToSkeleton() {
        let skeleton_letters = this.data.skeleton.split("");
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const letter = this.HTML.skeleton.children[i];
            letter.innerText = skeleton_letters[i];
        }
    }

    static _onSubmitClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        const answerLetterPacks = Util.getLetterPacks(kb.view.data.answer);
        for (let i = 0; i < view.HTML.skeleton.children.length; ++i) {
            const el = view.HTML.skeleton.children[i];
            let value = el.innerText.slice(1);
            let ans = answerLetterPacks[i].slice(1);
            if (value.length === 2) {
                let vShaddaIndex = value.indexOf(svowel.SHADDA[0]);
                let aShaddaIndex = ans.indexOf(svowel.SHADDA[0]);
                if (aShaddaIndex === -1) {
                    el.flag = "wrong";
                    continue;
                }
                // Remove shadda
                value = vShaddaIndex === 0 ? value[1] : value[0];
                ans = aShaddaIndex === 0 ? ans[1] : ans[0];
            }

            if (value.length === 1) {
                if (value === ans) {
                    el.flag = "correct";
                } else if (svowel.toggleTanween(value) === ans) {
                    el.flag = "close";
                } else {
                    el.flag = "wrong";
                }
            }
        }
        view.data.try(Array.from(view.HTML.skeleton.children).map(x => x.innerText).join(""));
        view.update();
    }

    static _onShortVowelClick(e) {
        const kb = e.target.keyboard;
        const view = kb.view;
        const button = e.target;
        if (kb.HTML.activeKeys[kb.selectedIndex] === button) return;
        kb.view.HTML.skeleton.children[kb.selectedIndex].flag = null;
        if (button.innerText !== svowel.SHADDA) {
            kb.HTML.activeKeys[kb.selectedIndex] = button;
            kb.view.next();
        } else {
            if (kb.HTML.shadda[kb.selectedIndex] === button) {
                kb.HTML.shadda[kb.selectedIndex] = null;
            } else {
                kb.HTML.shadda[kb.selectedIndex] = button;
            }
        }
        kb.view.update();
    }

    static _onLetterClick(e) {
        e.target.view.keyboard.selectedIndex = e.target.index;
        e.target.view.update();
    }
}
