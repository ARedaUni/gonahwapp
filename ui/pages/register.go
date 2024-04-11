package pages

import (
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
	return AuthBase(AuthBaseProps{
		PageTitle:    "NahwApp - Register",
		FormTitle:    "Register",
		SubmitButton: "Register",
		Action:       "/register",
		Inputs: []g.Node{
			Label(For("username"), g.Text("Username")),
			g.If(p.UsernameError != "",
				Span(Class("error"), g.Text(p.UsernameError)),
			),
			Input(ID("username"), Name("username"), Type("text"),
				Value(p.Username), Required()),
			Label(For("email"), g.Text("Email")),
			g.If(p.EmailError != "",
				Span(Class("error"), g.Text(p.EmailError)),
			),
			Input(ID("email"), Name("email"), Type("email"), Value(p.Email),
				Required()),
			Label(For("pass"), g.Text("Password")),
			g.If(p.PasswordError != "",
				Span(Class("error"), g.Text(p.PasswordError)),
			),
			Input(ID("pass"), Name("pass"), Type("password"), Required()),
			Label(For("conf_pass"), g.Text("Confirm password")),
			g.If(p.PasswordConfirmError != "",
				Span(Class("error"), g.Text(p.PasswordConfirmError)),
			),
			Input(ID("conf_pass"), Name("conf_pass"), Type("password"), Required()),
		},
	})
}
