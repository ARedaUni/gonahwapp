// Disable until we get reactive elements in
up.fragment.config.navigateOptions.cache = false

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

document.addEventListener("keypress", (e) => {
  document.body.querySelectorAll("[na-shortcut]").forEach((x) => {
    if (e.key == x.getAttribute("na-shortcut")) {
      x.click()
    }
  })
})
