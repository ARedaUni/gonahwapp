package main

import (
	"flag"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/amrojjeh/kalam"
)

type application struct {
	logger   *slog.Logger
	pages    map[string]*template.Template
	excerpts []kalam.Excerpt
}

func main() {
	addr := flag.String("addr", ":8080", "HTTP Address")
	cert := flag.String("cert", "./tls/cert.pem", "Path to TLS certificate")
	key := flag.String("key", "./tls/key.pem", "Path to TLS private key")
	flag.Parse()
	app := application{
		logger: slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			AddSource: true,
		})),
		pages:    map[string]*template.Template{},
		excerpts: make([]kalam.Excerpt, 0),
	}

	server := &http.Server{
		Handler:      app.routes(),
		Addr:         *addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	err := app.GetQuestions()
	if err != nil {
		app.logger.Error("failed to load questions",
			slog.String("error", err.Error()))
		os.Exit(1)
	}

	app.logger.Info("starting server", slog.String("addr", *addr))
	if err := server.ListenAndServeTLS(*cert, *key); err != nil {
		app.logger.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
