package ui

import (
	"github.com/amrojjeh/nahwapp/ui/module"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type HTML5Props struct {
	Title       string
	Description string
	Language    string
	HTMLClasses string
	Head        []g.Node
	Body        []g.Node
	Loggedin    bool
}

func HTML5(p HTML5Props) g.Node {
	return Doctype(
		HTML(g.If(p.Language != "", Lang(p.Language)), Class(p.HTMLClasses),
			Head(
				Meta(Charset("utf-8")),
				Meta(Name("viewport"),
					Content("width=device-width, initial-scale=1")),
				favicon(),
				g.If(p.Description != "", Meta(Name("description"),
					Content(p.Description))),
				TitleEl(g.Text(p.Title)),
				g.Group(p.Head),
			),
			Body(
				module.NavBar(p.Loggedin),
				g.Group(p.Body),
			),
		),
	)
}

func favicon() g.Node {
	return Link(Rel("icon"), Type("image/x-icon"), Href("/static/img/favicon.ico"))
}
