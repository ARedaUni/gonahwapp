package pages

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

func css(path string) g.Node {
	return Link(Rel("stylesheet"), Type("text/css"), Href(path))
}

func icon(path string) g.Node {
	return Link(Rel("icon"), Type("image/x-icon"), Href(path))
}

func script(path string) g.Node {
	return Script(Defer(), Src(path))
}
