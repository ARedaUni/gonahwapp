package pages

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

type HomeProps struct {
	Excerpts []HomeExcerpt
	Loggedin bool
}

type HomeExcerpt struct {
	Name string
	Link string
}

func HomePage(props HomeProps) g.Node {
	// TODO(Amr Ojjeh): Change to PageBase
	return QuizBase(
		QuizBaseProps{
			Title:    "NahwApp",
			Body:     g.Map(props.Excerpts, homePageExcerpt),
			Loggedin: props.Loggedin,
		},
	)
}

func homePageExcerpt(h HomeExcerpt) g.Node {
	return A(Href(h.Link),
		H1(g.Text(h.Name)),
	)
}
