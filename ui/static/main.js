class ProgressBar extends HTMLElement {
  static #ATT_VALUE = "data-value"
  static #CLASS_COMPLETE = "-complete"

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [ProgressBar.#ATT_VALUE];
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="progress-bar _w-full _h-full">
        <div class="value">
          <span class="glow"></span>
        </div>
      </div>
    `;

    this.#updateValue(this.#getVal())
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === ProgressBar.#ATT_VALUE) {
      this.#updateValue(newValue);
    }
  }

  #getVal() {
    return this.getAttribute(ProgressBar.#ATT_VALUE);
  }

  #updateValue(val) {
    if (this.innerHTML == "") {
      return;
    }
    if (val == "100") {
      this.querySelector(".progress-bar").classList.add(ProgressBar.#CLASS_COMPLETE);
    } else {
      this.querySelector(".progress-bar").classList.remove(ProgressBar.#CLASS_COMPLETE);
    }
    this.querySelector(".value").style["width"] = val + "%";
  }
}

class NahwCard extends HTMLElement {
  static #ATT_SHORTCUT = "data-shortcut";
  static #ATT_VALUE = "data-value";
  static #ATT_SELECTED = "selected";

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [NahwCard.#ATT_SHORTCUT, NahwCard.#ATT_VALUE, NahwCard.#ATT_SELECTED];
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="nahw-card _w-full _h-full">
        <p class="choice">${this.#getValue()}</p>
        <p class="shortcut">${this.#getShortcut()}</p>
      </div>
    `;
    if (this.#selected()) {
      this.querySelector(".nahw-card").classList.add("-selected");
    }
  }

  #getValue() {
    return this.getAttribute(NahwCard.#ATT_VALUE);
  }

  #getShortcut() {
    return this.getAttribute(NahwCard.#ATT_SHORTCUT);
  }

  #selected() {
    return this.getAttribute(NahwCard.#ATT_SELECTED) != null;
  }
}

customElements.define("progress-bar", ProgressBar);
customElements.define("nahw-card", NahwCard);

function vowel() {
  return document.querySelector("[selected]").getAttribute("data-value")
}
