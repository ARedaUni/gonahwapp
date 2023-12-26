.PHONY: run scss templ

run: scss templ
	go run ./cmd/web

scss:
	sass ui/scss/styles.scss ui/static/styles.css

templ:
	templ generate
