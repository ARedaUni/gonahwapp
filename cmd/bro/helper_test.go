package main

import (
	"os"
	"strings"
	"testing"
)

func TestReadQuiz(t *testing.T) {
	fsys := os.DirFS("./testdata")
	name, data := readQuiz(fsys, "basic.json")
	got, expected := name, "Test"
	if got != expected {
		t.Errorf("got name %s; expected %s", got, expected)
	}

	if !strings.Contains(string(data), `"Preceding":false`) {
		t.Logf("%+v", string(data))
		t.Error("parse failed")
	}
}
