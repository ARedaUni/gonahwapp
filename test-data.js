"use strict";
const title = "Test";
const titleRtl = false;

const questionStates = [
    // Exercise 1
    new ShortAnswerQS("ما هذا؟", "هَذَاْ مِفْتَاْحٌ",
     "./img/key.png", "Translate 'this is a key' to Arabic",
     {lang: "ar", svowels: false}),
    new ShortVowelQS("هَذَاْ مِفْتَاْحٌ"),
    new SingleValueQS("What are the four signs of رفع?",
        [`${svowel.DAMMA}`, "و", "ا", "ن"],
        "Select while holding ctrl to multiselect!",
        {
            letters: true, // all 29 letters
            single: true, // single harakat
            double: false, // tanween
        })
];
