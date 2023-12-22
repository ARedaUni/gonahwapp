htmx.config.selfRequestsOnly = true;
htmx.config.includeIndicatorStyles = false;

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

customElements.define("progress-bar", ProgressBar);
