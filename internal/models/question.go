package models

type Question struct {
	Name  string `json:"-"`
	Words []Word `json:"words"`
}

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
