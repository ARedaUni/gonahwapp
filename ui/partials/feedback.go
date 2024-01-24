package partials

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
	"github.com/maragudk/gomponents/svg"
)

type QuizFeedbackProps struct {
	Header      string
	Explanation string
	State       QuizFeedbackState
}

type QuizFeedbackState int

const (
	QuizFeedbackStateCorrect = QuizFeedbackState(iota)
	QuizFeedbackStateIncorrect
)

func QuizFeedback(p QuizFeedbackProps) g.Node {
	return Div(Class("quiz-feedback"),
		Div(Class("quiz-feedback__icon"),
			g.If(p.State == QuizFeedbackStateIncorrect,
				wrongIcon(Class("quiz-feedback__inner")),
			),
			g.If(p.State == QuizFeedbackStateCorrect,
				correctIcon(Class("quiz-feedback__inner")),
			),
		),
		Div(Class("quiz-feedback__text"),
			H2(Class("quiz-feedback__header"),
				g.Text(p.Header),
			),
			P(Class("quiz-feedback__paragraph arabic"), Lang("ar"),
				g.Text(p.Explanation),
			),
		),
	)
}

func wrongIcon(nodes ...g.Node) g.Node {
	return SVG(g.Group(nodes),
		Width("32"),
		Height("31"),
		svg.ViewBox("0 0 32 31"),
		svg.Path(svg.D("M23.91 15.4384L30.24 9.10842C31.2044 8.09976 31.7356 6.75365 31.72 5.35822C31.7043 3.9628 31.143 2.62895 30.1563 1.64217C29.1695 0.655399 27.8356 0.094115 26.4402 0.0784614C25.0448 0.0628077 23.6987 0.594028 22.69 1.55842L16.36 7.88842L10 1.55842C8.99135 0.594028 7.64524 0.0628077 6.24982 0.0784614C4.85439 0.094115 3.52054 0.655399 2.53377 1.64217C1.54699 2.62895 0.985717 3.9628 0.970063 5.35822C0.954409 6.75365 1.48562 8.09976 2.45001 9.10842L8.78001 15.4384L2.45001 21.7684C1.48562 22.7771 0.954409 24.1232 0.970063 25.5186C0.985717 26.914 1.54699 28.2479 2.53377 29.2347C3.52054 30.2214 4.85439 30.7827 6.24982 30.7984C7.64524 30.814 8.99135 30.2828 10 29.3184L16.33 22.9884L22.66 29.3184C23.6687 30.2828 25.0148 30.814 26.4102 30.7984C27.8056 30.7827 29.1395 30.2214 30.1263 29.2347C31.113 28.2479 31.6743 26.914 31.69 25.5186C31.7056 24.1232 31.1744 22.7771 30.21 21.7684L23.91 15.4384Z")),
		svg.Fill("var(--red-600)"),
	)
}

func correctIcon(nodes ...g.Node) g.Node {
	return SVG(g.Group(nodes),
		Width("40"),
		Height("30"),
		svg.ViewBox("0 0 40 30"),
		svg.Fill("none"),
		svg.Path(svg.D("M35 5.5L15.2067 24.3278C14.8136 24.7017 14.194 24.694 13.8103 24.3103L5.5 16")),
		svg.Stroke("var(--green-600)"),
		svg.StrokeWidth("10"),
		g.Attr("stroke-linecap", "round"),
	)
}
