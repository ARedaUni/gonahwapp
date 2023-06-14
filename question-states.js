"use strict";

// If you want only the harakah, then (ex): DAMMA[0]

class SVQuestionState {
    constructor(prompt, answers, hint, keyboard) {
        this.prompt = prompt;
        this.keyboard = keyboard;
        this.hint = hint;
        this.answers = answers;
        this.attempts = [];
        this.correctAnswers = [];
    }

    // [string] -> [{correct: bool, value: string}]
    try(...values) {
        let trials = values.map(
            value => {return {correct: this.verify(value), value}});
        trials
            .filter(x => x.correct && !this.correctAnswers.some(y => y === x))
            .forEach(x => this.correctAnswers.push(x.value));
        this.attempts.push(trials);
        return trials;
    }

    // string -> bool
    verify(value) {
        return this.answers.indexOf(value) !== -1;
    }

    // () -> int
    answersLeft() {
        return this.answers.length - this.correctAnswers.length;
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}
