package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"

	"github.com/amrojjeh/nahwapp/arabic"
	"github.com/amrojjeh/nahwapp/model"
	"github.com/amrojjeh/nahwapp/quiz"
	"github.com/urfave/cli/v2"
)

func openDB(file string) (*sql.DB, error) {
	if file == "" {
		return nil, errors.New("db file isn't specified")
	}

	log.Printf("Opening database: %s", file)
	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%v?mode=rwc", file))
	if err != nil {
		log.Printf("Error opening database: %v", err)
		return nil, errors.Join(errors.New("could not open db"), err)
	}

	log.Printf("Pinging database")
	if err := db.Ping(); err != nil {
		log.Printf("Error pinging database: %v", err)
		return nil, errors.Join(errors.New("could not ping db"), err)
	}

	return db, nil
}

func beforeOpenDB(ctx *cli.Context) error {
	db, err := openDB(ctx.Path("db"))
	if err != nil {
		return err
	}
	ctx.Context = context.WithValue(ctx.Context, dbContextKey, db)
	ctx.Context = context.WithValue(ctx.Context, queriesContextKey,
		model.New(db))
	return nil
}

func afterOpenDB(ctx *cli.Context) error {
	db := getDB(ctx)
	return db.Close()
}

func printStudent(s model.Student) {
	fmt.Printf("ID: %d\n", s.ID)
	fmt.Printf("Username: %s\n", s.Username)
	fmt.Printf("Class Code: %s\n", s.ClassCode)
	fmt.Printf("Created: %s\n", s.Created)
	fmt.Printf("Updated: %s\n", s.Updated)
}

func printQuiz(q model.Quiz) {
	data := model.QuizData{}
	err := json.Unmarshal(q.Data, &data)
	if err != nil {
		log.Printf("could not unmarshal quiz data for %s\n", q.Name)
		log.Fatal(err)
	}
	fmt.Printf("ID: %d\n", q.ID)
	fmt.Printf("Name: %s\n", q.Name)
	fmt.Printf("Data: %s\n", arabic.ToBuckwalter(data.String()))
	fmt.Printf("Created: %s\n", q.Created)
	fmt.Printf("Updated: %s\n", q.Updated)
}

func insertQuizzes(ctx context.Context, q *model.Queries, fsys fs.FS) {
	names := loadNames(fsys)
	for _, name := range names {
		name, data := readQuiz(fsys, name)
		createQuiz(ctx, q, name, data)
	}
}

func createQuiz(ctx context.Context, q *model.Queries, name string, data []byte) model.Quiz {
	quiz, err := q.CreateQuiz(ctx, model.CreateQuizParams{
		Name: name,
		Data: data,
	})
	if err != nil {
		log.Fatal("could not create quiz\n", err)
	}
	return quiz
}

func readQuiz(fsys fs.FS, filename string) (name string, data []byte) {
	content := readFile(fsys, filename)
	return quiz.ReadQuizName(content), quiz.ReadQuizData(content)
}

func readFile(fsys fs.FS, name string) []byte {
	content, err := fs.ReadFile(fsys, name)
	if err != nil {
		log.Printf("could not open file %s\n", name)
		log.Fatal(err)
	}

	return content
}

func loadNames(fsys fs.FS) []string {
	names, err := fs.Glob(fsys, "*.json")
	if err != nil {
		log.Fatal("could not glob *.json\n", err)
	}
	return names
}
