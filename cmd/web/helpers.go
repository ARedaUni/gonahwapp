package main

import (
	"encoding/json"
	"io/fs"
	"log/slog"
	"net/http"
	"path/filepath"

	"github.com/amrojjeh/arabic/data"
	"github.com/amrojjeh/arabic/internal/models"
)

func (app *application) clientError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func (app *application) serverError(w http.ResponseWriter, err error) {
	app.logger.Error("server error", slog.String("error", err.Error()))
	http.Error(w, http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError)
}

func (app *application) GetQuestions() error {
	names, err := fs.Glob(data.Files, "*.json")
	if err != nil {
		return err
	}

	for _, n := range names {
		q := models.Question{}
		file, err := data.Files.ReadFile(n)
		if err != nil {
			return err
		}
		err = json.Unmarshal(file, &q)
		if err != nil {
			return err
		}

		q.Name = filepath.Base(n)
		app.logger.Info("loaded question", slog.String("name", q.Name))
		app.questions = append(app.questions, q)
	}
	return nil
}
