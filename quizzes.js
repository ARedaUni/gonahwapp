// We're using id rather than index so that urls don't break if we change the order
let quizzes = [
	{
		id: 0,
		hidden: true,
		title: "Test Quiz",
		questions: [{
			type: "multiple-choice",
			prompt: "Select the right value",
			answers: ["هذا صحيح", "كرسي"],
			selectMany: true,
			keyboard: {
				single: true,
				double: true,
				letters: true,
				custom: [["هذا صحيح", "هذا باطل", "كرسي"]],
			}
		}],
	},
	{
		id: 1,
		title: "Medina Book 1 - Lesson 1",
		questions: [{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا مفتاح",
			image: "./img/key.png",
			hint: "Translate 'this is a key' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا مِفْتَاحٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا كتاب",
			image: "./img/book.png",
			hint: "Translate 'this is a book' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا كِتَابٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا قلم",
			image: "./img/pen.png",
			hint: "Translate 'this is a pen' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا قَلَمٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا باب",
			image: "./img/door.png",
			hint: "Translate 'this is a door' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا بَابٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا بيت",
			image: "./img/house.png",
			hint: "Translate 'this is a house' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا بَيْتٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا كرسي",
			image: "./img/chair.png",
			hint: "Translate 'this is a chair' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا كُرْسِيٌّ",
			},
		},
		{
			type: "short-answer",
			prompt: "ما هذَا؟",
			answer: "هذا مكتب",
			image: "./img/table.png",
			hint: "Translate 'this is a table' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "هَذَا مَكْتَبٌ",
			},
		},
		{
			type: "short-answer",
			prompt: "أَهذَا بَيْتٌ؟",
			answer: "لا هذا مسجد",
			image: "./img/masjid.png",
			hint: "Translate 'No, this is a masjid' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "لَا, هَذَا مَسْجِدٌ",
			}
		},
		{
			type: "short-answer",
			prompt: "أَهذَا مِفْتَاحٌ؟",
			answer: "لا هذا قلم",
			image: "./img/pen.png",
			hint: "Translate 'No, this is a pen' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "لَا, هَذَا قَلَمٌ",
			}
		},
		{
			type: "short-answer",
			prompt: "أَهذَا قَمِيصٌ؟",
			answer: "نعم هذا قميص",
			image: "./img/shirt.png",
			hint: "Translate 'Yes, this is a shirt' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "نَعَمْ, هَذَا قَمِيصٌ",
			}
		},
		{
			type: "short-answer",
			prompt: "أَهذَا نَجْمٌ؟",
			answer: "نعم هذا نجم",
			image: "./img/star.png",
			hint: "Translate 'Yes, this is a star' to Arabic",
			lang: "ar",
			unlocks: {
				type: "short-vowel",
				answer: "نَعَمْ, هَذَا نَجْمٌ",
			}
		},
		{
			type: "short-vowel",
			answer: "هَذَا مَكْتَبٌ",
		},
		{
			type: "short-vowel",
			answer: "هَذَا مَسْجِدٌ"
		},
		{
			type: "short-vowel",
			answer: "هَذَا قَلَمٌ",
		},
		{
			type: "short-vowel",
			answer: "هَذَا سَرِيرٌ"
		},
		{
			type: "short-vowel",
			answer: "مَا هَذَا؟"
		},
		{
			type: "short-vowel",
			answer: "هَذَا كُرْسِيٌّ"
		},
		{
			type: "short-vowel",
			answer: "أَهَذَا بَيْتٌ؟"
		},
		{
			type: "short-vowel",
			answer: "لَا, هَذَا مَسْجِدٌ"
		},
		{
			type: "short-vowel",
			answer: "مَا هَذَا؟ هَذَا مِفْتَاحٌ"
		},
		{
			type: "short-vowel",
			answer: "مَا هَذَا؟ هَذَا قَلَمٌ"
		},
		{
			type: "short-vowel",
			answer: "هَذَا كَلْبٌ"
		},
		{
			type: "short-vowel",
			answer: "مَنْ هَذَا؟ هَذَا طَبِيبٌ"
		},
		{
			type: "short-vowel",
			answer: "هَذَا جَمَلٌ"
		},
		{
			type: "short-vowel",
			answer: "أَهَذَا كَلْبٌ؟ لَا, هَذَا قِطٌّ"
		},
		{
			type: "short-vowel",
			answer: "أَهَذَا دِيكٌ؟ نَعَمْ"
		},
		{
			type: "short-vowel",
			answer: "أَهَذَا حِصَانٌ؟ لَا, هَذَا حِمَارٌ"
		},
		{
			type: "short-vowel",
			answer: "هَذَا مِنْدِيلٌ"
		},
		{
			type: "short-vowel",
			answer: "أَهَذَا وَلَدٌ؟ نَعَمْ"
		},
		{
			type: "short-vowel",
			answer: "مَنْ هَذَا؟ هَذَا رَجُلٌ"
		}],
	},
	{
		id: 2,
		title: "Medina Book 1 - Lesson 2 (WIP)",
		questions: [
			{
				type: "short-vowel",
				answer: "هَذَا سُكَّرٌ وَذَلِكَ لَبَنٌ"
			},
			{
				type: "short-vowel",
				answer: "مَنْ ذَلِكَ؟ ذَلِكَ إِمَامٌ"
			},
			{
				type: "short-vowel",
				answer: "أَذَلِكَ قِطٌّ؟ لَا, ذَلِكَ كَلْبٌ"
			},
			{
				type: "short-vowel",
				answer: "مَا هَذَا؟ هَذَا حَجَرٌ"
			}
		]
	},
	{
		id: 3,
		title: "Medina Book 1 - Lesson 3",
		questions: [
			{
				type: "short-vowel",
				answer: "مَسْجِدٌ"
			},
			{
				type: "short-vowel",
				answer: "المَسْجِدُ"
			},
			{
				type: "short-vowel",
				answer: "المَاءُ"
			},
			{
				type: "short-vowel",
				answer: "مَاءٌ"
			},
			{
				type: "short-vowel",
				answer: "البَيْتُ"
			},
			{
				type: "short-vowel",
				answer: "بَابٌ"
			},
			{
				type: "short-vowel",
				answer: "قَلَمٌ"
			},
			{
				type: "short-vowel",
				answer: "القَلَمُ"
			},
			{
				type: "short-vowel",
				answer: "الكَلْبُ"
			},
			{
				type: "short-vowel",
				answer: "كَلْبٌ"
			},
			{
				type: "short-vowel",
				answer: "قَمِيصٌ"
			},
			{
				type: "short-vowel",
				answer: "وَلَدٌ"
			},
			{
				type: "short-vowel",
				answer: "الحَجَرُ"
			},
			{
				type: "short-vowel",
				answer: "الوَالِدُ"
			},
			{
				type: "short-vowel",
				answer: "حِمَارٌ"
			},
			{
				type: "short-vowel",
				answer: "الحِمَارُ"
			},
			{
				type: "short-vowel",
				answer: "الحِصَانُ"
			},
			{
				type: "short-vowel",
				answer: "حِصَانٌ"
			},
			{
				type: "short-vowel",
				answer: "المَكْتَبُ مَكْسُورٌ"
			},
			{
				type: "short-vowel",
				answer: "القَمِيصُ وَسِخٌ"
			},
			{
				type: "short-vowel",
				answer: "المَسْجِدُ مَفْتُوحٌ"
			},
			{
				type: "short-vowel",
				answer: "اللَّبَنُ بَارِدٌ وَالمَاءُ حَارٌّ"
			},
			{
				type: "short-vowel",
				answer: "القَمَرُ بَعِيدٌ"
			},
			{
				type: "short-vowel",
				answer: "المُدَرِّسُ جَدِيدٌ"
			},
			{
				type: "short-vowel",
				answer: "اللَّبَنُ بَارِدٌ"
			},
			{
				type: "short-vowel",
				answer: "الحَجَرُ كَبِيرٌ"
			},
			{
				type: "short-vowel",
				answer: "الإمَامُ جَالسٌ والمُدَرِّسُ وَاقِفٌ"
			},
			{
				type: "short-vowel",
				answer: "المِنْدِيلُ نَظِيفٌ"
			},
			{
				type: "multiple-choice",
				prompt: "الحَجَرُ ؟؟",
				hint: "Fill in the blank",
				answers: ["ثَقِيلٌ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "البَابُ ؟؟",
				hint: "Fill in the blank",
				answers: ["مَفْتُوحٌ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "القَمَرُ ؟؟",
				hint: "Fill in the blank",
				answers: ["جَمِيلٌ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "الوَرَقُ ؟؟",
				hint: "Fill in the blank",
				answers: ["خَفِيفٌ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "المِنْدِيلُ ؟؟",
				hint: "Fill in the blank",
				answers: ["وَسِخٌ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "اللَّبَنُ ؟؟",
				hint: "Fill in the blank",
				answers: ["حَارٌّ"],
				keyboard: {
					custom: [
						["جَمِيلٌ", "وَسِخٌ"],
						["حَارٌّ", "ثَقِيلٌ", "خَفِيفٌ", "مَفْتُوحٌ"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ نظيف",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["المنديل", "الكرسي", "البيت", "المسجد"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ مكسور",
				hint: "Fill in the blank.",
				answers: ["الكرسي"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ بارد",
				hint: "Fill in the blank.",
				answers: ["الماء"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ قريب",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["المسجد", "البيت"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ بعيد",
				hint: "Fill in the blank.",
				answers: ["القمر"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ واقف",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["المدرّس", "الولد"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ جالس",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["المدرّس", "الولد"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ كبير",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["البيت", "المسجد", "الكتاب", "الدّفتر", "القمر", "الكرسي"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ قديم",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["الكرسي", "البيت", "المسجد", "الماء", "القمر", "الدّفتر", "الكتاب"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},
			{
				type: "multiple-choice",
				prompt: "؟؟ جديد",
				hint: "Fill in the blank. Multiple answers are correct.",
				answers: ["الكرسي", "البيت", "المسجد", "الماء", "القمر", "الدّفتر", "الكتاب"],
				keyboard: {
					custom: [
						["المنديل", "الكرسي", "الولد", "البيت"],
						["المسجد", "الماء", "القمر", "المدرّس"],
						["الدّفتر", "الكتاب"]],
				}
			},

		]
	}
];
