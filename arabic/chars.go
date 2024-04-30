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
	ArabicQuestionMark      = rune(0x61F)
	LeftAngleQuotationMark  = rune(0x00AB)
	RightAngleQuotationMark = rune(0x00BB)
	Period                  = '.'
	Colon                   = ':'
	QuotationMark           = '"'
	ArabicComma             = rune(0x060C)
	EmDash                  = '—'

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

var vowels = map[rune]bool{
	Sukoon:   true,
	Damma:    true,
	Fatha:    true,
	Kasra:    true,
	Dammatan: true,
	Fathatan: true,
	Kasratan: true,
}

var punctuation = map[rune]bool{
	ArabicQuestionMark:      true,
	LeftAngleQuotationMark:  true,
	RightAngleQuotationMark: true,
	Period:                  true,
	Colon:                   true,
	QuotationMark:           true,
	ArabicComma:             true,
	EmDash:                  true,
}

var letters = map[rune]bool{
	Hamza:              true,
	AlefWithMadda:      true,
	AlefWithHamzaAbove: true,
	WawWithHamza:       true,
	AlefWithHamzaBelow: true,
	YehWithHamzaAbove:  true,
	Alef:               true,
	Beh:                true,
	TehMarbuta:         true,
	Teh:                true,
	Theh:               true,
	Jeem:               true,
	Hah:                true,
	Khah:               true,
	Dal:                true,
	Thal:               true,
	Reh:                true,
	Zain:               true,
	Seen:               true,
	Sheen:              true,
	Sad:                true,
	Dad:                true,
	Tah:                true,
	Zah:                true,
	Ain:                true,
	Ghain:              true,
	Feh:                true,
	Qaf:                true,
	Kaf:                true,
	Lam:                true,
	Meem:               true,
	Noon:               true,
	Heh:                true,
	Waw:                true,
	AlefMaksura:        true,
	Yeh:                true,
	AlefWaslah:         true,
}
