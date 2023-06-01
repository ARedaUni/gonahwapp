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

const questionData = [
     new SAQuestionState("ما هذا؟", "هذا بيت",
        "img/house.png", "Translate 'this is a house' to Arabic",
        {lang: "ar", svowels: false},
        {
            letters: true,
            space: true,
            single: false,
            double: false,
        }),
    new SVQuestionState("What are the four signs of رفع?",
        [`${svowel.DAMMA}`, "و", "ا", "ن"],
        "Select while holding ctrl to multiselect!",
        {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        }),
    // {
    //     type: "svowels",
    //     prompt: "هذا بيت",
    //     answers: [svowel.FATHA, svowel.FATHA, svowel.SUKOON, svowel.FATHA, svowel.SUKOON, svowel.DAMMATAN],
    //     spoiler: true,
    // },
];
