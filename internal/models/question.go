package models

import "fmt"
import "github.com/amrojjeh/kalam"

type Question struct {
	Name  string `json:"-"`
	Words []Word `json:"words"`
}

// TODO(Amr Ojjeh): Turn Letters into GetLetters rather than storing it
type Word struct {
	Letters       []Letter `json:"letters"`
	Preceding     bool     `json:"preceding"`
	Tags          []string `json:"tags"`
	Punctuation   bool     `json:"punctuation"`
	SentenceStart bool     `json:"sentenceStart"`
}

type Letter struct {
	Letter string `json:"letter"`
	Vowel  string `json:"tashkeel"`
	Shadda bool   `json:"shadda"`
}

func (q Question) String() string {
	para := ""
	for _, w := range q.Words {
		para += w.String()
		if !w.Preceding {
			para += " "
		}
	}
	return para
}

func (q Question) Unpointed() string {
	para := ""
	for _, w := range q.Words {
		para += w.Unpointed()
		if !w.Preceding {
			para += " "
		}
	}
	return para
}

func (w Word) String() string {
	word := ""
	for _, l := range w.Letters {
		word += l.String()
	}
	return word
}

func (w Word) Unpointed() string {
	word := ""

	for _, l := range w.Letters {
		word += l.Letter
	}
	return word
}

func (l Letter) String() string {
	if l.Shadda {
		return fmt.Sprintf("%v%v%v", l.Letter, l.Vowel, kalam.Shadda)
	}
	return fmt.Sprintf("%v%v", l.Letter, l.Vowel)
}
