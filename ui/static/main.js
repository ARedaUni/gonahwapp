up.link.config.followSelectors.push("a[href]")
up.link.config.preloadSelectors.push("a[href]")

up.compiler(".nahw-card", function(el) {
  if (el.getAttribute("up-href") != null) {
    up.link.preload(el).then(
      () => console.log(`Preloaded card ${el.getAttribute("na-shortcut")}`),
      () => console.error(`Failed to preload card ${el.getAttribute("na-shortcut")}`),
    )
  }
})

up.compiler(".sentence-question>.text", function(el) {
  el.querySelector(".-active").scrollIntoView({
    behavior: "instant",
    block: "center",
    inline: "center",
  })
})

class ProgressBar extends HTMLElement {
  static #ATT_VALUE = "data-value"
  static #CLASS_COMPLETE = "-complete"

  constructor() {
    super()
  }

  static get observedAttributes() {
    return [ProgressBar.#ATT_VALUE]
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="progress-bar _w-full _h-full">
        <div class="value">
          <span class="glow"></span>
        </div>
      </div>
    `

    this.#updateValue(this.#getVal())
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === ProgressBar.#ATT_VALUE) {
      this.#updateValue(newValue)
    }
  }

  #getVal() {
    return this.getAttribute(ProgressBar.#ATT_VALUE)
  }

  #updateValue(val) {
    if (this.innerHTML == "") {
      return
    }
    if (val == "100") {
      this.querySelector(".progress-bar").classList.add(ProgressBar.#CLASS_COMPLETE)
    } else {
      this.querySelector(".progress-bar").classList.remove(ProgressBar.#CLASS_COMPLETE)
    }
    this.querySelector(".value").style["width"] = val + "%"
  }
}

document.addEventListener("keypress", (e) => {
  document.body.querySelectorAll("[na-shortcut]").forEach((x) => {
    if (e.key == x.getAttribute("na-shortcut")) {
      x.click()
    }
  })
})

customElements.define("progress-bar", ProgressBar)
