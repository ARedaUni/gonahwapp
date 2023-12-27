package main

type contextKey string

const (
	excerptKey  = contextKey("excerptKey")
	iteratorKey = contextKey("iteratorKey")
)
