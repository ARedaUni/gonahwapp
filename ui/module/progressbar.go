package module

import (
	"fmt"

	g "github.com/maragudk/gomponents"
	c "github.com/maragudk/gomponents/components"
	. "github.com/maragudk/gomponents/html"
)

func ProgressBar(progress int) g.Node {
	return Div(c.Classes{"progress-bar": true, "progress-bar--complete": progress == 100},
		Div(Class("progress-bar__value"), widthStyle(progress),
			Span(Class("progress-bar__glow")),
		),
	)
}

func widthStyle(width int) g.Node {
	return StyleAttr(fmt.Sprintf("width:%d%%", width))
}
