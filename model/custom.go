package model

import "strings"

type QuizData struct {
	Sentences []QuizSentence
}

type QuizSentence struct {
	Words []QuizWord
}

type QuizWord struct {
	PointedWord string
	Tags        []string
	Punctuation bool
	Ignore      bool
	Preceding   bool
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
