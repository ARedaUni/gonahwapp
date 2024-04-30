package pages

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type LoginProps struct {
	Error          string
	Username       string
	UsernameError  string
	ClassCode      string
	ClassCodeError string
}

func (p LoginProps) NoError() bool {
	return p.ClassCodeError == "" && p.UsernameError == ""
}

func LoginPage(p LoginProps) g.Node {
	return AuthBase(AuthBaseProps{
		PageTitle:    "Login",
		FormTitle:    "Login",
		SubmitButton: "Login",
		Action:       "/login",
		Inputs: []g.Node{
			g.If(p.Error != "",
				Span(Class("error"), g.Text(p.Error))),
			Label(For("username"), g.Text("Username")),
			g.If(p.UsernameError != "",
				Span(Class("error"), g.Text(p.UsernameError))),
			Input(ID("username"), Name("username"), Type("text"),
				Value(p.Username)),
			Label(For("code"), g.Text("Class code")),
			g.If(p.ClassCodeError != "",
				Span(Class("error"), g.Text(p.ClassCodeError))),
			Input(ID("code"), Name("code"), Type("text"),
				Value(p.ClassCode)),
		},
	})
}
