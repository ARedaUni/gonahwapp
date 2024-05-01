package main

// func (app *application) registerGet() http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		err := pages.RegisterPage(pages.RegisterProps{}).Render(w)
// 		if err != nil {
// 			app.serverError(w, err)
// 		}
// 	})
// }

// func (app *application) registerPost() http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		err := r.ParseForm()
// 		if err != nil {
// 			app.serverError(w, err)
// 			return
// 		}

// 		props := pages.RegisterProps{}
// 		props.Username = r.Form.Get("username")
// 		props.UsernameError = validator.NewValidator("username", props.Username).
// 			Required().
// 			MaxLength(50).
// 			Validate()
// 		props.Email = r.Form.Get("email")
// 		props.EmailError = validator.NewValidator("email", props.Email).
// 			Required().
// 			MaxLength(255).
// 			IsEmail().
// 			Validate()
// 		password := r.Form.Get("pass")
// 		conf_pass := r.Form.Get("conf_pass")
// 		props.PasswordError = validator.NewValidator("password", password).
// 			Required().
// 			MaxBytes(72).
// 			CustomMessage("Your password is too long").
// 			SameAs(conf_pass).
// 			Validate()
// 		props.PasswordConfirmError = validator.NewValidator("confirm password", conf_pass).
// 			Required().
// 			CustomMessage("Please confirm your password").
// 			Validate()

// 		if !props.NoError() {
// 			w.WriteHeader(http.StatusUnprocessableEntity)
// 			err := pages.RegisterPage(props).Render(w)
// 			if err != nil {
// 				app.serverError(w, err)
// 			}
// 			return
// 		}

// 		// TODO(Amr Ojjeh): Handle registration
// 		http.Redirect(w, r, "/login", http.StatusSeeOther)
// 	})
// }

// func (app *application) quizCardSelectGet() http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		i := iteratorFromContext(r.Context())
// 		e := excerptFromContext(r.Context())
// 		eid := excerptIdFromContext(r.Context())
// 		params := httprouter.ParamsFromContext(r.Context())
// 		value := params.ByName("value")
// 		err := pages.QuizSentencePage(pages.QuizSentenceProps{
// 			Title: fmt.Sprintf("NahwApp - %s", e.Name),
// 			Words: pages.QuizSentenceGenWords(i.Sentence()).
// 				Select(i.WordI).
// 				TerminateSelectWith(value).
// 				Build(),
// 			Cards: pages.QuizSentenceGenCards(i.Word().Termination(),
// 				pages.QuizSentenceSelectURL(eid, i.Index)).
// 				Select(value).
// 				Build(),
// 			// The repitition of the URL is fine since it's semantically different
// 			// One is GET and this one is POST (comparing to ui/pages/quiz-sentence.go)
// 			Footer: pages.QuizSentenceActiveFooter(
// 				fmt.Sprintf("/quiz/%v/%v/select/%v", eid, i.Index, value)),
// 		}).Render(w)
// 		if err != nil {
// 			app.serverError(w, err)
// 		}
// 	})
// }

// func (app *application) quizCardSelectPost() http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		i := iteratorFromContext(r.Context())
// 		e := excerptFromContext(r.Context())
// 		eid := excerptIdFromContext(r.Context())
// 		params := httprouter.ParamsFromContext(r.Context())
// 		value := params.ByName("value")
// 		nextI, _ := i.Next()
// 		correctTerm := i.Word().Termination()
// 		p := pages.QuizSentenceProps{
// 			Title: fmt.Sprintf("NahwApp - %s", e.Name),
// 			Words: pages.QuizSentenceGenWords(i.Sentence()).
// 				Select(i.WordI).
// 				Build(),
// 		}
// 		if kalam.LetterPackFromString(value).EqualTo(correctTerm) {
// 			p.Cards = pages.QuizSentenceGenCards(i.Word().Termination(), nil).
// 				MarkCorrect(value).
// 				Build()
// 			p.Footer = pages.QuizSentenceCorrectFooter(
// 				strings.Join(i.Word().Tags, string(kalam.ArabicComma)),
// 				fmt.Sprintf("/quiz/%v/%v", eid, nextI.Index))
// 		} else {
// 			p.Cards = pages.QuizSentenceGenCards(i.Word().Termination(), nil).
// 				MarkCorrect(correctTerm.String()).
// 				MarkIncorrect(value).
// 				Build()
// 			p.Footer = pages.QuizSentenceIncorrectFooter(
// 				strings.Join(i.Word().Tags, string(kalam.ArabicComma)),
// 				fmt.Sprintf("/quiz/%v/%v", eid, nextI.Index))
// 		}
// 		err := pages.QuizSentencePage(p).Render(w)
// 		if err != nil {
// 			app.serverError(w, err)
// 		}
// 	})
// }
