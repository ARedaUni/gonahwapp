package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/a-h/templ"
	"github.com/amrojjeh/arabic/ui"
	"github.com/amrojjeh/kalam"
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
		eid := excerptIdFromContext(r.Context())
		err := ui.Base(ui.NahwStart(e.Unpointed(true),
			templ.URL(fmt.Sprintf("/text/%v/0", eid)))).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceGet() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		i := iteratorFromContext(r.Context())
		id := excerptIdFromContext(r.Context())
		footer := ui.Footer(ui.FooterViewModel{})
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
		footerM := ui.FooterViewModel{
			SelectURL: templ.URL(fmt.Sprintf("/text/%v/%v/select/%v", eid, i.Index, value)),
			State:     ui.SelectFooterState,
		}
		footer := ui.Footer(footerM)
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
		nextI, _ := i.Next()
		footerM := ui.FooterViewModel{
			Feedback:    strings.Join(i.Word().Tags, string(kalam.ArabicComma)+" "),
			ContinueURL: templ.URL(fmt.Sprintf("/text/%v/%v", eid, nextI.Index)),
		}
		if kalam.LetterPackFromString(value).EqualTo(i.Word().Termination()) {
			footerM.State = ui.CorrectFooterState
		} else {
			footerM.State = ui.IncorrectFooterState
		}
		m := ui.NewNahwSentenceViewModel(eid, i, value, ui.Footer(footerM))
		m = m.DeactivateCards()
		err := ui.NahwSentence(m).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
			return
		}
	})
}
