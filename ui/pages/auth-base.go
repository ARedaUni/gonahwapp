package pages

import (
	"github.com/amrojjeh/nahwapp/ui"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type AuthBaseProps struct {
	PageTitle    string
	FormTitle    string
	Inputs       []g.Node
	SubmitButton string
	Action       string
	Loggedin     bool
}

func AuthBase(p AuthBaseProps) g.Node {
	return ui.HTML5(ui.HTML5Props{
		Title:       p.PageTitle,
		Language:    "en",
		HTMLClasses: "auth-page",
		Loggedin:    p.Loggedin,
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
			Class("auth-page__inner"),
			g.Attr("up-main"),
			Main(
				Class("form-box"),
				H1(Class("form-box__title"),
					g.Text(p.FormTitle)),
				FormEl(Method("post"), Action(p.Action),
					Class("form-box__form"),
					g.Group(p.Inputs),
					Button(Class("button button--primary"), Type("submit"), g.Text(p.SubmitButton)),
				),
			),
		},
	})
}
