package pages

import (
	"github.com/amrojjeh/arabic/ui"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type QuizBaseProps struct {
	Title string
	Body  []g.Node
}

func QuizBase(p QuizBaseProps) g.Node {
	return ui.HTML5(ui.HTML5Props{
		Title:       p.Title,
		Language:    "en",
		HTMLClasses: "quiz-page",
		Head: []g.Node{
			Link(Rel("preconnect"), Href("https://fonts.googleapis.com")),
			Link(Rel("preconnect"), Href("https://fonts.gstastic.com"),
				g.Attr("crossorigin")),
			css("https://fonts.googleapis.com/css2?family=Amiri&family=Roboto:wght@400;700&display=swap"),
			css("/static/styles.css"),
			css("/static/unpoly.min.css"),
			icon("/static/img/favicon.ico"),
			script("/static/unpoly.min.js"),
			script("/static/main.js"),
		},
		Body: []g.Node{
			Class("quiz-page__inner"),
			g.Attr("up-main"),
			g.Group(p.Body),
		},
	})
}
