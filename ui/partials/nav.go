package partials

import (
	"github.com/amrojjeh/nahwapp/ui/module"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// TODO(Amr Ojjeh): Rewrite to be non-linear
func Navigation(progress int) g.Node {
	return Nav(Class("quiz-nav"),
		A(Href("/home"),
			Img(Src("/static/icons/x-circle.svg"), Alt("close")),
		),
		module.ProgressBar(progress),
	)
}
