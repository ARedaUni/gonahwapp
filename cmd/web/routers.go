package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"

	"github.com/amrojjeh/arabic/ui"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	base := alice.New(app.secureHeaders, app.logRequest)
	excerptRequired := alice.New(app.excerptRequired)
	iteratorRequired := excerptRequired.Append(app.iteratorRequired)

	router.Handler(http.MethodGet, "/static/*filepath",
		http.FileServer(http.FS(ui.Files)))

	// TODO(Amr Ojjeh): Write a homepage
	router.Handler(http.MethodGet, "/", app.textGet())
	router.Handler(http.MethodGet, "/text", app.textGet())
	router.Handler(http.MethodGet, "/text/:excerpt",
		excerptRequired.Then(app.nahwStartGet()))
	router.Handler(http.MethodGet, "/text/:excerpt/:word",
		iteratorRequired.Then(app.nahwSentenceGet()))
	router.Handler(http.MethodGet, "/text/:excerpt/:word/:selected",
		iteratorRequired.Then(app.nahwCardSelect()))

	return base.Then(router)
}
