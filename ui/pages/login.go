package pages

import (
	"net/http"

	"github.com/amrojjeh/nahwapp/validator"
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

func NewLoginProps(r *http.Request) *LoginProps {
	props := &LoginProps{
		Username:  r.Form.Get("username"),
		ClassCode: r.Form.Get("code"),
	}
	props.validate()
	return props
}

func (p *LoginProps) validate() {
	p.validateUsername()
	p.validateClassCode()
}

func (p *LoginProps) validateClassCode() {
	p.ClassCodeError = validator.NewValidator("class code", p.ClassCode).
		Required().
		MaxLength(30).
		Validate()
}

func (p *LoginProps) validateUsername() {
	p.UsernameError = validator.NewValidator("username", p.Username).
		Required().
		MaxLength(30).
		Validate()
}

func (p *LoginProps) NoError() bool {
	return p.ClassCodeError == "" && p.UsernameError == ""
}

func LoginPage(p *LoginProps) g.Node {
	if p == nil {
		p = &LoginProps{}
	}
	return AuthBase(AuthBaseProps{
		PageTitle:    "Login",
		FormTitle:    "Login",
		SubmitButton: "Login",
		Action:       "/login",
		Loggedin:     false,
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
