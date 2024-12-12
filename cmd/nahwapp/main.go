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
	if err := server.ListenAndServe(); err != nil {
		app.logger.Error("server failed", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func openDB(filename string) *sql.DB {
	logger := createLogger()
	logger.Info("opening database", slog.String("filename", filename))
	
	// Add _journal=WAL for better concurrent access and ?mode=rwc for read-write-create
	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%v?_journal=WAL&mode=rwc", filename))
	if err != nil {
		logger.Error("failed to open database", slog.String("error", err.Error()))
		panic(err)
	}

	// Enable foreign keys
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		logger.Error("failed to enable foreign keys", slog.String("error", err.Error()))
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		logger.Error("failed to ping database", slog.String("error", err.Error()))
		panic(err)
	}

	return db
}

func createLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		AddSource: false,
		Level:     slog.LevelDebug,
	}))
}
