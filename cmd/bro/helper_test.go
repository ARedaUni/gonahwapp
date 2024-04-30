package main

import (
	"os"
	"testing"
)

func TestReadQuiz(t *testing.T) {
	fsys := os.DirFS("./testdata")
	name, data := readQuiz(fsys, "basic.json")
	got, expected := name, "Test"
	if got != expected {
		t.Errorf("got name %s; expected %s", got, expected)
	}

	if data.Sentences[0].Words[0].Preceding != false {
		t.Logf("%+v", data.Sentences)
		t.Error("parse failed")
	}
}
