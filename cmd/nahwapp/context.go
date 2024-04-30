package main

type contextKey string

const (
	excerptKey   = contextKey("excerptKey")   // value type: kalam.Excerpt
	excerptIdKey = contextKey("excerptIdKey") // value type: int
	iteratorKey  = contextKey("iteratorKey")  // value type: kalam.ExcerptIterator
)
