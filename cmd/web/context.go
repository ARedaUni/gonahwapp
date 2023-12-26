package main

type contextKey string

const (
	excerptKey  = contextKey("excerptKey")
	sentenceKey = contextKey("sentenceKey")
)
