package partials

import (
	g "github.com/maragudk/gomponents"
	c "github.com/maragudk/gomponents/components"
	. "github.com/maragudk/gomponents/html"
)

type QuizWordProps struct {
	Base        string
	Termination string
	Selected    bool
	Space       bool
}

func QuizWord(p QuizWordProps) g.Node {
	return g.Group([]g.Node{
		Span(g.Text(p.Base)),
		Span(c.Classes{
			"highlight":         true,
			"highlight--active": p.Selected,
		}, g.Text(p.Termination)),
		g.If(p.Space, g.Text(" ")),
	})
}
