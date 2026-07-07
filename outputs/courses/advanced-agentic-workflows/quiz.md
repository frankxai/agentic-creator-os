# Course Quiz: Advanced Agentic Workflows
## Answer all questions to verify mastery.

### Question 1
What is the core limitation of ephemeral AI assistants?
- [ ] A) Lack of web browsing capability
- [x] B) Loss of persistent memory state and high tool startup latency
- [ ] C) Inability to write JavaScript files

*Explanation: Ephemeral assistants start from a blank slate every session and add ~200ms per tool call, whereas ACOS persists state in SQLite and runs daemons under 2ms.*

### Question 2
How does the ACOS Taste Guard prevent AI-slop violations?
- [ ] A) By rewriting the database schema
- [x] B) By scanning files statically for banned keywords (e.g. "delve", "revolutionary") before commits
- [ ] C) By translating code into Python scripts
