package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/alexedwards/scs/sqlite3store"
	"github.com/alexedwards/scs/v2"
	"github.com/amrojjeh/nahwapp/model"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	dsn := flag.String("dsn", "default.db", "Data Source Name")
	addr := flag.String("addr", ":8080", "HTTP Address")
	cert := flag.String("cert", "./tls/cert.pem", "Path to TLS certificate")
	key := flag.String("key", "./tls/key.pem", "Path to TLS private key")
	flag.Parse()

	logger := createLogger()
	db := openDB(*dsn)
	defer db.Close()
	logger.Info("connected to db")

	sessionManager := scs.New()
	sessionManager.Store = sqlite3store.New(db)

	app := &application{
		logger:  logger,
		sm:      sessionManager,
		db:      db,
		queries: model.New(db),
	}

	server := &http.Server{
		Handler:      sessionManager.LoadAndSave(app),
		Addr:         *addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	app.logger.Info("starting server", slog.String("addr", *addr))
	if err := server.ListenAndServeTLS(*cert, *key); err != nil {
		app.logger.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func openDB(filename string) *sql.DB {
	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%v?mode=rw", filename))
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
		AddSource: false,
	}))
}
