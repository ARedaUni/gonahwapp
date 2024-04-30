-- *****
-- QUIZ TABLE
-- *****

-- name: CreateQuiz :one
INSERT INTO quiz (
    name, data, created, updated
) VALUES (
    ?, ?, datetime("now"), datetime("now")
) RETURNING *;

-- name: ListQuiz :many
SELECT * FROM quiz
ORDER BY created
LIMIT ? OFFSET ?;

-- name: GetQuiz :one
SELECT * FROM quiz
WHERE id=?;

-- name: DeleteQuiz :exec
DELETE FROM quiz
WHERE id=?;

-- *****
-- STUDENT TABLE
-- *****

-- name: CreateStudent :one
INSERT INTO student (
    email, username, password_hash, statistics, created, updated
) VALUES (
    ?, ?, ?, "{}", datetime("now"), datetime("now")
) RETURNING *;

-- name: GetStudent :one
SELECT * FROM student
WHERE id=?;

-- name: ListStudents :many
SELECT * FROM student
WHERE username LIKE ? AND email LIKE ?
LIMIT ? OFFSET ?;

-- name: DeleteStudent :exec
DELETE FROM student
WHERE id=?;

-- *****
-- QUIZ_SESSION TABLE
-- *****

-- name: CreateQuizSession :one
INSERT INTO quiz_session (
    student_id, quiz_id, data
) VALUES (
    ?, ?, "{}"
) RETURNING *;

-- name: GetQuizSession :one
SELECT * FROM quiz_session
WHERE id=?;

-- name: DeleteQuizSession :exec
DELETE FROM quiz_session
WHERE id=?;
