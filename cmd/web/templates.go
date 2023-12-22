package main

import (
	"bytes"
	"errors"
	"html/template"
	"log/slog"
	"net/http"

	"github.com/amrojjeh/arabic/internal/models"
	"github.com/amrojjeh/arabic/ui"
)

type templateData struct {
	Questions []models.Question
	Question models.Question
}

func newTemplateData() templateData {
	return templateData{}
}

func (app *application) cacheTemplate() error {
	pages, err := ui.Files.ReadDir("html/pages")
	if err != nil {
		return err
	}

	for _, page := range pages {
		if page.IsDir() {
			continue
		}
		t := template.New(page.Name())
		t, err = t.ParseFS(ui.Files, "html/base.tmpl")
		if err != nil {
			return err
		}

		t, err = t.ParseFS(ui.Files, "html/pages/"+page.Name())
		if err != nil {
			return err
		}

		app.pages[page.Name()] = t
		app.logger.Info("page cached", slog.String("page", page.Name()))
	}
	return nil
}

func (app *application) renderTemplate(w http.ResponseWriter, page string,
	code int, data templateData) {
	t, ok := app.pages[page]
	if !ok {
		app.serverError(w, errors.New("page "+page+" does not exist"))
		return
	}

	b := bytes.Buffer{}
	err := t.ExecuteTemplate(&b, "base", data)
	if err != nil {
		app.serverError(w, err)
		return
	}
	w.WriteHeader(code)
	_, _ = b.WriteTo(w)
}
