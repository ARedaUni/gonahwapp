package main

import (
	"net/http"

	"github.com/amrojjeh/arabic/ui"
)

func (app *application) textGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := ui.Excerpts(app.excerpts).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwStartGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		e := excerptFromContext(r.Context())
		err := ui.NahwStart(e).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		err := ui.NahwSentence(i).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}
