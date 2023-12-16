package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"

	"github.com/amrojjeh/arabic/ui"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	base := alice.New(app.logRequest)

	router.Handler(http.MethodGet, "/static/*filepath",
		base.Then(http.FileServer(http.FS(ui.Files))))

	// TODO(Amr Ojjeh): Write a homepage
	router.Handler(http.MethodGet, "/", base.Then(app.textGet()))
	router.Handler(http.MethodGet, "/text", base.Then(app.textGet()))
	router.Handler(http.MethodGet, "/text/:text",
		base.Then(app.nahwQuestionGet()))
	return router
}
