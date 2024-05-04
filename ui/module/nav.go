package module

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

func NavBar(loggedin bool) g.Node {
	return Nav(
		A(Href("/dashboard"),
			g.Text("Dashboard"),
		),
		A(Href("/"),
			g.Text("Home"),
		),
		g.If(loggedin,
			A(Href("/signout"),
				g.Text("Signout"),
			)),
		g.If(!loggedin,
			A(Href("/login"),
				g.Text("Login"),
			),
		),
	)
}
