package partials

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// TODO(Amr Ojjeh): Rewrite to be non-linear
func Navigation(progress int) g.Node {
	return Nav(Class("quiz-nav"),
		A(Href("/home"),
			Img(Src("/static/icons/x-circle.svg"), Alt("close")),
		),
		progressBar(progress),
	)
}

func progressBar(progress int) g.Node {
	return Div(Class("progress-bar"),
		Div(Class("progress-bar__value"), StyleAttr("width:0%"),
			Span(Class("progress-bar__glow")),
		),
	)
}
