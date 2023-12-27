package main

type contextKey string

const (
	excerptKey   = contextKey("excerptKey")
	excerptIdKey = contextKey("excerptIdKey")
	iteratorKey  = contextKey("iteratorKey")
)
