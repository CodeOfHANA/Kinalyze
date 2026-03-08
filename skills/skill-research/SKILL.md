---
name: skill-research
description: >
  Research and knowledge acquisition orchestrator for the Kinalyze project. Use this skill
  INSTEAD of asking Claude Code to research from scratch whenever the task involves:
  learning a new library or technology, investigating best practices, exploring
  physiotherapy domain knowledge, understanding a new API or framework, or any knowledge
  work that benefits from curation over hallucination. Trigger on: "research X",
  "learn about X", "how does X work", "find best practices for X", "understand X before
  we code", "what should I know about X", "look up X", or any task where you need
  reliable external knowledge before writing code.

  IMPORTANT: This skill reduces Claude Code token usage and hallucination risk by
  routing research to NotebookLM (curated sources), YouTube (visual learning), and
  Obsidian (second brain capture) — tools that are better suited to knowledge work
  than an AI coding agent.
---

# skill-research — Kinalyze Research Offloading System

## Why This Skill Exists

Claude Code is optimized for **coding**, not **research**. When asked to research
unfamiliar topics, it may confidently produce outdated or incorrect information while
consuming large amounts of context window. This skill routes knowledge work to better
tools, then feeds curated outputs back into Claude Code as grounded context.

```
Research need identified
        ↓
┌───────────────────────────────────────────────────┐
│  Route to the right tool:                         │
│                                                   │
│  📚 NotebookLM  — deep doc analysis, Q&A          │
│  🎬 YouTube MCP — tutorials, visual walkthroughs  │
│  🧠 Obsidian    — capture, connect, second brain  │
└───────────────────────────────────────────────────┘
        ↓
Findings exported to Obsidian
        ↓
Claude Code reads Obsidian export → codes with grounded context
```

---

## Reference Map

| Task | File |
|------|------|
| How to use NotebookLM for Kinalyze research | `references/notebooklm-guide.md` |
| How to use YouTube MCP for learning | `references/youtube-guide.md` |
| Obsidian capture + export patterns | `references/obsidian-guide.md` |
| Research topics pre-mapped for Kinalyze | `references/kinalyze-research-topics.md` |

---

## Decision Tree — Which Tool to Use

```
Is the topic visual / tutorial-based?
  YES → Start with YouTube MCP, then NotebookLM for depth
  NO  → Go directly to NotebookLM

Is the source a specific document/paper/spec?
  YES → Upload to NotebookLM → structured Q&A
  NO  → Use YouTube for overview first

Do I need to connect this to existing Kinalyze knowledge?
  YES → Obsidian MCP → link to existing notes
  NO  → Export to Obsidian anyway for second brain capture

Am I learning a new coding library/framework?
  YES → YouTube MCP (find tutorial) + NotebookLM (upload docs) + Obsidian (capture patterns)
  NO  → NotebookLM (upload paper/spec) + Obsidian (capture key facts)
```

---

## Standard Research Session Flow

1. **Identify the research need** — write a clear question, not just a topic
2. **Route to tool(s)** — use the decision tree above
3. **Research in NotebookLM / YouTube**
4. **Capture in Obsidian** — use the templates in `references/obsidian-guide.md`
5. **Export key findings** — create a brief `research-<topic>.md` in the relevant kinalyze-* repo
6. **Return to Claude Code** — paste or link findings as grounding context before coding

---

## Kinalyze Research Topics (pre-mapped)

See `references/kinalyze-research-topics.md` for a full list of research tasks,
which tool handles each, and the Obsidian note structure to capture findings.
