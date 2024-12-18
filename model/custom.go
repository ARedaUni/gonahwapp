package model

import (
	"strings"

	"github.com/amrojjeh/nahwapp/arabic"
)

type QuizData struct {
	Sentences []QuizSentence
}

type QuizSentence struct {
	Words []QuizWord
}

type QuizWord struct {
	PointedWord string
	Tags        []string
	Feedback    string
	Punctuation bool
	Ignore      bool
	Preceding   bool
}

func (q QuizData) Unpointed(showShadda bool) string {
	return arabic.Unpointed(q.String(), showShadda)
}

func (q QuizData) CountQuizzable() int {
	sum := 0
	for _, s := range q.Sentences {
		for _, w := range s.Words {
			if w.Quizzable() {
				sum += 1
			}
		}
	}
	return sum
}

// Base returns a new word which does not have the last letter of w
func (w QuizWord) Base() string {
	res := ""
	letters := arabic.LetterPacks(w.PointedWord)
	for _, l := range letters[0 : len(letters)-1] {
		res += l.String()
	}
	return res
}

// Termination returns the last letter of w
func (w QuizWord) Termination() arabic.LetterPack {
	letters := arabic.LetterPacks(w.PointedWord)
	return letters[len(letters)-1]
}

func (w QuizWord) Quizzable() bool {
	return !w.Ignore && !w.Punctuation
}

func (q QuizData) String() string {
	builder := strings.Builder{}
	for _, s := range q.Sentences {
		builder.WriteString(s.String())
	}
	return builder.String()
}

func (s QuizSentence) String() string {
	builder := strings.Builder{}
	for _, w := range s.Words {
		builder.WriteString(w.PointedWord)
		if !w.Preceding {
			builder.WriteRune(' ')
		}
	}
	return builder.String()
}

type QuizIterator struct {
	Data      QuizData
	Complete  bool
	Index     int
	WordI     int
	SentenceI int
}

func NewQuizIterator(data QuizData, questions_completed int) *QuizIterator {
	i := QuizIterator{
		Data: data,
	}
	if !i.Word().Quizzable() {
		i.nextWord()
		i.Index = 0
	}
	for questions_completed > 0 {
		i.nextWord()
		questions_completed -= 1
	}
	return &i
}

func (i *QuizIterator) Word() QuizWord {
	return i.Sentence().Words[i.WordI]
}

func (i *QuizIterator) Sentence() QuizSentence {
	return i.Data.Sentences[i.SentenceI]
}

func (i *QuizIterator) Next() (ok bool) {
	return i.nextWord()
}

func (i *QuizIterator) nextSentence() bool {
	if i.SentenceI == len(i.Data.Sentences)-1 {
		i.Complete = true
		return false
	}
	i.SentenceI += 1
	i.WordI = 0
	if !i.Word().Quizzable() {
		i.nextWord()
	} else {
		i.Index += 1
	}
	return true
}

func (i *QuizIterator) nextWord() bool {
	if i.WordI == len(i.Sentence().Words)-1 {
		return i.nextSentence()
	}
	i.WordI += 1
	for !i.Word().Quizzable() {
		return i.nextWord()
	}
	i.Index += 1
	return true
}
