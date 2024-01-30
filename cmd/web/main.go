package main

import (
	"database/sql"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/alexedwards/scs/mysqlstore"
	"github.com/alexedwards/scs/v2"
	"github.com/amrojjeh/arabic/internal/models"
	"github.com/amrojjeh/kalam"
	_ "github.com/go-sql-driver/mysql"
)

type application struct {
	logger *slog.Logger
	users  models.UsersModel
	sm     *scs.SessionManager
	// TODO(Amr Ojjeh): Replace with a model
	excerpts []kalam.Excerpt
}

func main() {
	dsn := flag.String("dsn", "web:pass@/nahwapp?parseTime=true", "Data Source Name")
	addr := flag.String("addr", ":8080", "HTTP Address")
	cert := flag.String("cert", "./tls/cert.pem", "Path to TLS certificate")
	key := flag.String("key", "./tls/key.pem", "Path to TLS private key")
	flag.Parse()

	logger := createLogger()
	db := openDB(*dsn)
	defer db.Close()
	logger.Info("connected to db")

	sessionManager := scs.New()
	sessionManager.Store = mysqlstore.New(db)

	app := application{
		logger: logger,
		sm:     sessionManager,
		users: models.UsersModel{
			Db: db,
		},
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

func openDB(dsn string) *sql.DB {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	return db
}

func createLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		AddSource: true,
	}))
}
