---
layout: post
title: "Understanding Go Interfaces from First Principles"
subtitle: "Interfaces in Go aren't what you think they are — and that's what makes them powerful."
tags: [go, programming]
---

Most explanations of Go interfaces start with the syntax. This one won't.

Instead, let's start with the problem interfaces solve, and work backwards to why Go's approach is surprisingly elegant.

## The problem: coupling

When module A depends directly on module B, you've created coupling. A can't exist without B. Testing A requires B. Changing B risks breaking A.

The classic solution is *indirection*: instead of depending on a concrete thing, depend on a description of what you need.

That description is an interface.

## What makes Go's interfaces different

In most languages (Java, C#, TypeScript), interfaces are *declared*. You say "this type implements that interface" explicitly.

Go's interfaces are *inferred*. A type satisfies an interface if it has the right methods — no declaration required.

```go
type Stringer interface {
    String() string
}

type Point struct {
    X, Y float64
}

// Point implicitly satisfies Stringer
func (p Point) String() string {
    return fmt.Sprintf("(%v, %v)", p.X, p.Y)
}
```

`Point` never mentions `Stringer`. It just has a `String()` method, and that's enough.

## Why this matters

This design decision has a profound consequence: **interfaces are defined by the consumer, not the producer.**

The package that *needs* a logger defines `Logger`. The package that *provides* logging just has methods. If they happen to match, they fit together — even if they were written years apart by different people.

This is the opposite of most OOP languages, where the producer decides the contract.

```go
// In your package — you define this
type Logger interface {
    Log(msg string, level int)
}

// In some other package — they don't know you exist
type ZapLogger struct { ... }
func (z ZapLogger) Log(msg string, level int) { ... }

// They fit anyway
var l Logger = ZapLogger{}
```

## The empty interface

`interface{}` (or `any` in modern Go) is the interface with no methods. Every type satisfies it, so it can hold any value.

It's Go's escape hatch. Use it sparingly — it trades away type safety for flexibility.

```go
func PrintAnything(v any) {
    fmt.Println(v)
}
```

## A practical heuristic

Keep interfaces small. One or two methods is ideal. `io.Reader` has one. `io.Writer` has one. These small interfaces compose beautifully — `io.ReadWriter` is just both combined.

The moment an interface has seven methods, it's describing a class, not a capability.

---

The next time you're reaching for a concrete type in a function signature, ask: what's the minimum capability I actually need here? Name that capability. Make it an interface. The code will be better for it.
