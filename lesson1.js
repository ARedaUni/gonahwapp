"use strict";
const title = "(1) الدَّرْسُ الأَوَّلُ";
const titleRtl = true;

const questionData = [
    // Exercise 1
    new SAQuestionState("ما هذا؟", "هَذَاْ مِفْتَاْحٌ",
     "./img/key.png", "Translate 'this is a key' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ كِتَاْبٌ",
     "./img/book.png", "Translate 'this is a book' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ قَلَمٌ",
     "./img/pen.png", "Translate 'this is a pen' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ بَاْبٌ",
     "./img/door.png", "Translate 'this is a door' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ بَيْتٌ",
     "./img/house.png", "Translate 'this is a house' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ كُرْسِيٌّ",
     "./img/chair.png", "Translate 'this is a chair' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ مَكْتَبٌ",
     "./img/table.png", "Translate 'this is a table' to Arabic",
     {lang: "ar", svowels: false}), // Not in the book but a good addition I believe
    // Exercise 2
    new SAQuestionState("ما هذا؟", "هَذَاْ مَسْجِدٌ",
     "./img/masjid.png", "Translate 'this is a masjid' to Arabic",
     {lang: "ar", svowels: false}),
    new SAQuestionState("ما هذا؟", "هَذَاْ سَرِيْرٌ",
     "./img/bed.png", "Translate 'this is a bed' to Arabic",
     {lang: "ar", svowels: false}),
    // new SVQuestionState("What are the four signs of رفع?",
    //     [`${svowel.DAMMA}`, "و", "ا", "ن"],
    //     "Select while holding ctrl to multiselect!",
    //     {
    //         letters: true, // all 29 letters
    //         single: true, // single harakat
    //         double: false, // tanween
    //     })
];
