package quiz

import (
	"encoding/json"
	"log"

	"github.com/amrojjeh/nahwapp/model"
)

func ReadQuizName(content []byte) string {
	name := struct {
		Name string
	}{}
	err := json.Unmarshal(content, &name)
	if err != nil {
		log.Fatal("could not unmarshal json\n", err)
	}
	return name.Name
}

func ReadQuizData(content []byte) []byte {
	data := model.QuizData{}
	err := json.Unmarshal(content, &data)
	if err != nil {
		log.Fatal("could not unmarshal json\n", err)
	}
	raw, err := json.Marshal(data)
	if err != nil {
		log.Fatal("could not marshal json\n", err)
	}
	return raw
}
