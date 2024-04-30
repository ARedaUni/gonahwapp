package main

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/amrojjeh/kalam"
	"github.com/maragudk/gomponents"
)

func (app *application) clientError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func (app *application) serverError(w http.ResponseWriter, err error) {
	app.logger.Error("server error", slog.String("error", err.Error()))
	http.Error(w, http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError)
}

func (app *application) render(w http.ResponseWriter, node gomponents.Node) {
	err := node.Render(w)
	if err != nil {
		app.serverError(w, err)
	}
}

func excerptFromContext(ctx context.Context) kalam.Excerpt {
	return ctx.Value(excerptKey).(kalam.Excerpt)
}

func excerptIdFromContext(ctx context.Context) int {
	return ctx.Value(excerptIdKey).(int)
}

func iteratorFromContext(ctx context.Context) kalam.ExcerptIterator {
	return ctx.Value(iteratorKey).(kalam.ExcerptIterator)
}
