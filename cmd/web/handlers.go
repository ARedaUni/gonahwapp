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
		model := ui.NewNahwSentenceViewModel(id, i, "", ui.FooterViewModel{})
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
		m := ui.NewNahwSentenceViewModel(eid, i, value, footerM).
			SetSelectedTermination(value)
		err := ui.Base(ui.NahwSentence(m)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
		}
	})
}

func (app *application) nahwSentenceSelectPost() http.Handler {
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
		correctTerm := i.Word().Termination()
		m := ui.NewNahwSentenceViewModel(eid, i, value, footerM).
			DeactivateCards().
			SetValueToCardState(correctTerm.String(), ui.NahwCardCorrect).
			SetSelectedTermination(correctTerm.String())
		if kalam.LetterPackFromString(value).EqualTo(correctTerm) {
			m = m.SetFooterState(ui.CorrectFooterState)
		} else {
			m = m.SetFooterState(ui.IncorrectFooterState).
				SwapCardState(ui.NahwCardSelected, ui.NahwCardIncorrect)
		}
		err := ui.Base(ui.NahwSentence(m)).Render(r.Context(), w)
		if err != nil {
			app.serverError(w, err)
			return
		}
	})
}
