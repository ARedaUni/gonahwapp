.PHONY: all
all: bro nahwapp

.PHONY: bro
bro:
	go build -o ./bin/bro ./cmd/bro

.PHONY: nahwapp
nahwapp: scss
	go build -o ./bin/nahwapp ./cmd/nahwapp

.PHONY: scss
scss:
	sass ui/scss/styles.scss ui/static/styles.css
