package pages

import (
	"github.com/amrojjeh/arabic/ui"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type RegisterProps struct {
	Username             string
	UsernameError        string
	Email                string
	EmailError           string
	PasswordError        string
	PasswordConfirmError string
}

func (p RegisterProps) NoError() bool {
	return p.EmailError == "" && p.PasswordError == "" &&
		p.PasswordConfirmError == ""
}

func RegisterPage(p RegisterProps) g.Node {
	return ui.HTML5(ui.HTML5Props{
		Title:       "Register",
		Language:    "en",
		HTMLClasses: "auth-page",
		Head: []g.Node{
			css("/static/styles.css"),
			css("/static/unpoly.min.css"),
			css("/static/main.js"),
			icon("/static/img/favicon.ico"),
		},
		Body: []g.Node{
			Class("auth-page__inner"),
			g.Attr("up-main"),
			Main(
				Class("form-box"),
				H1(Class("form-box__title"),
					A(Class("form-box__icon"), Href("#"), Img(Src("/static/icons/arrow-left.svg"))), g.Text("Register")),
				FormEl(Method("post"), Action("/register"),
					Class("form-box__form"),
					Label(For("username"), g.Text("Username"),
						Span(Class("error"), g.Text(p.UsernameError)),
					),
					Input(ID("username"), Name("username"), Type("text"),
						Value(p.Username), Required()),
					Label(For("email"), g.Text("Email"),
						Span(Class("error"), g.Text(p.EmailError)),
					),
					Input(ID("email"), Name("email"), Type("email"), Value(p.Email),
						Required()),
					Label(For("pass"), g.Text("Password"),
						Span(Class("error"), g.Text(p.PasswordError)),
					),
					Input(ID("pass"), Name("pass"), Type("password"), Required()),
					Label(For("conf_pass"), g.Text("Confirm password"),
						Span(Class("error"), g.Text(p.PasswordConfirmError)),
					),
					Input(ID("conf_pass"), Name("conf_pass"), Type("password"), Required()),
					Button(Class("button button--primary"), Type("submit"), g.Text("Register")),
				),
			),
		},
	})
}
