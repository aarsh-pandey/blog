---
layout: post
title: "How RAG Works"
subtitle: "LLMs have a knowledge cutoff and no memory. RAG is the fix — and it's simpler than it sounds."
tags: [ai, llm]
---

Large language models are impressive, but they have a fundamental constraint: they only know what was in their training data, frozen at a point in time. Ask GPT-4 about something that happened last week, or about your company's internal docs, and it either hallucinates or admits ignorance.

Retrieval-Augmented Generation — RAG — is the standard solution.

## The core idea

RAG is two steps:

1. **Retrieve** relevant documents for the user's query
2. **Generate** a response using those documents as context

Instead of relying on what the model memorized during training, you hand it fresh information at inference time. The model becomes a reasoning engine over your data, not a knowledge store.

## Step 1: Indexing

![Indexing pipeline — documents are chunked, embedded, and stored in a vector database]({{ '/assets/images/rag-indexing.svg' | relative_url }})

Before you can retrieve anything, you need to index your documents. This happens offline.

Each document (or chunk of a document) gets converted into a vector — a list of numbers that encodes its semantic meaning. This is done by an *embedding model*, a neural net trained to map text into a high-dimensional space where similar meanings land close together.

```
"The cat sat on the mat."  →  [0.12, -0.84, 0.33, ...]
"A feline rested on a rug." →  [0.11, -0.81, 0.35, ...]  # close!
"Quarterly revenue is up."  →  [0.92,  0.14, -0.67, ...]  # far
```

You store these vectors in a *vector database* — Pinecone, Weaviate, pgvector, Chroma, and others. The database is optimized for one operation: finding the N vectors closest to a query vector.

## Step 2: Retrieval

![Retrieval and generation — query is embedded, matched against the vector DB, top chunks are passed to the LLM]({{ '/assets/images/rag-retrieval.svg' | relative_url }})

When a user asks a question, you embed their query using the same embedding model, then run a nearest-neighbor search against your vector database.

```
query: "what is our refund policy?"
  → embed query → [0.43, -0.21, ...]
  → search vector DB → top 3 matching chunks
  → return: [chunk_42, chunk_7, chunk_91]
```

The chunks that come back are semantically similar to the question — they might not share a single keyword, but they're conceptually related.

## Step 3: Generation

Now you build a prompt that includes both the user's question and the retrieved chunks, and send it to the LLM:

```
System: You are a helpful assistant. Answer based only on the context below.

Context:
[chunk_42] Our refund policy allows returns within 30 days...
[chunk_7]  Refunds are processed within 5-7 business days...
[chunk_91] Digital products are non-refundable unless...

User: What is your refund policy?
```

The model reads the context and generates a grounded answer. If the context doesn't contain the answer, a well-prompted model should say so rather than invent one.

## Why it works

The key insight is that LLMs are exceptional at reading comprehension and synthesis. Give them a passage and a question, and they'll extract and reason over the answer reliably. RAG exploits this — instead of asking the model to *remember*, you ask it to *read*.

This sidesteps the hallucination problem for factual questions: the model is constrained to what you gave it.

## The moving parts

A production RAG system has a few components worth knowing:

**Chunking strategy**: You split documents into chunks before embedding. Too large and the chunk adds noise; too small and you lose context. Typical chunks are 200–500 tokens, sometimes with overlap so context doesn't get cut at boundaries.

**Embedding model**: Separate from the LLM. OpenAI's `text-embedding-3-small`, Cohere's `embed-v3`, or open models like `bge-m3` are common choices. The embedding model determines retrieval quality.

**Retrieval depth (top-k)**: How many chunks to retrieve. More context = more coverage but longer prompts and more noise. 3–5 is a common default.

**Reranking**: A lightweight model that reorders retrieved chunks by relevance before they go into the prompt. Catches cases where vector similarity diverges from actual usefulness.

## What RAG doesn't solve

RAG is not a silver bullet.

If the right chunk isn't in your index, retrieval fails silently — the model answers from a bad or empty context. Garbage in, garbage out.

Multi-hop questions are hard: "Who manages the team that owns the billing service?" requires connecting two facts that might live in different documents. Standard RAG retrieves one neighborhood; it doesn't traverse graphs.

And RAG adds latency. Every query now involves an embedding call, a vector search, and a larger prompt.

---

RAG is fundamentally simple: look something up, then answer with it in hand. The complexity lives in the details — chunking, embedding quality, retrieval tuning, prompt design. But the architecture is just a smart use of the LLM's best skill: reading.
