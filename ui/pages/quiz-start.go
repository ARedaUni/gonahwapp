package pages

import (
	"github.com/amrojjeh/nahwapp/ui/partials"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type QuizStartProps struct {
	Title     string
	Paragraph string
	StartURL  string
}

func QuizStartPage(p QuizStartProps) g.Node {
	return QuizBase(QuizBaseProps{
		Title: p.Title,
		Body: []g.Node{
			partials.Navigation(0),
			Div(Class("quiz-para"),
				g.Text(p.Paragraph),
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
		Button(Class("button button--primary"),
			g.Text("Start"),
		),
	)
}
