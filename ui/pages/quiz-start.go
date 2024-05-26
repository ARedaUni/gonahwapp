package pages

import (
	"github.com/amrojjeh/nahwapp/ui/module"
	"github.com/amrojjeh/nahwapp/ui/partials"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type QuizStartProps struct {
	Title     string
	Sentences []string
	StartURL  string
}

func QuizStartPage(p QuizStartProps) g.Node {
	return QuizBase(QuizBaseProps{
		Title:    p.Title,
		Loggedin: true,
		Body: []g.Node{ID("quiz-start"),
			module.ProgressBar(0),
			Div(Class("quiz-para"),
				g.Group(g.Map(p.Sentences, func(s string) g.Node {
					return Span(Class("quiz-sen"),
						g.Text(s),
					)
				})),
			),
			homeFooter(p),
		},
	})
}

func homeFooter(p QuizStartProps) g.Node {
	return partials.QuizFooter(partials.QuizFooterProps{
		State: partials.QuizFooterStateDefault,
		Left:  startButton(p),
	})
}

func startButton(p QuizStartProps) g.Node {
	return FormEl(Method("post"), Action(p.StartURL),
		Button(Class("button button--primary"), g.Attr("na-shortcut", " "),
			g.Text("Start"),
		),
	)
}
