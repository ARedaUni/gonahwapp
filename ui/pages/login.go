package pages

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type LoginProps struct {
	Email      string
	EmailError string
}

func (p LoginProps) NoError() bool {
	return true
}

func LoginPage(p LoginProps) g.Node {
	return AuthBase(AuthBaseProps{
		PageTitle:    "Login",
		FormTitle:    "Login",
		SubmitButton: "Login",
		Action:       "/login",
		Inputs: []g.Node{
			Label(For("email"), g.Text("Email")),
			g.If(p.EmailError != "",
				Span(Class("error"), g.Text(p.EmailError))),
			Input(ID("email"), Name("email"), Type("text"),
				Value(p.Email)),
		},
	})
}
