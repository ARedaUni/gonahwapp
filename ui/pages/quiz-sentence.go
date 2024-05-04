package pages

import (
	"fmt"
	"slices"
	"strconv"

	"github.com/amrojjeh/kalam"
	"github.com/amrojjeh/nahwapp/arabic"
	"github.com/amrojjeh/nahwapp/model"
	"github.com/amrojjeh/nahwapp/ui/module"
	"github.com/amrojjeh/nahwapp/ui/partials"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// TODO(Amr Ojjeh): Add navigation control
type QuizSentenceProps struct {
	Title    string
	Words    []g.Node
	Cards    []g.Node
	Footer   g.Node
	Progress int
}

func QuizSentencePage(p QuizSentenceProps) g.Node {
	return QuizBase(QuizBaseProps{
		Title:    p.Title,
		Loggedin: true,
		Body: []g.Node{ID("quiz-sentence"),
			module.ProgressBar(p.Progress),
			Div(Class("quiz-sentence"),
				P(Class("quiz-sentence__text"),
					g.Group(p.Words),
				),
				Div(Class("quiz-sentence__cards"),
					g.Group(p.Cards),
				),
			),
			p.Footer,
		},
	})
}

type QuizSentenceWordProps []partials.QuizWordProps

func QuizSentenceGenWords(s model.QuizSentence) QuizSentenceWordProps {
	words := QuizSentenceWordProps{}
	for _, w := range s.Words {
		if w.Quizzable() {
			words = append(words, partials.QuizWordProps{
				Base:        arabic.Unpointed(w.Base(), true),
				Termination: w.Termination().Unpointed(true),
				Selected:    false,
				Space:       !w.Preceding,
			})
		} else {
			words = append(words, partials.QuizWordProps{
				Base:        arabic.Unpointed(w.PointedWord, true),
				Termination: "",
				Selected:    false,
				Space:       !w.Preceding,
			})
		}
	}

	return words
}

func (q QuizSentenceWordProps) Select(wordIndex int) QuizSentenceWordProps {
	q[wordIndex].Selected = true
	return q
}

func (q QuizSentenceWordProps) TerminateSelectWith(
	value string,
) QuizSentenceWordProps {
	for x := 0; x < len(q); x++ {
		p := &q[x]
		if p.Selected {
			p.Termination = value
		}
	}
	return q
}

func (q QuizSentenceWordProps) Build() []g.Node {
	return g.Map(q, partials.QuizWord)
}

type QuizSentenceCardProps []partials.QuizCardProps

func QuizSentenceGenCards(
	l arabic.LetterPack,
	selectURL func(value string) string,
) QuizSentenceCardProps {
	if selectURL == nil {
		selectURL = func(string) string { return "" }
	}

	cards := QuizSentenceCardProps{}

	singles := []rune{kalam.Damma, kalam.Fatha, kalam.Kasra}
	doubles := []rune{kalam.Dammatan, kalam.Fathatan, kalam.Kasratan}

	if slices.Contains(singles, l.Vowel) {
		for i, v := range singles {
			value := l.Unpointed(true) + string(v)
			cards = append(cards, partials.QuizCardProps{
				Value:     value,
				State:     partials.QuizCardStateDefault,
				Shortcut:  strconv.Itoa(i + 1),
				SelectURL: selectURL(arabic.ToBuckwalter(value)),
			})
		}
	} else {
		for i, v := range doubles {
			value := l.Unpointed(true) + string(v)
			cards = append(cards, partials.QuizCardProps{
				Value:     value,
				State:     partials.QuizCardStateDefault,
				Shortcut:  strconv.Itoa(i + 1),
				SelectURL: selectURL(arabic.ToBuckwalter(value)),
			})
		}
	}

	value := l.Unpointed(true) + string(kalam.Sukoon)
	cards = append(cards, partials.QuizCardProps{
		Value:     value,
		State:     partials.QuizCardStateDefault,
		Shortcut:  "4",
		SelectURL: selectURL(arabic.ToBuckwalter(value)),
	})

	return cards
}

func (q QuizSentenceCardProps) Select(value string) QuizSentenceCardProps {
	return q.SetState(value, partials.QuizCardStateSelected)
}

func (q QuizSentenceCardProps) MarkCorrect(value string) QuizSentenceCardProps {
	return q.SetState(value, partials.QuizCardStateCorrect)
}

func (q QuizSentenceCardProps) MarkIncorrect(value string) QuizSentenceCardProps {
	return q.SetState(value, partials.QuizCardStateIncorrect)
}

func (q QuizSentenceCardProps) SetState(
	value string,
	state partials.QuizCardState,
) QuizSentenceCardProps {
	for x := 0; x < len(q); x++ {
		p := &q[x]
		if p.Value == value {
			p.State = state
		}
	}
	return q
}

func (q QuizSentenceCardProps) Build() []g.Node {
	return g.Map(q, partials.QuizCard)
}

func QuizSentenceInactiveFooter() g.Node {
	return partials.QuizFooter(partials.QuizFooterProps{
		Left: Button(Class("button button--inactive"),
			g.Text("Select"),
		),
		State: partials.QuizFooterStateDefault,
	})
}

func QuizSentenceActiveFooter(selectURL string) g.Node {
	return partials.QuizFooter(partials.QuizFooterProps{
		Left: Button(Class("button button--primary"),
			g.Attr("up-href", selectURL),
			g.Attr("up-method", "post"),
			g.Attr("na-shortcut", " "),
			g.Text("Select"),
		),
		State: partials.QuizFooterStateDefault,
	})
}

func QuizSentenceIncorrectFooter(explanation, continueURL string) g.Node {
	return partials.QuizFooter(partials.QuizFooterProps{
		Left: partials.QuizFeedback(partials.QuizFeedbackProps{
			Header:      "Incorrect",
			Explanation: explanation,
			State:       partials.QuizFeedbackStateIncorrect,
		}),
		Right: Button(Class("button button--incorrect"),
			g.Attr("up-href", continueURL),
			g.Attr("na-shortcut", " "),
			g.Text("Continue"),
		),
		State: partials.QuizFooterStateIncorrect,
	})
}

func QuizSentenceCorrectFooter(explanation, continueURL string) g.Node {
	return partials.QuizFooter(partials.QuizFooterProps{
		Left: partials.QuizFeedback(partials.QuizFeedbackProps{
			Header:      "Good job!",
			Explanation: explanation,
			State:       partials.QuizFeedbackStateCorrect,
		}),
		Right: Button(Class("button button--primary"),
			g.Attr("up-href", continueURL),
			g.Attr("na-shortcut", " "),
			g.Text("Continue"),
		),
		State: partials.QuizFooterStateCorrect,
	})
}

func QuizSentenceSelectURL(eid int) func(val string) string {
	return func(val string) string {
		return fmt.Sprintf("/quiz/%v/select/%v", eid, val)
	}
}
