package unpoly

import g "github.com/maragudk/gomponents"

func Layer(val string) g.Node {
	return g.Attr("up-layer", val)
}

func Mode(val string) g.Node {
	return g.Attr("up-mode", val)
}
