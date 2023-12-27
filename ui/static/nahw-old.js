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
            width: 50vw;
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
    const root = this.attachShadow({ mode: "open" });
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
    const root = this.attachShadow({ mode: "open" });
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
    const root = this.attachShadow({ mode: "open" });
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
    const root = this.attachShadow({ mode: "open" });
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
    const root = this.attachShadow({ mode: "open" });
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
    const root = this.attachShadow({ mode: "open" });
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
}
