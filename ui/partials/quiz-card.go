package partials

import (
	g "github.com/maragudk/gomponents"
	c "github.com/maragudk/gomponents/components"
	. "github.com/maragudk/gomponents/html"
)

type QuizCardProps struct {
	Value     string
	State     QuizCardState
	Shortcut  string
	SelectURL string
}

type QuizCardState int

const (
	QuizCardStateDefault = QuizCardState(iota)
	QuizCardStateSelected
	QuizCardStateCorrect
	QuizCardStateIncorrect
)

func QuizCard(p QuizCardProps) g.Node {
	return Button(c.Classes{
		"quiz-card":            true,
		"quiz-card--selected":  p.State == QuizCardStateSelected,
		"quiz-card--correct":   p.State == QuizCardStateCorrect,
		"quiz-card--incorrect": p.State == QuizCardStateIncorrect,
	},
		g.If(p.SelectURL != "", g.Attr("up-href", p.SelectURL)),
		g.Attr("na-shortcut", p.Shortcut), g.Attr("up-cache", "false"),
		P(Class("quiz-card__choice"), g.Text(p.Value)),
		P(Class("quiz-card__shortcut"), g.Text(p.Shortcut)),
	)
}
