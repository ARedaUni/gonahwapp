package partials

import (
	g "github.com/maragudk/gomponents"
	c "github.com/maragudk/gomponents/components"
	. "github.com/maragudk/gomponents/html"
)

type QuizFooterProps struct {
	Left  g.Node
	Right g.Node
	State QuizFooterState
}

type QuizFooterState int

const (
	QuizFooterStateDefault = QuizFooterState(iota)
	QuizFooterStateCorrect
	QuizFooterStateIncorrect
)

func QuizFooter(p QuizFooterProps) g.Node {
	return Footer(c.Classes{
		"quiz-footer":            true,
		"quiz-footer--correct":   p.State == QuizFooterStateCorrect,
		"quiz-footer--incorrect": p.State == QuizFooterStateIncorrect,
	},
		p.Left,
		p.Right,
	)
}
