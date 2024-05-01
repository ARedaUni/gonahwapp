package pages

import (
	"github.com/amrojjeh/nahwapp/model"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

func StatsPage(stats []model.Score) g.Node {
	return QuizBase(QuizBaseProps{
		Title: "Dashboard",
		Body: []g.Node{
			mapToList(stats),
		},
	})
}

func mapToList(stats []model.Score) g.Node {
	states := make([]g.Node, 0, len(stats))
	for _, score := range stats {
		states = append(states,
			P(g.Attr("dir", "rtl"),
				g.Text(score.String()),
			))
	}
	return g.Group(states)
}
