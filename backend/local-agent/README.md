Local Agent
===========

This small local helper exposes a token-protected HTTP endpoint bound to 127.0.0.1 for securely starting/stopping the development servers used by this repository.

Usage
-----

Start the agent:

```powershell
npm run start:local-agent
```

Token:
- If `LOCAL_AGENT_TOKEN` environment variable is set, the agent uses it.
- Otherwise the agent writes a token to `server/local-agent/.agent_token` on first run.

Endpoints
- `GET /status` — returns tracked child PIDs
- `POST /run` — body `{ "action": "start-dev" }` or `{ "action": "stop-dev" }`

Security
- Binds to `127.0.0.1` only and requires the token via header `x-local-agent-token` or query `?token=`.
- Only supports the whitelisted actions above.

Notes
- This is a developer convenience tool. Treat the token as a secret and do not expose the agent to remote networks.
