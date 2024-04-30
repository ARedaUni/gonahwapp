package arabic

import (
	"fmt"
	"testing"
)

func TestFromBuckWalter(t *testing.T) {
	got := FromBuckwalter("h*A byt.")
	expected := fmt.Sprintf("%c%c%c %c%c%c.", Heh, Thal, Alef, Beh, Yeh, Teh)
	if got != expected {
		t.Errorf("got: %v; expected: %v", got, expected)
	}
}

func TestToBuckWalter(t *testing.T) {
	got := ToBuckwalter(FromBuckwalter("h*A byt."))
	expected := "h*A byt."
	if got != expected {
		t.Errorf("got: %v; expected: %v", got, expected)
	}
}
