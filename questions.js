const harakat = {
    "DAMMA": "\u064f",
    "DAMMATAN": "\u064c",
    "FATHA": "\u064e",
    "FATHATAN": "\u064b",
    "KASRA": "\u0650",
    "KASRATAN": "\u064d",
    "SUKOON": "\u0652",
    "DOTTED_CIRCLE": "\u25cc",
};

const questions = [
    {
        type: "single",
        input: {
            language: "ar",
            layout: "full without tanween",
            grayed: [], // Buttons which are grayed out
        },
        answers: ["DAMMA", "و", "ا", "ن"],
        question: "What are the four signs of رفع?",
    },
    {
        type: "word_picture",
        pictures: [],
        answer: 1, // pictures[answer]
        question: "What's the meaning of فلق؟",
    }
];
