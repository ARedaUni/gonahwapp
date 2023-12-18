package main

import (
	"net/http"
)

func (app *application) textGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data := newTemplateData()
		data.Questions = app.questions
		app.renderTemplate(w, "text.tmpl", http.StatusOK, data)
	})
}

func (app *application) nahwQuestionGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		app.renderTemplate(w, "nahw.tmpl", http.StatusOK, newTemplateData())
	})
}
