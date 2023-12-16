package main

import (
	"flag"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/amrojjeh/arabic/internal/models"
)

type application struct {
	logger    *slog.Logger
	pages     map[string]*template.Template
	questions []models.Question
}

func main() {
	addr := flag.String("addr", ":8080", "HTTP Address")
	app := application{
		logger: slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			AddSource: true,
		})),
		pages:     map[string]*template.Template{},
		questions: make([]models.Question, 0),
	}

	server := &http.Server{
		Handler:      app.routes(),
		Addr:         *addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	err := app.cacheTemplate()
	if err != nil {
		app.logger.Error("failed to cache pages",
			slog.String("error", err.Error()))
		os.Exit(1)
	}

	err = app.GetQuestions()
	if err != nil {
		app.logger.Error("failed to load questions",
			slog.String("error", err.Error()))
		os.Exit(1)
	}

	app.logger.Info("starting server", slog.String("addr", *addr))
	if err := server.ListenAndServe(); err != nil {
		app.logger.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
