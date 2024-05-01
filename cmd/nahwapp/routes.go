package main

import (
	"database/sql"
	"fmt"
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
		student, found := app.getLoggedInStudent(r)
		if !found {
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

func (app *application) homePage(w http.ResponseWriter, r *http.Request) {
	excerpts := []pages.HomeExcerpt{}
	quizzes := listQuiz(r, app.queries)

	for _, e := range quizzes {
		excerpts = append(excerpts, pages.HomeExcerpt{
			Name: e.Name,
			Link: fmt.Sprintf("/quiz/%v", e.ID),
		})
	}

	app.mustRender(w, pages.HomePage(pages.HomeProps{
		Excerpts: excerpts,
	}))
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
			// TODO(Amr Ojjeh): Add back arrow link
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
		switch r.Method {
		case http.MethodGet:
			session, found := qr.getActiveQuizSession(r)
			if found {
				qr.logger.Debug("quiz session found", "created", session.Created.Format("Jan 2 03:04pm"))
				qr.serveQuizSentence(w, r, session)
				return
			}
			qr.startPage(w, r)
		case http.MethodPost:
			_, found := qr.getActiveQuizSession(r)
			if !found {
				qr.createQuizSession(r)
				qr.logger.Debug("quiz session created")
			}
			http.Redirect(w, r, fmt.Sprintf("/quiz/%v", qr.quiz.ID), http.StatusSeeOther)
		default:
			panic(clientError{http.StatusMethodNotAllowed})
		}
	default:
		http.NotFound(w, r)
		return
	}
}

func (qr *quizRouter) startPage(w http.ResponseWriter, r *http.Request) {
	qr.mustRender(w, pages.QuizStartPage(pages.QuizStartProps{
		Title:     fmt.Sprintf("NahwApp - %s", qr.quiz.Name),
		Paragraph: qr.quizData.Unpointed(true),
		StartURL:  fmt.Sprintf("/quiz/%v", qr.quiz.ID),
	}))
}

func (qr *quizRouter) serveQuizSentence(w http.ResponseWriter, r *http.Request, session model.QuizSession) {
	i := model.NewQuizIterator(qr.quizData, int(session.QuestionsAnswered))
	qr.mustRender(w,
		pages.QuizSentencePage(pages.QuizSentenceProps{
			Title: fmt.Sprintf("NahwApp - %s", qr.quiz.Name),
			Words: pages.QuizSentenceGenWords(i.Sentence()).
				Select(i.WordI).
				Build(),
			Cards: pages.QuizSentenceGenCards(i.Word().Termination(),
				pages.QuizSentenceSelectURL(qr.quiz.ID, i.Index)).Build(),
			Footer: pages.QuizSentenceInactiveFooter(),
		}),
	)
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