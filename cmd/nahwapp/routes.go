package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"path"
	"strconv"
	"strings"

	"github.com/alexedwards/scs/v2"
	"github.com/amrojjeh/nahwapp/ui/pages"
	"github.com/amrojjeh/nahwapp/ui/static"
	"github.com/amrojjeh/nahwapp/validator"

	"github.com/amrojjeh/nahwapp/model"
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
	quiz, err := q.GetQuiz(r.Context(), int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			panic(clientError{http.StatusNotFound})
		}
		panic(errors.Join(fmt.Errorf("could not shift quiz (id: %d)", id), err))
	}
	return quiz, getQuizData(quiz)
}

func getQuizData(q model.Quiz) model.QuizData {
	var qd model.QuizData
	err := json.Unmarshal(q.Data, &qd)
	if err != nil {
		panic(errors.Join(fmt.Errorf("could not unmarshal quiz data (id: %d)", q.ID), err))
	}
	return qd
}

type clientError struct {
	code int
}

type application struct {
	logger  *slog.Logger
	sm      *scs.SessionManager
	db      *sql.DB
	queries *model.Queries
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

func (app *application) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	logRequest(app.logger, r)

	defer app.serveErrors(w, r)

	switch shiftPath(r) {
	case "static":
		http.FileServer(http.FS(static.Files)).ServeHTTP(w, r)
	case ".", "home":
		app.homePage(w, r)
	case "quiz":
		quiz, quizData := shiftQuiz(r, app.queries)
		qr := quizRouter{
			application: app,
			quiz:        quiz,
			quizData:    quizData,
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

func (app *application) serveLogin(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if app.sm.Exists(r.Context(), "student_id") {
			http.Redirect(w, r, "/", http.StatusSeeOther)
		} else {
			app.mustRender(w, pages.LoginPage(pages.LoginProps{}))
		}
	case http.MethodPost:
		mustParseForm(r)
		props := pages.LoginProps{
			Username:  r.Form.Get("username"),
			ClassCode: r.Form.Get("code"),
		}
		props.UsernameError = validator.NewValidator("username", props.Username).
			Required().
			MaxLength(30).
			Validate()
		props.ClassCodeError = validator.NewValidator("class code", props.ClassCode).
			Required().
			MaxLength(30).
			Validate()
		if !props.NoError() {
			app.mustRender(w, pages.LoginPage(props))
			return
		}
		s, err := app.queries.GetStudentByUsernameAndClassCode(r.Context(),
			model.GetStudentByUsernameAndClassCodeParams{
				Username:  props.Username,
				ClassCode: props.ClassCode,
			})
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				props.Error = "Username and class code not found"
				app.mustRender(w, pages.LoginPage(props))
				return
			}
			panic(err)
		}
		app.sm.Put(r.Context(), sm_student_id, s.ID)
		http.Redirect(w, r, "/", http.StatusSeeOther)
	default:
		panic(clientError{http.StatusMethodNotAllowed})
	}
}

type quizRouter struct {
	*application
	quiz     model.Quiz
	quizData model.QuizData
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
// 	router := httprouter.New()

// 	base := alice.New(app.secureHeaders, app.logRequest)
// 	excerptRequired := alice.New(app.excerptRequired)
// 	iteratorRequired := excerptRequired.Append(app.iteratorRequired)

// 	// TODO(Amr Ojjeh): Write an index page
// 	// router.Handler(http.MethodGet, "/register", app.registerGet())
// 	// router.Handler(http.MethodPost, "/register", app.registerPost())
// 	// router.Handler(http.MethodGet, "/login", app.loginGet())
// 	// router.Handler(http.MethodPost, "/login", app.loginPost())

// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word",
// 	// 	iteratorRequired.Then(app.quizSentenceGet()))
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectGet()))
// 	// router.Handler(http.MethodPost, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectPost()))

// 	return base.Then(router)
// }
