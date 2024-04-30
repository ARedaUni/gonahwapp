package arabic

var toBuckwalter = map[rune]rune{
	'A':  Alef,
	'|':  AlefWithMadda,
	'{':  AlefWaslah,
	'`':  SuperscriptAlef,
	'b':  Beh,
	'p':  TehMarbuta,
	't':  Teh,
	'v':  Theh,
	'j':  Jeem,
	'H':  Hah,
	'x':  Khah,
	'd':  Dal,
	'*':  Thal,
	'r':  Reh,
	'z':  Zain,
	's':  Seen,
	'$':  Sheen,
	'S':  Sad,
	'D':  Dad,
	'T':  Tah,
	'Z':  Zah,
	'E':  Ain,
	'g':  Ghain,
	'f':  Feh,
	'q':  Qaf,
	'k':  Kaf,
	'l':  Lam,
	'm':  Meem,
	'n':  Noon,
	'h':  Heh,
	'w':  Waw,
	'Y':  AlefMaksura,
	'y':  Yeh,
	'F':  Fathatan,
	'N':  Dammatan,
	'K':  Kasratan,
	'a':  Fatha,
	'u':  Damma,
	'i':  Kasra,
	'~':  Shadda,
	'o':  Sukoon,
	'\'': Hamza,
	'>':  AlefWithHamzaAbove,
	'<':  AlefWithHamzaBelow,
	'}':  YehWithHamzaAbove,
	'&':  WawWithHamza,
	'_':  Tatweel,
}

var fromBuckwalter = map[rune]rune{
	Alef:               'A',
	AlefWithMadda:      '|',
	AlefWaslah:         '{',
	SuperscriptAlef:    '`',
	Beh:                'b',
	TehMarbuta:         'p',
	Teh:                't',
	Theh:               'v',
	Jeem:               'j',
	Hah:                'H',
	Khah:               'x',
	Dal:                'd',
	Thal:               '*',
	Reh:                'r',
	Zain:               'z',
	Seen:               's',
	Sheen:              '$',
	Sad:                'S',
	Dad:                'D',
	Tah:                'T',
	Zah:                'Z',
	Ain:                'E',
	Ghain:              'g',
	Feh:                'f',
	Qaf:                'q',
	Kaf:                'k',
	Lam:                'l',
	Meem:               'm',
	Noon:               'n',
	Heh:                'h',
	Waw:                'w',
	AlefMaksura:        'Y',
	Yeh:                'y',
	Fathatan:           'F',
	Dammatan:           'N',
	Kasratan:           'K',
	Fatha:              'a',
	Damma:              'u',
	Kasra:              'i',
	Shadda:             '~',
	Sukoon:             'o',
	Hamza:              '\'',
	AlefWithHamzaAbove: '>',
	AlefWithHamzaBelow: '<',
	YehWithHamzaAbove:  '}',
	WawWithHamza:       '&',
	Tatweel:            '_',
}

func FromBuckwalter(sen string) string {
	res := ""
	for _, l := range sen {
		b, ok := toBuckwalter[l]
		if ok {
			res += string(b)
		} else {
			res += string(l)
		}
	}
	return res
}

func ToBuckwalter(sen string) string {
	res := ""
	for _, l := range sen {
		b, ok := fromBuckwalter[l]
		if ok {
			res += string(b)
		} else {
			res += string(l)
		}
	}
	return res
}
