"use strict";

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
    { // Display feedback by pretty much using the WORDL technique
        type: "short-answer",
        input: {
            lang: "ar",
            svowels: false,
        },
        keyboard: {
            letters: true,
            space: true,
            single: false,
            double: false,
        },
        prompt: "ما هذا؟",
        image: "img/house.png",
        hint: "Translate 'this is a house' to Arabic",
        answer: "هذا بيت",
    },

    {
        type: "svowels",
        prompt: "هذا بيت",
        answers: [svowel.FATHA, svowel.FATHA, svowel.SUKOON, svowel.FATHA, svowel.SUKOON, svowel.DAMMATAN],
        spoiler: true,
    },
    {
        type: "arabic-keyboard-single",
        keyboard: {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        },
        prompt: "What are the four signs of رفع?",
        answers: [`${svowel.DAMMA}`, "و", "ا", "ن"],
        hint: "Select while holding ctrl to multiselect!"
    },
];
