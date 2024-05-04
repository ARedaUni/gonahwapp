package pages

import (
	"github.com/amrojjeh/nahwapp/score"
	"github.com/amrojjeh/nahwapp/ui/module"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

func DashboardPage(stats []score.Score) g.Node {
	return QuizBase(QuizBaseProps{
		Title:    "Dashboard",
		Loggedin: true,
		Body: []g.Node{ID("dashboard-page"),
			H1(
				g.Text("Dashboard"),
			),
			Main(Class("tag-stats"),
				mapToList(stats),
			),
		},
	})
}

func mapToList(stats []score.Score) g.Node {
	states := make([]g.Node, 0, len(stats))
	for _, score := range stats {
		if !score.Determinable {
			continue
		}
		states = append(states,
			P(Class("tag-stats__tag"),
				g.Text(score.Tag),
			),
			Div(Class("tag-stats__score"),
				module.ProgressBar(score.Score),
			),
		)
	}
	return g.Group(states)
}
