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
WHERE name LIKE ?
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
    username, class_code, statistics, created, updated
) VALUES (
    ?, ?, "{}", datetime("now"), datetime("now")
) RETURNING *;

-- name: GetStudent :one
SELECT * FROM student
WHERE id=?;

-- name: GetStudentByUsernameAndClassCode :one
SELECT * FROM student
WHERE username=? AND class_code=?;

-- name: ListStudents :many
SELECT * FROM student
WHERE username LIKE ? AND class_code LIKE ?
LIMIT ? OFFSET ?;

-- name: DeleteStudent :exec
DELETE FROM student
WHERE id=?;

-- *****
-- QUIZ_SESSION TABLE
-- *****

-- name: CreateQuizSession :one
INSERT INTO quiz_session (
    student_id, quiz_id, active, questions_answered, created, updated
) VALUES (
    ?, ?, ?, 0, datetime("now"), datetime("now")
) RETURNING *;

-- name: GetQuizSession :one
SELECT * FROM quiz_session
WHERE id=?;

-- name: GetActiveQuizSession :one
SELECT * FROM quiz_session
WHERE active=true AND student_id=? AND quiz_id=?
LIMIT 1;

-- name: DeleteQuizSession :exec
DELETE FROM quiz_session
WHERE id=?;
