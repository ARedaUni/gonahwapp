package ui

import (
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
}

func HTML5(p HTML5Props) g.Node {
	return Doctype(
		HTML(g.If(p.Language != "", Lang(p.Language)), Class(p.HTMLClasses),
			Head(
				Meta(Charset("utf-8")),
				Meta(Name("viewport"),
					Content("width=device-width, initial-scale=1")),
				g.If(p.Description != "", Meta(Name("description"),
					Content(p.Description))),
				TitleEl(g.Text(p.Title)),
				g.Group(p.Head),
			),
			Body(g.Group(p.Body)),
		),
	)
}
