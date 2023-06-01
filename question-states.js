"use strict";

// Display feedback by pretty much using the WORDL technique
class SAQuestionState {
    constructor(prompt, answer, image, hint, input, keyboard) {
        this.prompt = prompt;
        this.input = input;
        this.keyboard = keyboard;
        this.image = image;
        this.hint = hint;
        this.answer = answer;
        this.attempts = [];
    }
}

class SVQuestionState {
    constructor(prompt, answers, hint, keyboard) {
        this.prompt = prompt;
        this.keyboard = keyboard;
        this.hint = hint;
        this.answers = answers;
        this.attempts = [];
    }

    // [string] -> [{correct: bool, value: string}]
    try(...values) {
        let trials = values.map(
            value => {return {correct: this.verify(value), value}});
        this.attempts.push(trials);
        return trials;
    }

    // string -> bool
    verify(value) {
        return this.answers.indexOf(value) !== -1;
    }

    // () -> [{correct: bool, value: string}]
    getCorrectAttempts() {
        return this.attempts.reduce((a, b) => a.concat(b), []).filter(x => x.correct);
    }

    // string -> bool
    hasAttempted(letter) {
        return this.attempts.reduce((a, b) => a.concat(b), []).some(x => x.value === letter);
    }

    // () -> [{correct: bool, value: string}]
    getWrongAttempts() {
        return this.attempts.reduce((a, b) => a.concat(b), []).filter(x => !x.correct);
    }

    // () -> int
    answersLeft() {
        let unique = new Set(this.getCorrectAttempts());
        return this.answers.length - unique.size;
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}
