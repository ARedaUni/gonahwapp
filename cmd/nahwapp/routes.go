package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"path"
	"strings"

	"github.com/alexedwards/scs/v2"

	"github.com/amrojjeh/nahwapp/model"
	"github.com/amrojjeh/nahwapp/ui"
)

func shiftPath(p string) (head, tail string) {
	p, _ = strings.CutPrefix(p, "/")
	p = path.Clean(p)
	i := strings.Index(p, "/")
	if i < 0 {
		return p, "/"
	}
	return p[:i], p[i:]
}

type application struct {
	logger  *slog.Logger
	sm      *scs.SessionManager
	db      *sql.DB
	queries *model.Queries
}

func (app *application) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	app.logRequest(r)
	head, tail := shiftPath(r.URL.Path)
	r.URL.Path = tail
	r.URL.RawPath = tail

	switch head {
	case "static":
		http.FileServer(http.FS(ui.Files)).ServeHTTP(w, r)
	case ".", "home":
		app.home(w, r)
	}
}

// func (app *application) routes() http.Handler {
// 	router := httprouter.New()

// 	base := alice.New(app.secureHeaders, app.logRequest)
// 	excerptRequired := alice.New(app.excerptRequired)
// 	iteratorRequired := excerptRequired.Append(app.iteratorRequired)

// 	// TODO(Amr Ojjeh): Write an index page
// 	router.Handler(http.MethodGet, "/", app.homeGet())
// 	// router.Handler(http.MethodGet, "/register", app.registerGet())
// 	// router.Handler(http.MethodPost, "/register", app.registerPost())
// 	// router.Handler(http.MethodGet, "/login", app.loginGet())
// 	// router.Handler(http.MethodPost, "/login", app.loginPost())
// 	router.Handler(http.MethodGet, "/home", app.homeGet())
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt",
// 	// 	excerptRequired.Then(app.quizStartGet()))
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word",
// 	// 	iteratorRequired.Then(app.quizSentenceGet()))
// 	// router.Handler(http.MethodGet, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectGet()))
// 	// router.Handler(http.MethodPost, "/quiz/:excerpt/:word/select/:value",
// 	// 	iteratorRequired.Then(app.quizCardSelectPost()))

// 	return base.Then(router)
// }
