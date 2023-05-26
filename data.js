// If you want only the harakah, then (ex): DAMMA[0]
const svowel = {
    "DAMMA": "\u064f\u25cc",
    "DAMMATAN": "\u064c\u25cc",
    "FATHA": "\u064e\u25cc",
    "FATHATAN": "\u064b\u25cc",
    "KASRA": "\u0650\u25cc",
    "KASRATAN": "\u064d\u25cc",
    "SUKOON": "\u0652\u25cc",
};

const questionsData = [
    {
        type: "arabic-keyboard-single",
        input: {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        },
        answers: [`${svowel.DAMMA}`, "و", "ا", "ن"],
        prompt: "What are the four signs of رفع?",
        hint: "Select while holding ctrl to multiselect!"
    },
    {
        type: "arabic-keyboard-single",
        input: {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        },
        answers: [`${svowel.FATHA}`, `${svowel.KASRA}`, "ي", "ا"],
        prompt: "What are the four signs of نصب (ignore the omitted sign)?",
    },
    {
        type: "arabic-keyboard-single",
        input: {
            letters: true,
            single: false,
            double: false,
        },
        answers: ["ن"],
        prompt: "Which letter is omitted as the fifth sign of نصب?",
    },
    {
        type: "arabic-keyboard-single",
        input: {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        },
        answers: [`${svowel.KASRA}`, "ي", `${svowel.FATHA}`],
        prompt: "What are the three signs of خفض?",
    },
];
