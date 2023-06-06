"use strict";

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

class SAQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.defaultQuestion(this);
            if (this.data.image) {
                this.HTML.img = document.createElement("img");
                this.HTML.img.src = this.data.image;                
                this.HTML.root.appendChild(this.HTML.img);
            }
            this.input = new Input(this);
            this.HTML.root.appendChild(this.input.render(true));
            if (this.data.input.lang === "ar") {
                this.keyboard = Keyboard.setupForSA(this);
                this.HTML.root.appendChild(this.keyboard.HTML.root);                
            }
            return this.HTML.root;
        }

        if (this.data.hasAnsweredSkeleton()) {
            this.complete();
        } else {
            this.HTML.feedback.innerHTML = "";
            for (let {flag, value} of this.input.valueFlags) {
                let fValue = document.createElement("span");
                fValue.innerText = value + " ";
                switch (flag) {
                    case Input.flag.CORRECT:
                        fValue.className = "correct";
                        break;
                    case Input.flag.WRONG_PLACE:
                        fValue.className = "close";
                        break;
                    case Input.flag.NOT_FOUND:
                        fValue.className = "wrong";
                        break;
                    default:
                        console.error(`Flag ${flag} is not recognized`);
                }
                this.HTML.feedback.appendChild(fValue);
            }
        }
        return this.HTML.root;
    }

    complete() {
        const answer = this.data.skeletonAnswer;
        this.HTML.feedback.innerText = `✅ ${answer}`;
        this.HTML.feedback.className = "feedback correct";
        this.keyboard.hide();
        this.input.hide();
        this.HTML.hint.setAttribute("hidden", "");

        if (this.data.input.svowels) {
            const parent = this.HTML.root.parentElement;
            let qs = new SVowelsQuestionState(this.data.answer);
            let qv = new SVowelsQuestionView(qs);
            questionViews.push(qv);
            let ref;
            if (ref = this.HTML.root.nextElementSibling) {
                parent.insertBefore(qv.update(true), ref);
            } else {
                parent.appendChild(qv.update(true));
            }
        }
    }
}

class SVQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.defaultQuestion(this);            
            this.keyboard = Keyboard.setupForSV(this);
            this.HTML.root.appendChild(this.keyboard.HTML.root);
            return this.HTML.root;
        }

        for (let key of this.keyboard.HTML.characterKeys) {
            key.removeAttribute("active");
        }
        for (let key of this.keyboard.HTML.activeKeys) {
            key.setAttribute("active", "");
        }
        for (let key of this.keyboard.HTML.greenKeys) {
            key.setAttribute("correct", "");
        }
        for (let key of this.keyboard.HTML.redKeys) {
            key.setAttribute("wrong", "");
        }

        if (this.keyboard.HTML.activeKeys.length > 0) {
            this.keyboard.HTML.submitBtn.removeAttribute("disabled");
        } else {
            this.keyboard.HTML.submitBtn.setAttribute("disabled", "");
        }
    
        this.HTML.hint.innerText = this.keyboard.hint || this.data.hint;
        this._updateFeedback();                

        if (this.data.answersLeft() === 0) {
            this.complete();
        }

        return this.HTML.root;
    }

    complete() {
        this.keyboard.hide();
        this.HTML.hint.className = "correct";
        this.HTML.hint.innerText = this.data.answers.join(" ") + " ✅";
    }

    _updateFeedback() {
        const OVERRIDE_LTR = "\u202D";
        this.HTML.feedback.innerHTML = "";
        if (this.keyboard.HTML.activeKeys.length !== 0) {
            for (let key of this.keyboard.HTML.activeKeys) {
                let fKey = document.createElement("span");
                fKey.className = "regular";
                fKey.innerText =  OVERRIDE_LTR + key.innerText + " ";
                this.HTML.feedback.appendChild(fKey);
            }
        } else if (this.data.lastAttempt) {
            for (let key of this.data.lastAttempt) {
                let fKey = document.createElement("span");
                fKey.className = key.correct ? "correct" : "wrong";
                fKey.innerText = OVERRIDE_LTR + key.value + " ";
                this.HTML.feedback.appendChild(fKey);
            }
        }
    }
}

