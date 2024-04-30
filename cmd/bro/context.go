package main

import (
	"database/sql"

	"github.com/amrojjeh/nahwapp/model"
	"github.com/urfave/cli/v2"
)

type contextKey string

var dbContextKey = contextKey("db")
var queriesContextKey = contextKey("queries")

func getDB(ctx *cli.Context) *sql.DB {
	return ctx.Context.Value(dbContextKey).(*sql.DB)
}

func getQueries(ctx *cli.Context) *model.Queries {
	return ctx.Context.Value(queriesContextKey).(*model.Queries)
}
