"use strict";

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