class SVowelsQuestionView {
    constructor(data) {
        this.data = data;
    }

    update(init=false) {
        if (init) {
            QuestionViewHelper.init(this);
            QuestionViewHelper.defaultPrompt(this);

            this.keyboard = new Keyboard();
            this.keyboard.view = this;
            this.keyboard.selectedIndex = 0;
            this.keyboard.HTML.activeKeys = {};
            this.keyboard.addShortVowels((e) => {
                const kb = e.target.keyboard;
                const view = kb.view;
                const button = e.target;
                if (kb.HTML.activeKeys[kb.selectedIndex] === button) return;
                kb.view.HTML.skeleton.children[kb.selectedIndex].flag = null;
                kb.HTML.activeKeys[kb.selectedIndex] = button;
                kb.view.next();
                kb.view.update();
            }, true, true);
            this.keyboard.addSubmitButton((e) => {
                const kb = e.target.keyboard;
                const view = kb.view;
                let spacesSkipped = 0;
                for (let i = 0; i < view.HTML.skeleton.children.length; ++i) {
                    const el = view.HTML.skeleton.children[i];
                    const ans = el.innerText;
                    el.className = "svowel-skeleton-letter";
                    if (ans.length > 1) {
                        const correspondingSV = view.data.getShortVowel(i - spacesSkipped);
                        if (ans[1] === correspondingSV) {
                            el.flag = "correct";
                        } else if (svowel.toggleTanween(ans[1]) === correspondingSV) {
                            el.flag = "close";
                        } else {
                            el.flag = "wrong";
                        }
                    } else {
                        spacesSkipped++;
                    }
                }
                view.data.try(Array.from(view.HTML.skeleton.children).map(x => x.innerText).join(""));
                view.update();
            }, this.keyboard.HTML.svowelRow);

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
                letter.addEventListener("click", SVowelsQuestionView._onLetterClick);
            }

            this.HTML.hint = document.createElement("p");
            this.HTML.hint.className = "hint";
            this.HTML.hint.innerText = "You can select a letter by clicking on it!";


            this.HTML.root.appendChild(this.HTML.hint);
            this.HTML.root.appendChild(this.HTML.skeleton);
            this.HTML.root.appendChild(this.keyboard.HTML.root);
        }

        if (this.HTML.skeleton.children[this.keyboard.selectedIndex].flag === "correct") {
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
            letter.classList.remove("regular");

            if (letter.flag === "correct") {
                letter.classList.add("correct");
                letter.removeEventListener("click", SVowelsQuestionView._onLetterClick);
            } else if (letter.flag === "close") {
                letter.classList.add("close");
            } else if (letter.flag === "wrong") {
                letter.classList.add("wrong");
            } else {
                letter.className = "svowel-skeleton-letter";
            }
        }

        for (let key of this.keyboard.HTML.characterKeys) {
            key.removeAttribute("active");
        }

        this.HTML.skeleton.children[this.keyboard.selectedIndex].classList.add("regular");
        let activeKey;
        if (activeKey = this.keyboard.HTML.activeKeys[this.keyboard.selectedIndex]) {
            activeKey.setAttribute("active", "");
        }

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
        for (let letterSpan of this.HTML.skeleton.children) {
            const text = letterSpan.innerText;
            if (text.length === 1 && text !== " ") return false;
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
            letter.removeEventListener("click", SVowelsQuestionView._onLetterClick);
        }
    }

    _resetToSkeleton() {
        let skeleton_letters = this.data.skeleton.split("");
        for (let i = 0; i < this.HTML.skeleton.children.length; ++i) {
            const letter = this.HTML.skeleton.children[i];
            letter.innerText = skeleton_letters[i];
        }
    }

    static _onLetterClick(e) {
        e.target.view.keyboard.selectedIndex = e.target.index;
        e.target.view.update();
    }
}
