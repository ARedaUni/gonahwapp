package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/alexedwards/scs/v2"
	"github.com/amrojjeh/kalam"
	"github.com/amrojjeh/nahwapp/arabic"
	"github.com/amrojjeh/nahwapp/quiz"
	"github.com/amrojjeh/nahwapp/score"
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
		app.sm.RenewToken(r.Context())
		http.Redirect(w, r, "/", http.StatusSeeOther)
	case "dashboard":
		if !app.isLoggedIn(r) {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		student, found := app.getLoggedInStudent(r)
		if !found {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		app.serveDashboard(w, r, student)
	case "add":
		if r.Method != http.MethodPost {
			panic(clientError{http.StatusMethodNotAllowed})
		}
		app.addExcerpt(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (app *application) addExcerpt(w http.ResponseWriter, r *http.Request) {
	mustParseForm(r)
	data := r.Form.Get("data")
	quizData := quiz.ReadQuizData([]byte(data))
	quizName := quiz.ReadQuizName([]byte(data))
	q, err := app.queries.CreateQuiz(r.Context(), model.CreateQuizParams{
		Name: quizName,
		Data: quizData,
	})
	if err != nil {
		panic(err)
	}
	http.Redirect(w, r, fmt.Sprintf("/quiz/%d", q.ID), http.StatusSeeOther)
}

func (app *application) serveDashboard(w http.ResponseWriter, r *http.Request, s model.Student) {
	scores := make([]score.Score, len(arabic.States))
	for i, state := range arabic.States {
		score, err := score.CalcScore(r.Context(), app.queries, s.ID, state)
		if err != nil {
			panic(err)
		}
		scores[i] = score
	}
	app.mustRender(w, pages.DashboardPage(scores))
}

func (app *application) homePage(w http.ResponseWriter, r *http.Request) {
	excerpts := []pages.HomeExcerpt{}
	quizzes := listQuiz(r, app.queries)

	for _, e := range quizzes {
		excerpts = append(excerpts, pages.HomeExcerpt{
			Name:       e.Name,
			Link:       fmt.Sprintf("/quiz/%v", e.ID),
			DeleteLink: fmt.Sprintf("/quiz/%v/delete", e.ID),
		})
	}

	app.mustRender(w, pages.HomePage(pages.HomeProps{
		Excerpts: excerpts,
		Loggedin: app.isLoggedIn(r),
	}))
}

type clientError struct {
	code int
}

func (app *application) serveErrors(w http.ResponseWriter, r *http.Request) {
	if rec := recover(); rec != nil {
		if ce, ok := rec.(clientError); ok {
			if ce.code == http.StatusNotFound {
				http.NotFound(w, r)
				return
			}
			http.Error(w, http.StatusText(ce.code), ce.code)
			return
		}
		app.logger.Error("server error", slog.Any("error", rec), slog.String("trace", string(debug.Stack())))
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
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
	case "select":
		session, found := qr.getActiveQuizSession(r)
		if !found {
			http.Redirect(w, r, fmt.Sprintf("/quiz/%v", qr.quiz.ID), http.StatusSeeOther)
			return
		}
		qr.serveSelect(w, r, session)
	case "delete":
		err := qr.queries.DeleteQuiz(r.Context(), qr.quiz.ID)
		if err != nil {
			panic(err)
		}
		http.Redirect(w, r, "/", http.StatusSeeOther)
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
			Words: pages.QuizSentenceGenWords(i.Sentence(), i.WordI).Build(),
			Cards: pages.QuizSentenceGenCards(i.Word().Termination(),
				pages.QuizSentenceSelectURL(qr.quiz.ID)).Build(),
			Footer:   pages.QuizSentenceInactiveFooter(),
			Progress: i.Index * 100 / qr.quizData.CountQuizzable(),
		}),
	)
}

func (qr *quizRouter) serveSelect(w http.ResponseWriter, r *http.Request, session model.QuizSession) {
	value := arabic.FromBuckwalter(shiftPath(r))
	i := model.NewQuizIterator(qr.quizData, session.QuestionsAnswered)
	switch r.Method {
	case http.MethodGet:
		qr.mustRender(w, pages.QuizSentencePage(pages.QuizSentenceProps{
			Title: fmt.Sprintf("NahwApp - %s", qr.quiz.Name),
			Words: pages.QuizSentenceGenWords(i.Sentence(), i.WordI).TerminateSelectWith(value).Build(),
			Cards: pages.QuizSentenceGenCards(i.Word().Termination(),
				pages.QuizSentenceSelectURL(qr.quiz.ID)).Select(value).Build(),
			Footer: pages.QuizSentenceActiveFooter(fmt.Sprintf("/quiz/%v/select/%v", qr.quiz.ID,
				arabic.ToBuckwalter(value))),
			Progress: i.Index * 100 / qr.quizData.CountQuizzable(),
		}))
	case http.MethodPost:
		correctTerm := i.Word().Termination()
		var correct bool
		qr.logger.Debug("progress", "index", i.Index, "total", qr.quizData.CountQuizzable())
		p := pages.QuizSentenceProps{
			Title: fmt.Sprintf("NahwApp - %s", qr.quiz.Name),
			Words: pages.QuizSentenceGenWords(i.Sentence(), i.WordI).
				TerminateSelectWith(correctTerm.String()).
				Build(),
			Progress: (i.Index + 1) * 100 / qr.quizData.CountQuizzable(),
		}
		feedback := i.Word().Feedback
		tags := strings.Join(i.Word().Tags, string(kalam.ArabicComma))
		if correct = arabic.LetterPackFromString(value).EqualTo(correctTerm); correct {
			p.Cards = pages.QuizSentenceGenCards(i.Word().Termination(), nil).
				MarkCorrect(value).
				Build()
			p.Footer = pages.QuizSentenceCorrectFooter(
				tags,
				feedback,
				fmt.Sprintf("/quiz/%v", qr.quiz.ID))
		} else {
			p.Cards = pages.QuizSentenceGenCards(i.Word().Termination(), nil).
				MarkCorrect(correctTerm.String()).
				MarkIncorrect(value).
				Build()
			p.Footer = pages.QuizSentenceIncorrectFooter(
				tags,
				feedback,
				fmt.Sprintf("/quiz/%v", qr.quiz.ID))
		}
		if len(i.Word().Tags) != 0 {
			_, err := qr.queries.CreateTagAttempt(r.Context(), model.CreateTagAttemptParams{
				StudentID: qr.student.ID,
				Tag:       i.Word().Tags[0],
				Correct:   correct,
			})
			if err != nil {
				panic(err)
			}
		}
		i.Next()
		if i.Complete {
			session.Active = false
		}
		_, err := qr.queries.UpdateQuizSession(r.Context(), model.UpdateQuizSessionParams{
			Active:            session.Active,
			QuestionsAnswered: session.QuestionsAnswered + 1,
			ID:                session.ID,
		})
		if err != nil {
			panic(err)
		}
		qr.mustRender(w, pages.QuizSentencePage(p))
	default:
		panic(clientError{http.StatusMethodNotAllowed})
	}
}
