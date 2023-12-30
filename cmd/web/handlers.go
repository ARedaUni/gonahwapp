package main

import (
	"fmt"
	"net/http"

	"github.com/a-h/templ"
	"github.com/amrojjeh/arabic/ui"
	"github.com/julienschmidt/httprouter"
)

func (app *application) textGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := ui.Base(ui.Excerpts(app.excerpts)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwStartGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		e := excerptFromContext(r.Context())
		err := ui.Base(ui.NahwStart(e.Unpointed(true))).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		id := excerptIdFromContext(r.Context())
		footer := ui.InactiveFooter()
		model := ui.NewNahwSentenceViewModel(id, i, "", footer)
		err := ui.Base(ui.NahwSentence(model)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwCardSelectGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		eid := excerptIdFromContext(r.Context())
		params := httprouter.ParamsFromContext(r.Context())
		value := params.ByName("value")
		footer := ui.SelectFooter(fmt.Sprintf("/text/%v/%v/select/%v", eid, i.Index, value))
		err := ui.NahwSentence(ui.NewNahwSentenceViewModel(eid, i, value, footer)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceSelectPut() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		eid := excerptIdFromContext(r.Context())
		params := httprouter.ParamsFromContext(r.Context())
		value := params.ByName("value")
		var footer templ.Component
		if value == i.Word().Termination().String() {
			footer = templ.NopComponent
		} else {
			footer = ui.IncorrectFooter("asd")
		}
		m := ui.NewNahwSentenceViewModel(eid, i, value, footer)
		err := ui.NahwSentence(m).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
			return
		}
	})
}
