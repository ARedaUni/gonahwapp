package pages

import (
	"github.com/amrojjeh/arabic/ui"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

func RegisterPage() g.Node {
	return ui.HTML5(ui.HTML5Props{
		Title:       "Register",
		Language:    "en",
		HTMLClasses: "auth-page",
		Head: []g.Node{
			css("/static/styles.css"),
			css("/static/unpoly.min.css"),
			css("/static/main.js"),
		},
		Body: []g.Node{
			Class("auth-page__inner"),
			g.Attr("up-main"),
			Main(
				Class("form-box"),
				H1(Class("form-box__title"), g.Text("Register")),
				FormEl(Method("post"), Action("#"),
					Class("form-box__form"),
					Label(For("name"), g.Text("Name")),
					Input(ID("name"), Name("name"), Type("text"), Required()),
					Label(For("email"), g.Text("Email")),
					Input(ID("email"), Name("email"), Type("email"), Required()),
					Label(For("pass"), g.Text("Password")),
					Input(ID("pass"), Name("password"), Type("password"), Required()),
					Label(For("conf_pass"), g.Text("Confirm password")),
					Input(ID("conf_pass"), Name("password"), Type("password"), Required()),
					Button(Type("submit"), g.Text("Register")),
				),
			),
		},
	})
}
