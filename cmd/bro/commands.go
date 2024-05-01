package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/amrojjeh/nahwapp/arabic"
	"github.com/amrojjeh/nahwapp/cmd/bro/quiz"
	"github.com/amrojjeh/nahwapp/model"
	"github.com/urfave/cli/v2"
)

var createCommand = &cli.Command{
	Name:    "create",
	Aliases: []string{"c"},
	Usage:   "create a new db according to the specified schema",
	Flags: []cli.Flag{
		&cli.PathFlag{
			Name:    "schema",
			Value:   "schema.sql",
			Usage:   "schema of db",
			Aliases: []string{"s"},
		},
	},
	Before: beforeOpenDB,
	After:  afterOpenDB,
	Action: func(ctx *cli.Context) error {
		db := getDB(ctx)
		q := getQueries(ctx)
		bytes, err := os.ReadFile(ctx.Path("schema"))
		if err != nil {
			return err
		}

		if _, err := db.ExecContext(ctx.Context, string(bytes)); err != nil {
			return err
		}

		insertQuizzes(ctx.Context, q, quiz.Files)
		return nil
	},
}

var addCommand = &cli.Command{
	Name:   "add",
	Usage:  "add an object to the db",
	Before: beforeOpenDB,
	After:  afterOpenDB,
	Subcommands: []*cli.Command{
		addStudentCommand,
	},
}

var addStudentCommand = &cli.Command{
	Name:  "student",
	Usage: "add a student to the db",
	Flags: []cli.Flag{
		&cli.StringFlag{
			Name:     "username",
			Usage:    "username of student to add",
			Required: true,
			Aliases:  []string{"u"},
		},
		&cli.StringFlag{
			Name:     "code",
			Usage:    "class code of the student",
			Required: true,
			Aliases:  []string{"c"},
		},
	},
	Action: func(ctx *cli.Context) error {
		q := getQueries(ctx)
		s, err := q.CreateStudent(ctx.Context, model.CreateStudentParams{
			Username:  ctx.String("username"),
			ClassCode: ctx.String("code"),
		})
		if err != nil {
			return errors.Join(errors.New("could not create student"),
				err)
		}
		printStudent(s)
		return nil
	},
}

var sqlVersion = &cli.Command{
	Name:   "sql-version",
	Usage:  "get sqlite version",
	Before: beforeOpenDB,
	After:  afterOpenDB,
	Action: func(ctx *cli.Context) error {
		db := getDB(ctx)
		r := db.QueryRowContext(ctx.Context, "SELECT sqlite_version()")
		var version string
		err := r.Scan(&version)
		if err != nil {
			return err
		}
		fmt.Printf("SQLite version: %s\n", version)
		return nil
	},
}

var deleteDBCommand = &cli.Command{
	Name:  "delete-db-force",
	Usage: "delete db",
	Action: func(ctx *cli.Context) error {
		db_file := ctx.Path("db")
		err := os.Remove(db_file)
		if err != nil {
			return errors.Join(errors.New("could not delete file"), err)
		}
		return nil
	},
}

var scoreCommand = &cli.Command{
	Name:   "score",
	Usage:  "calculate tag scores for student",
	Before: beforeOpenDB,
	After:  afterOpenDB,
	Flags: []cli.Flag{
		&cli.IntFlag{
			Name:     "student",
			Usage:    "student id",
			Required: true,
			Aliases:  []string{"s", "id"},
		},
	},
	Action: func(ctx *cli.Context) error {
		q := getQueries(ctx)
		id := ctx.Int("student")
		for _, state := range arabic.States {
			attempts, err := q.ListTagAttemptsByStudent(ctx.Context, model.ListTagAttemptsByStudentParams{
				StudentID: id,
				Tag:       state,
				Limit:     100,
				Offset:    0,
			})
			if err != nil {
				return errors.Join(fmt.Errorf("could not retrieve tags (id: %d, tag: %s)", id,
					arabic.ToBuckwalter(state)), err)
			}
			score := model.CalcScore(state, attempts)
			fmt.Println(score.Buckwalter())
		}
		return nil
	},
}

var listCommand = &cli.Command{
	Name:   "list",
	Usage:  "query rows from db",
	Before: beforeOpenDB,
	After:  afterOpenDB,
	Flags: []cli.Flag{
		&cli.IntFlag{
			Name:    "limit",
			Usage:   "limit the query",
			Value:   50,
			Aliases: []string{"l"},
		},
	},
	Subcommands: []*cli.Command{
		listStudentCommand,
		listQuizCommand,
	},
}

var listStudentCommand = &cli.Command{
	Name:  "student",
	Usage: "query users from db",
	Flags: []cli.Flag{
		&cli.StringFlag{
			Name:    "username",
			Usage:   "query students containing username",
			Aliases: []string{"u"},
		},
		&cli.StringFlag{
			Name:    "code",
			Usage:   "query students containing class code",
			Aliases: []string{"c"},
		},
	},
	Action: func(ctx *cli.Context) error {
		q := getQueries(ctx)
		students, err := q.ListStudents(ctx.Context, model.ListStudentsParams{
			Username:  fmt.Sprintf("%%%s%%", ctx.String("username")),
			ClassCode: fmt.Sprintf("%%%s%%", ctx.String("code")),
			Limit:     int64(ctx.Int("limit")),
			Offset:    0,
		})
		if err != nil {
			return errors.Join(errors.New("could not retrieve users"), err)
		}

		for _, student := range students {
			printStudent(student)
			fmt.Println("-------")
		}
		return nil
	},
}

var listQuizCommand = &cli.Command{
	Name:  "quiz",
	Usage: "query quizzes from db",
	Flags: []cli.Flag{
		&cli.StringFlag{
			Name:    "name",
			Usage:   "the name of the quiz",
			Aliases: []string{"n"},
		},
	},
	Action: func(ctx *cli.Context) error {
		q := getQueries(ctx)
		quizzes, err := q.ListQuiz(ctx.Context, model.ListQuizParams{
			Name:   fmt.Sprintf("%%%s%%", ctx.String("name")),
			Limit:  50,
			Offset: 0,
		})
		if err != nil {
			return errors.Join(errors.New("could not query quizzes"), err)
		}

		for _, quiz := range quizzes {
			printQuiz(quiz)
			fmt.Println("-------")
		}

		return nil
	},
}
