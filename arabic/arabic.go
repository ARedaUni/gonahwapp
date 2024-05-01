package arabic

import "fmt"

func Unpointed(pointedWord string, showShadda bool) string {
	res := ""
	for _, l := range pointedWord {
		c := string(l)
		if !IsShortVowel(l) {
			if (showShadda && l == Shadda) || l != Shadda {
				res += c
			}
		}
	}
	return res
}

// IsShortVowel checks if the character is a fatha, kasra, damma, or sukoon, with
// their tanween variations. It returns false for shadda and long vowels like
// the alef.
func IsShortVowel(letter rune) bool {
	return vowels[letter]
}

type LetterPack struct {
	Letter          rune
	Vowel           rune
	Shadda          bool
	SuperscriptAlef bool
}

func (l LetterPack) String() string {
	shadda := ""
	superscript := ""
	vowel := string(l.Vowel)
	if l.Shadda {
		shadda = string(Shadda)
	}
	if l.SuperscriptAlef {
		superscript = string(SuperscriptAlef)
	}
	if l.Vowel == Sukoon && l.Letter != Yeh && l.Letter != Waw {
		vowel = ""
	}
	return fmt.Sprintf("%c%s%s%s", l.Letter, vowel, shadda, superscript)
}

func (l LetterPack) Unpointed(showShadda bool) string {
	if !l.Shadda || !showShadda {
		return string(l.Letter)
	}

	return string(l.Letter) + string(Shadda)
}

// LetterPacks breaks down each letter from pointedWord into a LetterPack struct
// LetterPacks assumes pointedWord is valid
func LetterPacks(pointedWord string) []LetterPack {
	letters := []LetterPack{}
	letter := LetterPack{
		Vowel: Sukoon,
	}
	for _, l := range pointedWord {
		if l == Shadda {
			letter.Shadda = true
		} else if l == SuperscriptAlef {
			letter.SuperscriptAlef = true
		} else if vowels[l] {
			letter.Vowel = l
		} else {
			if letter.Letter != 0 {
				letters = append(letters, letter)
				letter = LetterPack{
					Vowel: Sukoon,
				}
			}
			letter.Letter = l
		}
	}
	letters = append(letters, letter)
	return letters
}

func (l LetterPack) EqualTo(o LetterPack) bool {
	return l.Shadda == o.Shadda && l.Letter == o.Letter && l.Vowel == o.Vowel
}

func LetterPackFromString(str string) LetterPack {
	letter := LetterPack{}
	for _, l := range str {
		switch l {
		case Shadda:
			letter.Shadda = true
		case Sukoon, Damma, Fatha, Kasra, Dammatan, Fathatan, Kasratan:
			letter.Vowel = l
		default:
			letter.Letter = l
		}
	}
	return letter
}
