.PHONY: run scss

run: scss
	go run ./cmd/web

scss:
	sass ui/scss/styles.scss ui/static/styles.css
