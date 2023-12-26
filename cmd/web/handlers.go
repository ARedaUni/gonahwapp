package main

import (
	"net/http"
)

func (app *application) textGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data := newTemplateData()
		data.Questions = app.excerpts
		app.renderTemplate(w, "text.tmpl", http.StatusOK, data)
	})
}

func (app *application) nahwStartGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data := newTemplateData()
		data.Question = excerptFromContext(r.Context())
		app.renderTemplate(w, "nahw-start.tmpl", http.StatusOK, data)
	})
}

func (app *application) nahwSentenceGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data := newTemplateData()
		data.Question = excerptFromContext(r.Context())
		data.Sentence = sentenceFromContext(r.Context())
		app.renderTemplate(w, "nahw-sentence.tmpl", http.StatusOK, data)
	})
}
