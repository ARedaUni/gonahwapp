package main

import (
	"fmt"
	"net/http"
	"strconv"

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
		err := ui.Base(ui.NahwStart(e)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		model := ui.NahwSentenceViewModel{
			Iter:         i,
			SelectedCard: -1,
			SelectCardURL: fmt.Sprintf("/text/%v/%v/",
				r.Context().Value(excerptIdKey).(int), i.Index),
		}
		err := ui.Base(ui.NahwSentence(model)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwCardSelect() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		err := r.ParseForm()
		if err != nil {
			app.clientError(w, http.StatusBadRequest)
			return
		}
		params := httprouter.ParamsFromContext(r.Context())
		sstr := params.ByName("selected")
		s, err := strconv.ParseInt(sstr, 10, 64)
		if err != nil {
			app.clientError(w, http.StatusBadRequest)
			return
		}
		model := ui.NahwSentenceViewModel{
			Iter:         i,
			SelectedCard: int(s),
			SelectCardURL: fmt.Sprintf("/text/%v/%v/",
				r.Context().Value(excerptIdKey).(int), i.Index),
		}
		err = ui.NahwSentence(model).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}
