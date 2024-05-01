package main

import (
	"database/sql"
	"log/slog"
	"net/http"

	"github.com/alexedwards/scs/v2"
	"github.com/amrojjeh/nahwapp/ui/pages"
	"github.com/amrojjeh/nahwapp/ui/static"

	"github.com/amrojjeh/nahwapp/model"
)

type application struct {
	logger  *slog.Logger
	sm      *scs.SessionManager
	db      *sql.DB
	queries *model.Queries
}

func (app *application) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	logRequest(app.logger, r)

	defer app.serveErrors(w, r)

	switch shiftPath(r) {
	case "static":
		http.FileServer(http.FS(static.Files)).ServeHTTP(w, r)
	case ".", "home":
		app.homePage(w, r)
	case "quiz":
		if !app.isLoggedIn(r) {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		student, deleted := app.getLoggedInStudent(r)
		if deleted {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		quiz, quizData := shiftQuiz(r, app.queries)
		qr := quizRouter{
			application: app,
			quiz:        quiz,
			quizData:    quizData,
			student:     student,
		}
		qr.ServeHTTP(w, r)
	case "login":
		app.serveLogin(w, r)
	case "signout":
		app.sm.Pop(r.Context(), sm_student_id)
		http.Redirect(w, r, "/", http.StatusSeeOther)
	default:
		http.NotFound(w, r)
	}
}

type clientError struct {
	code int
}

func (app *application) serveErrors(w http.ResponseWriter, r *http.Request) {
	if rec := recover(); rec != nil {
		switch rec.(type) {
		case clientError:
			ce := rec.(clientError)
			if ce.code == http.StatusNotFound {
				http.NotFound(w, r)
				return
			}
			http.Error(w, http.StatusText(ce.code), ce.code)
		default:
			app.logger.Error("server error", slog.Any("error", rec))
			http.Error(w, http.StatusText(http.StatusInternalServerError),
				http.StatusInternalServerError)
		}
	}
}

func (app *application) serveLogin(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if app.isLoggedIn(r) {
			http.Redirect(w, r, "/", http.StatusSeeOther)
		} else {
			app.mustRender(w, pages.LoginPage(nil))
		}
	case http.MethodPost:
		mustParseForm(r)
		props := pages.NewLoginProps(r)
		if !props.NoError() {
			app.mustRender(w, pages.LoginPage(props))
			return
		}
		student, found := app.getStudent(r, props.Username, props.ClassCode)
		if !found {
			props.Error = "Username and class code not found"
			app.mustRender(w, pages.LoginPage(props))
			return
		}
		app.logStudentIn(r, student)
		http.Redirect(w, r, "/", http.StatusSeeOther)
	default:
		panic(clientError{http.StatusMethodNotAllowed})
	}
}

type quizRouter struct {
	*application
	quiz     model.Quiz
	quizData model.QuizData
	student  model.Student
}

func (qr *quizRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch shiftPath(r) {
	case ".":
		r.Header.Set("Allow", http.MethodGet)
		r.Header.Set("Allow", http.MethodPost)
		switch r.Method {
		case http.MethodGet:
			qr.startPage(w, r)
		case http.MethodPost:
			// TODO(Amr Ojjeh): start session if one doesn't exist already
			qr.queries.CreateQuizSession(r.Context(), model.CreateQuizSessionParams{
				StudentID: 0,
				QuizID:    0,
			})
			// TODO(Amr Ojjeh): render 1/0

		default:
			panic(clientError{http.StatusMethodNotAllowed})
		}
	default:
		http.NotFound(w, r)
		return
	}
}

// func (app *application) routes() http.Handler {
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word",
// 	// 	iteratorRequired.Then(app.quizSentenceGet()))
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectGet()))
// 	// router.Handler(http.MethodPost, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectPost()))

// 	return base.Then(router)
// }
