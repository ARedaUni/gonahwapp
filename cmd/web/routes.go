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

	// TODO(Amr Ojjeh): Write an index page
	router.Handler(http.MethodGet, "/", app.homeGet())
	router.Handler(http.MethodGet, "/register", app.registerGet())
	router.Handler(http.MethodPost, "/register", app.registerPost())
	router.Handler(http.MethodGet, "/home", app.homeGet())
	router.Handler(http.MethodGet, "/quiz/:excerpt",
		excerptRequired.Then(app.quizStartGet()))
	router.Handler(http.MethodGet, "/quiz/:excerpt/:word",
		iteratorRequired.Then(app.quizSentenceGet()))
	router.Handler(http.MethodGet, "/quiz/:excerpt/:word/select/:value",
		iteratorRequired.Then(app.quizCardSelectGet()))
	router.Handler(http.MethodPost, "/quiz/:excerpt/:word/select/:value",
		iteratorRequired.Then(app.quizCardSelectPost()))

	return base.Then(router)
}
