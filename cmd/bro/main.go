package main

import (
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/urfave/cli/v2"
)

func main() {
	app := newApp()
	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func newApp() *cli.App {
	return &cli.App{
		Name:  "bro",
		Usage: "manage an sqlite db for nahwapp",

		Flags: []cli.Flag{
			&cli.PathFlag{
				Name:  "db",
				Value: "default.db",
				Usage: "the sqlite db",
			},
		},

		Commands: []*cli.Command{
			createCommand,
			addCommand,
			deleteDBCommand,
			listCommand,
			sqlVersion,
			scoreCommand,
		},
	}
}
