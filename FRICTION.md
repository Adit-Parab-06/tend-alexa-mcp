# Friction Log & Developer Experience Journal

This document records tooling, SDK, and ecosystem friction encountered during development, along with workarounds and recommendations. High-quality friction logging provides actionable feedback for platform teams and demonstrates thorough technical evaluation.

| ID | Phase / Task | Tool / Component | Expected Behavior | Actual Behavior | Severity | Workaround | Recommendation |
|---|---|---|---|---|---|---|---|
| F-001 | Phase 0 Setup | npm 12+ / pnpm | `npm i -g pnpm` installs executable and shims cleanly | npm 12 blocks install scripts by default (`allowScripts: false`), preventing pnpm shim creation | Medium | Run `npm install -g --allow-scripts=pnpm pnpm` | Modern Node 24/npm 12 environments require explicit script allowlisting for CLI packages with postinstall hooks. Document in setup guides. |
| F-002 | Phase 0 Documentation | Amazon Dev Portal `llms.txt` | Standard machine-readable documentation index available at `https://developer.amazon.com/docs/llms.txt` | Endpoint returns 404 Not Found HTML page | Low | Use standard web search and developer documentation portals directly | Publish a dedicated `llms.txt` at the root of `developer.amazon.com` indexing Alexa+ MCP specifications and certification requirements. |
