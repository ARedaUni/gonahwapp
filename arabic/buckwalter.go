package arabic

const (
	// Shadda
	Shadda = rune(0x0651)

	// Short vowels
	Sukoon   = rune(0x0652)
	Damma    = rune(0x064F)
	Fatha    = rune(0x064E)
	Kasra    = rune(0x0650)
	Dammatan = rune(0x064C)
	Fathatan = rune(0x064B)
	Kasratan = rune(0x064D)

	// Misc
	Placeholder     = rune(0x25CC)
	SuperscriptAlef = rune(0x670)

	// Punctuation
	ArabicQuestionMark           = rune(0x61F)
	LeftAngleQuotationMark       = rune(0x00AB)
	RightAngleQuotationMark      = rune(0x00BB)
	Period                  rune = '.'
	Colon                   rune = ':'
	QuotationMark           rune = '"'
	ArabicComma                  = rune(0x060C)
	EmDash                       = '—'

	// Letters
	Hamza              = rune(0x0621)
	AlefWithMadda      = rune(0x0622)
	AlefWithHamzaAbove = rune(0x0623)
	WawWithHamza       = rune(0x0624)
	AlefWithHamzaBelow = rune(0x0625)
	YehWithHamzaAbove  = rune(0x0626)
	Alef               = rune(0x0627)
	Beh                = rune(0x0628)
	TehMarbuta         = rune(0x0629)
	Teh                = rune(0x062A)
	Theh               = rune(0x062B)
	Jeem               = rune(0x062C)
	Hah                = rune(0x062D)
	Khah               = rune(0x062E)
	Dal                = rune(0x062F)
	Thal               = rune(0x0630)
	Reh                = rune(0x0631)
	Zain               = rune(0x0632)
	Seen               = rune(0x0633)
	Sheen              = rune(0x0634)
	Sad                = rune(0x0635)
	Dad                = rune(0x0636)
	Tah                = rune(0x0637)
	Zah                = rune(0x0638)
	Ain                = rune(0x0639)
	Ghain              = rune(0x063A)
	Feh                = rune(0x0641)
	Qaf                = rune(0x0642)
	Kaf                = rune(0x0643)
	Lam                = rune(0x0644)
	Meem               = rune(0x0645)
	Noon               = rune(0x0646)
	Heh                = rune(0x0647)
	Waw                = rune(0x0648)
	AlefMaksura        = rune(0x0649)
	Yeh                = rune(0x064A)
	AlefWaslah         = rune(0x0671)

	Tatweel = rune(0x0640)
)

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
