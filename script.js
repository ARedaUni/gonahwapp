let activeKeyboard;
let activePrompt;

function generateQuestion(question) {
    if (question.type == "single")
        return generateSingleQuestion(question);
}

function generateSingleQuestion(question) {
    q_div = document.createElement("div");
    q_div.className = "question";

    let prompt_p = document.createElement("p");
    prompt_p.setAttribute("type", "regular");
    let prompt_node = document.createTextNode(question.question);
    prompt_p.appendChild(prompt_node);
    activePrompt = prompt_p;
    q_div.appendChild(prompt_p);

    let input_div = generateKeyboard(question);
    q_div.appendChild(input_div);
    return q_div;
}

// Should take a config soon
function generateKeyboard(question) {
    const keyboard_click = function(e) {
        if (activeKeyboard.grayed.indexOf(e.target) !== -1 ||
            activeKeyboard.wrong.indexOf(e.target) !== -1 ||
            activeKeyboard.correct.indexOf(e.target) !== -1) {
            return;
        }

        if (activeKeyboard.activeKey)
            activeKeyboard.activeKey.removeAttribute("active");
        else
            activeKeyboard.submitBtn.removeAttribute("disabled")
        activeKeyboard.activeKey = e.target;
        e.target.setAttribute("active", "");
        activePrompt.setAttribute("feedback", e.target.innerText);
    };

    const submit = function(e) {
        // Check the answer
        let correct = false;
        for (let a of activeKeyboard.question.answers) {
            if (a in harakat) {
                console.log(activeKeyboard.activeKey.innerText[0], "  ", harakat[a]);
                if (activeKeyboard.activeKey.innerText[0] === harakat[a]) {
                    correct = true;
                    break;
                }
            } else {
                if (activeKeyboard.activeKey.innerText === a) {
                    correct = true;
                    break;
                }
            }
        }
        // Make itself disabled
        activeKeyboard.submitBtn.setAttribute("disabled", "");
        // Either mark the answer wrong or right
        if (correct) {
            activeKeyboard.activeKey.setAttribute("correct", "");
            activeKeyboard.correct.push(activeKeyboard.activeKey);
            activePrompt.setAttribute("feedback", "✅");
        } else {
            activeKeyboard.activeKey.setAttribute("wrong", "");
            activeKeyboard.wrong.push(activeKeyboard.activeKey);
            activePrompt.setAttribute("feedback", "❌");
        }
        // Remove the activekey
        activeKeyboard.activeKey = null;
    };

    console.warn("Keyboard only assumes single type!!");
    const top_div = document.createElement("div");
    top_div.className = "arabic-keyboard";

    activeKeyboard = {};
    activeKeyboard.html = top_div;
    activeKeyboard.activeKey = undefined;
    activeKeyboard.grayed = [];
    activeKeyboard.correct = [];
    activeKeyboard.wrong = [];
    activeKeyboard.question = question;

    const haraka_row = document.createElement("div");
    const top_row = document.createElement("div");
    const middle_row = document.createElement("div");
    const bottom_row = document.createElement("div");
    let haraka_row_chars;
    if (question.input.layout.indexOf("without tanween") !== -1) {
        haraka_row_chars = [
        "\u064f\u25cc", "\u064e\u25cc", "\u0650\u25cc",
        "\u0652\u25cc"];
    } else {
        haraka_row_chars = [
        "\u064f\u25cc", "\u064c\u25cc", "\u064e\u25cc",
        "\u064b\u25cc", "\u0650\u25cc", "\u064d\u25cc",
        "\u0652\u25cc"];
    }
    const top_row_chars = ["ض", "ص", "ث", "ق", "ف",
        "غ", "ع", "ه", "خ", "ح", "ج", "د"];
    const middle_row_chars = ["ذ", "ش", "س", "ي", "ب",
        "ل","ا","ت","ن","م","ك","ط"];
    const bottom_row_chars = ["ئ", "ء", "ؤ", "ر", "ﻻ", "ى",
        "ة", "و", "ز", "ظ", "➡"];

    for (let btn_text of haraka_row_chars) {
        const temp_div = document.createElement("div");
        const text_node = document.createTextNode(btn_text);
        temp_div.appendChild(text_node);
        temp_div.addEventListener("click", keyboard_click);
        haraka_row.appendChild(temp_div);
    }

    for (let btn_text of top_row_chars) {
        const temp_div = document.createElement("div");
        const text_node = document.createTextNode(btn_text);
        temp_div.appendChild(text_node);
        temp_div.addEventListener("click", keyboard_click);
        top_row.appendChild(temp_div);
    }

    for (let btn_text of middle_row_chars) {
        const temp_div = document.createElement("div");
        const text_node = document.createTextNode(btn_text);
        temp_div.appendChild(text_node);
        temp_div.addEventListener("click", keyboard_click);
        middle_row.appendChild(temp_div);
    }

    for (let btn_text of bottom_row_chars) {
        const temp_div = document.createElement("div");
        const text_node = document.createTextNode(btn_text);
        temp_div.appendChild(text_node);
        if (btn_text === "➡") {
            temp_div.addEventListener("click", submit);
            temp_div.setAttribute("disabled", "");
            activeKeyboard.submitBtn = temp_div;
        }
        else
            temp_div.addEventListener("click", keyboard_click);
        bottom_row.appendChild(temp_div);
    }

    top_div.appendChild(haraka_row);
    top_div.appendChild(top_row);
    top_div.appendChild(middle_row);
    top_div.appendChild(bottom_row);
    
    return top_div;
}

function loadQuestions() {
    let questions_div = document.querySelector("#questions");
    for (let q of questions) {
        let node = generateQuestion(q);
        if (!node) console.warn(`Question of type ${q.type} is not supported.`)
        else questions_div.appendChild(node);
    }
}

loadQuestions();
console.warn("Active prompt/keyboard are not set correctly, probably!");