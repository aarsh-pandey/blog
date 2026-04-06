---
layout: post
title: "Notes on Local-First Software"
subtitle: "What if your apps worked like your files — always available, always yours?"
tags: [software, design]
archived: true
---

The cloud made software better in a lot of ways. Sync across devices. Collaboration. No data loss when your laptop dies.

But it also made software *worse* in a way we've mostly accepted: **your data lives somewhere else**, and access to it depends on someone else's uptime, business model, and goodwill.

Local-first software is an attempt to get the benefits of the cloud without giving up ownership.

## The seven ideals

The original [local-first paper](https://www.inkandswitch.com/local-first/) from Ink & Switch laid out seven properties:

1. **Fast** — no round-trip latency for reads
2. **Multi-device** — works across your machines
3. **Offline** — works without internet
4. **Collaboration** — still supports real-time editing
5. **Longevity** — data survives the vendor
6. **Privacy** — you control your data
7. **User control** — you can export, modify, extend

Most cloud software hits 2 and 4. Most desktop software hits 1, 3, and 6. Local-first tries to hit all seven.

## The hard part: sync

Offline + multi-device + collaboration creates a distributed systems problem. When two devices edit the same document without talking to each other, how do you merge the results?

The promising answer is **CRDTs** — Conflict-free Replicated Data Types. They're data structures designed to merge in a way that's always consistent, without requiring coordination.

The tradeoff: CRDTs work well for text and counters, but get complicated for structured data with complex relationships.

## Where it's going

Tools like Obsidian, Logseq, and Linear (in parts) lean local-first. The [Automerge](https://automerge.org/) library makes CRDTs accessible for app developers. SQLite-based sync tools like libSQL are exploring the same space for databases.

It's not solved. But the gap between "cloud app" and "local app" is narrowing in the right direction.

---

I don't think local-first will replace everything. Some things genuinely need a central server. But for the apps where you'd be upset if the company shut down — your notes, your writing, your finances — it's worth asking whether the data should live on *your* machine first.
