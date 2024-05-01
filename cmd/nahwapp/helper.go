package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path"
	"strconv"
	"strings"

	"github.com/amrojjeh/nahwapp/model"
	"github.com/maragudk/gomponents"
)

// shiftPath returns the head of the url after chaning it to its tail
func shiftPath(r *http.Request) string {
	p := r.URL.Path
	p, _ = strings.CutPrefix(p, "/")
	p = path.Clean(p)
	i := strings.Index(p, "/")
	if i < 0 {
		r.URL.Path = ""
		r.URL.RawPath = ""
		return p
	}
	r.URL.Path = p[i:]
	r.URL.RawPath = r.URL.Path
	return p[:i]
}

func shiftInteger(r *http.Request) int {
	numStr := shiftPath(r)
	num, err := strconv.Atoi(numStr)
	if err != nil {
		panic(clientError{http.StatusBadRequest})
	}
	return num
}

func shiftQuiz(r *http.Request, q *model.Queries) (model.Quiz, model.QuizData) {
	id := shiftInteger(r)
	quiz, err := q.GetQuiz(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			panic(clientError{http.StatusNotFound})
		}
		panic(errors.Join(fmt.Errorf("could not shift quiz (id: %d)", id), err))
	}
	return quiz, mustGetQuizData(quiz)
}

func mustGetQuizData(q model.Quiz) model.QuizData {
	var qd model.QuizData
	err := json.Unmarshal(q.Data, &qd)
	if err != nil {
		panic(errors.Join(fmt.Errorf("could not unmarshal quiz data (id: %d)", q.ID), err))
	}
	return qd
}

func (app *application) isLoggedIn(r *http.Request) bool {
	return app.sm.Exists(r.Context(), sm_student_id)
}

func (app *application) getLoggedInStudent(r *http.Request) (student model.Student, found bool) {
	id := app.sm.GetInt(r.Context(), sm_student_id)
	student, err := app.queries.GetStudent(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.sm.Pop(r.Context(), sm_student_id)
			return model.Student{}, false
		}
		panic(err)
	}
	return student, true
}

func (app *application) logStudentIn(r *http.Request, student model.Student) {
	app.sm.Put(r.Context(), sm_student_id, student.ID)
}

func (app *application) getStudent(r *http.Request, username, code string) (student model.Student, found bool) {
	student, err := app.queries.GetStudentByUsernameAndClassCode(r.Context(),
		model.GetStudentByUsernameAndClassCodeParams{
			Username:  username,
			ClassCode: code,
		})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.Student{}, false
		}
		panic(err)
	}
	return student, true
}

func (qr *quizRouter) getActiveQuizSession(r *http.Request) (session model.QuizSession, found bool) {
	session, err := qr.queries.GetActiveQuizSession(r.Context(), model.GetActiveQuizSessionParams{
		StudentID: qr.student.ID,
		QuizID:    qr.quiz.ID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.QuizSession{}, false
		}
		panic(err)
	}
	return session, true
}

func (qr *quizRouter) createQuizSession(r *http.Request) model.QuizSession {
	session, err := qr.queries.CreateQuizSession(r.Context(), model.CreateQuizSessionParams{
		StudentID: qr.student.ID,
		QuizID:    qr.quiz.ID,
		Active:    true,
	})
	if err != nil {
		panic(err)
	}
	return session
}

func listQuiz(r *http.Request, q *model.Queries) []model.Quiz {
	quizzes, err := q.ListQuiz(r.Context(), model.ListQuizParams{
		Name:   "%%",
		Limit:  50,
		Offset: 0,
	})
	if err != nil {
		panic(errors.Join(errors.New("unable to list quizzes"), err))
	}
	return quizzes
}

func (app *application) mustRender(w http.ResponseWriter, node gomponents.Node) {
	err := node.Render(w)
	if err != nil {
		panic(err)
	}
}

func mustParseForm(r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		panic(clientError{http.StatusBadRequest})
	}
}
