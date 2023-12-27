// Code generated by templ - DO NOT EDIT.

// templ: version: 0.2.476
package ui

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import "context"
import "io"
import "bytes"

import "github.com/amrojjeh/kalam"

func NewSentenceQuestionViewModel(nsvm NahwSentenceViewModel) SentenceQuestionViewModel {
	m := SentenceQuestionViewModel{
		Words:   []SentenceWordViewModel{},
		Choices: make([]NahwCardViewModel, 4),
	}

	for i, w := range nsvm.Iter.Sentence().Words {
		var wm SentenceWordViewModel
		if w.Quizzable() {
			wm = SentenceWordViewModel{
				Base:        w.Base().Unpointed(true),
				Termination: w.Termination().Unpointed(true),
				Active:      i == nsvm.Iter.WordI,
			}
		} else {
			wm = SentenceWordViewModel{
				Base:        w.Unpointed(true),
				Termination: "",
				Active:      false,
			}
		}
		if !w.Preceding {
			wm.Space = " "
		}

		m.Words = append(m.Words, wm)
	}

	activeTerm := nsvm.Iter.Word().Termination()
	activeTermStr := activeTerm.Unpointed(true)
	if activeTerm.Vowel == kalam.Dammatan ||
		activeTerm.Vowel == kalam.Kasratan ||
		activeTerm.Vowel == kalam.Fathatan {
		m.Choices[0] = NewNahwCardViewModel(nsvm.SelectCardURL+"0", activeTermStr+string(kalam.Dammatan), "1")
		m.Choices[1] = NewNahwCardViewModel(nsvm.SelectCardURL+"1", activeTermStr+string(kalam.Fathatan), "2")
		m.Choices[2] = NewNahwCardViewModel(nsvm.SelectCardURL+"2", activeTermStr+string(kalam.Kasratan), "3")
	} else {
		m.Choices[0] = NewNahwCardViewModel(nsvm.SelectCardURL+"0", activeTermStr+string(kalam.Damma), "1")
		m.Choices[1] = NewNahwCardViewModel(nsvm.SelectCardURL+"1", activeTermStr+string(kalam.Fatha), "2")
		m.Choices[2] = NewNahwCardViewModel(nsvm.SelectCardURL+"2", activeTermStr+string(kalam.Kasra), "3")
	}
	m.Choices[3] = NewNahwCardViewModel(nsvm.SelectCardURL+"3", activeTermStr+string(kalam.Sukoon), "4")

	if nsvm.SelectedCard >= 0 && nsvm.SelectedCard < 4 {
		m.Choices[nsvm.SelectedCard].State = NahwCardSelected
		m.Words[nsvm.Iter.WordI].Termination = m.Choices[nsvm.SelectedCard].Value
	}
	return m
}

type SentenceQuestionViewModel struct {
	Words   []SentenceWordViewModel
	Choices []NahwCardViewModel
}

type SentenceWordViewModel struct {
	Base        string
	Termination string
	Active      bool
	Space       string
}

func SentenceQuestion(m SentenceQuestionViewModel) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, templ_7745c5c3_W io.Writer) (templ_7745c5c3_Err error) {
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templ_7745c5c3_W.(*bytes.Buffer)
		if !templ_7745c5c3_IsBuffer {
			templ_7745c5c3_Buffer = templ.GetBuffer()
			defer templ.ReleaseBuffer(templ_7745c5c3_Buffer)
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<div class=\"sentence-question\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = sentence(m).Render(ctx, templ_7745c5c3_Buffer)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<div class=\"cards\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		for _, c := range m.Choices {
			templ_7745c5c3_Err = NahwCard(c).Render(ctx, templ_7745c5c3_Buffer)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</div></div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if !templ_7745c5c3_IsBuffer {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteTo(templ_7745c5c3_W)
		}
		return templ_7745c5c3_Err
	})
}

func sentence(m SentenceQuestionViewModel) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, templ_7745c5c3_W io.Writer) (templ_7745c5c3_Err error) {
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templ_7745c5c3_W.(*bytes.Buffer)
		if !templ_7745c5c3_IsBuffer {
			templ_7745c5c3_Buffer = templ.GetBuffer()
			defer templ.ReleaseBuffer(templ_7745c5c3_Buffer)
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var2 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var2 == nil {
			templ_7745c5c3_Var2 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<p class=\"text\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		for _, w := range m.Words {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<span>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var3 string = w.Base
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var3))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</span>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var4 = []any{"nahw-highlight", templ.KV("-active", w.Active)}
			templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var4...)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("<span class=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ.CSSClasses(templ_7745c5c3_Var4).String()))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("\">")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var5 string = w.Termination
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var5))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</span><span>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var6 string = w.Space
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var6))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</span>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString("</p>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if !templ_7745c5c3_IsBuffer {
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteTo(templ_7745c5c3_W)
		}
		return templ_7745c5c3_Err
	})
}
