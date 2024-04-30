// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: query.sql

package model

import (
	"context"
	"encoding/json"
)

const createQuiz = `-- name: CreateQuiz :one

INSERT INTO quiz (
    name, data, created, updated
) VALUES (
    ?, ?, datetime("now"), datetime("now")
) RETURNING id, name, data, created, updated
`

type CreateQuizParams struct {
	Name string
	Data json.RawMessage
}

// *****
// QUIZ TABLE
// *****
func (q *Queries) CreateQuiz(ctx context.Context, arg CreateQuizParams) (Quiz, error) {
	row := q.db.QueryRowContext(ctx, createQuiz, arg.Name, arg.Data)
	var i Quiz
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Data,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const createQuizSession = `-- name: CreateQuizSession :one

INSERT INTO quiz_session (
    student_id, quiz_id, data
) VALUES (
    ?, ?, "{}"
) RETURNING id, student_id, quiz_id, data, created, updated
`

type CreateQuizSessionParams struct {
	StudentID int64
	QuizID    int64
}

// *****
// QUIZ_SESSION TABLE
// *****
func (q *Queries) CreateQuizSession(ctx context.Context, arg CreateQuizSessionParams) (QuizSession, error) {
	row := q.db.QueryRowContext(ctx, createQuizSession, arg.StudentID, arg.QuizID)
	var i QuizSession
	err := row.Scan(
		&i.ID,
		&i.StudentID,
		&i.QuizID,
		&i.Data,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const createStudent = `-- name: CreateStudent :one

INSERT INTO student (
    email, username, password_hash, statistics, created, updated
) VALUES (
    ?, ?, ?, "{}", datetime("now"), datetime("now")
) RETURNING id, email, username, password_hash, statistics, created, updated
`

type CreateStudentParams struct {
	Email        string
	Username     string
	PasswordHash string
}

// *****
// STUDENT TABLE
// *****
func (q *Queries) CreateStudent(ctx context.Context, arg CreateStudentParams) (Student, error) {
	row := q.db.QueryRowContext(ctx, createStudent, arg.Email, arg.Username, arg.PasswordHash)
	var i Student
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Username,
		&i.PasswordHash,
		&i.Statistics,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const deleteQuiz = `-- name: DeleteQuiz :exec
DELETE FROM quiz
WHERE id=?
`

func (q *Queries) DeleteQuiz(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteQuiz, id)
	return err
}

const deleteQuizSession = `-- name: DeleteQuizSession :exec
DELETE FROM quiz_session
WHERE id=?
`

func (q *Queries) DeleteQuizSession(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteQuizSession, id)
	return err
}

const deleteStudent = `-- name: DeleteStudent :exec
DELETE FROM student
WHERE id=?
`

func (q *Queries) DeleteStudent(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteStudent, id)
	return err
}

const getQuiz = `-- name: GetQuiz :one
SELECT id, name, data, created, updated FROM quiz
WHERE id=?
`

func (q *Queries) GetQuiz(ctx context.Context, id int64) (Quiz, error) {
	row := q.db.QueryRowContext(ctx, getQuiz, id)
	var i Quiz
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Data,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const getQuizSession = `-- name: GetQuizSession :one
SELECT id, student_id, quiz_id, data, created, updated FROM quiz_session
WHERE id=?
`

func (q *Queries) GetQuizSession(ctx context.Context, id int64) (QuizSession, error) {
	row := q.db.QueryRowContext(ctx, getQuizSession, id)
	var i QuizSession
	err := row.Scan(
		&i.ID,
		&i.StudentID,
		&i.QuizID,
		&i.Data,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const getStudent = `-- name: GetStudent :one
SELECT id, email, username, password_hash, statistics, created, updated FROM student
WHERE id=?
`

func (q *Queries) GetStudent(ctx context.Context, id int64) (Student, error) {
	row := q.db.QueryRowContext(ctx, getStudent, id)
	var i Student
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Username,
		&i.PasswordHash,
		&i.Statistics,
		&i.Created,
		&i.Updated,
	)
	return i, err
}

const listQuiz = `-- name: ListQuiz :many
SELECT id, name, data, created, updated FROM quiz
ORDER BY created
LIMIT ? OFFSET ?
`

type ListQuizParams struct {
	Limit  int64
	Offset int64
}

func (q *Queries) ListQuiz(ctx context.Context, arg ListQuizParams) ([]Quiz, error) {
	rows, err := q.db.QueryContext(ctx, listQuiz, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Quiz
	for rows.Next() {
		var i Quiz
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Data,
			&i.Created,
			&i.Updated,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listStudents = `-- name: ListStudents :many
SELECT id, email, username, password_hash, statistics, created, updated FROM student
WHERE username LIKE ? AND email LIKE ?
LIMIT ? OFFSET ?
`

type ListStudentsParams struct {
	Username string
	Email    string
	Limit    int64
	Offset   int64
}

func (q *Queries) ListStudents(ctx context.Context, arg ListStudentsParams) ([]Student, error) {
	rows, err := q.db.QueryContext(ctx, listStudents,
		arg.Username,
		arg.Email,
		arg.Limit,
		arg.Offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Student
	for rows.Next() {
		var i Student
		if err := rows.Scan(
			&i.ID,
			&i.Email,
			&i.Username,
			&i.PasswordHash,
			&i.Statistics,
			&i.Created,
			&i.Updated,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
