package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"

	"github.com/amrojjeh/nahwapp/model"
	"github.com/urfave/cli/v2"
	"golang.org/x/crypto/bcrypt"
)

func openDB(file string) (*sql.DB, error) {
	if file == "" {
		return nil, errors.New("db file isn't specified")
	}

	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%v?mode=rwc", file))
	if err != nil {
		return nil, errors.Join(errors.New("could not open db"), err)
	}

	if db.Ping() != nil {
		return nil, errors.Join(errors.New("could not ping db"), err)
	}

	return db, nil
}

func createStudent(ctx context.Context, q *model.Queries,
	email, username, password string) (model.Student, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return model.Student{}, err
	}
	return q.CreateStudent(ctx, model.CreateStudentParams{
		Email:        email,
		Username:     username,
		PasswordHash: string(hashed),
	})
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
	fmt.Printf("Email: %s\n", s.Email)
	fmt.Printf("Username: %s\n", s.Username)
	fmt.Printf("Password: ****\n")
	fmt.Printf("Created: %s\n", s.Created)
}

func insertQuizzes(ctx context.Context, q *model.Queries, fsys fs.FS) {
	names := loadNames(fsys)
	for _, name := range names {
		name, data := readQuiz(fsys, name)
		createQuiz(ctx, q, name, data)
	}
}

func createQuiz(ctx context.Context, q *model.Queries, name string, data json.RawMessage) model.Quiz {
	quiz, err := q.CreateQuiz(ctx, model.CreateQuizParams{
		Name: name,
		Data: data,
	})
	if err != nil {
		log.Fatal("could not create quiz\n", err)
	}
	return quiz
}

func readQuiz(fsys fs.FS, filename string) (name string, data json.RawMessage) {
	content := readFile(fsys, filename)
	return readQuizName(content), readQuizData(content)
}

func readQuizName(content []byte) string {
	name := struct {
		Name string
	}{}
	err := json.Unmarshal(content, &name)
	if err != nil {
		log.Fatal("could not unmarshal json\n", err)
	}
	return name.Name
}

func readQuizData(content []byte) json.RawMessage {
	data := model.QuizData{}
	err := json.Unmarshal(content, &data)
	if err != nil {
		log.Fatal("could not unmarshal json\n", err)
	}
	raw, err := json.Marshal(data)
	if err != nil {
		log.Fatal("could not marshal json\n", err)
	}
	return json.RawMessage(raw)
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
