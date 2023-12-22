package main

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
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
		params := httprouter.ParamsFromContext(r.Context())
		idStr := params.ByName("text")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			app.clientError(w, http.StatusBadRequest)
			return
		}
		if int(id) >= len(app.questions) {
			app.clientError(w, http.StatusBadRequest)
			return
		}
		data := newTemplateData()
		data.Question = app.questions[id]
		app.renderTemplate(w, "nahw-start.tmpl", http.StatusOK, data)
	})
}
