package main

import (
	"net/http"

	"github.com/maragudk/gomponents"
)

func (app *application) mustRender(w http.ResponseWriter, node gomponents.Node) {
	err := node.Render(w)
	if err != nil {
		panic(err)
	}
}

func mustParseForm(r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		panic(clientError{http.StatusBadRequest})
	}
}

const (
	sm_student_id = "student_id"
)
