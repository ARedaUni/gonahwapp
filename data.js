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

    getVowels: () => Object.values(svowel).map(v => v[0]).slice(0,7),
    toggleTanween: (x) => {
        const code = x.codePointAt(0);
        switch (code) {
            case svowel.DAMMATAN.codePointAt(0):
            case svowel.FATHATAN.codePointAt(0):
            case svowel.KASRATAN.codePointAt(0):
                return String.fromCodePoint(code + 3);
            default:
                return String.fromCodePoint(code - 3);
        }
    },
};

const questionData = [
     new SAQuestionState("ما هذا؟", "هَذَاْ بَيْتٌ",
        "./img/house.png", "Translate 'this is a house' to Arabic",
        {lang: "ar", svowels: true}),
    new SVQuestionState("What are the four signs of رفع?",
        [`${svowel.DAMMA}`, "و", "ا", "ن"],
        "Select while holding ctrl to multiselect!",
        {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        })
];
