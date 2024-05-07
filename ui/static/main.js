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
