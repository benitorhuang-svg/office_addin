# Nexus Center: Omni-Office Zenith

## Project Overview

Nexus Center is an industrial-grade Office Add-in designed as a "Strategic Workstation" for Word, Excel, and PowerPoint. It operates as a "Virtual Office Team" by utilizing a Multi-Agent Graph Workflow powered by the GitHub Copilot SDK ACP (Agent Communication Protocol). 

The architecture is a **Dual-Engine Arsenal**:
1.  **Node.js (v24) Core**: Handles UI/UX, Express routing, ACP adapters, and multi-agent orchestration.
2.  **Python (v3.12) Engine**: A FastAPI-based `skill_bridge` that provides high-performance, cold-start-free execution of data science (Pandas, NetworkX) and document manipulation skills.

Key architectural concepts include Hexagonal ACP Adapters for environment isolation, Atomic Design for Office tools, and a Three-Tier Design for Agent Skills (Metadata -> Core Instructions -> Reference Layer) to optimize LLM token usage.

## Building and Running

The project heavily relies on Docker for a consistent industrial-grade environment, but can also be run locally.

### Standard Commands (from `package.json`)

*   **Start Local Development:**
    ```bash
    npm run dev
    # or
    npm run start
    ```
*   **Run Backend Tests:**
    ```bash
    npm run test:backend
    ```
*   **Typechecking:**
    ```bash
    npm run typecheck
    ```
*   **Linting & Formatting:**
    ```bash
    npm run lint
    npm run prettier
    ```

### Docker Deployment (Recommended)

Ensure Docker and Docker Compose are installed.

*   **Build and Start All Services:**
    ```bash
    docker-compose up -d --build
    ```
*   **View Logs:**
    ```bash
    docker-compose logs -f
    ```
*   **Stop Services:**
    ```bash
    docker-compose stop
    ```

## Development Conventions

*   **TypeScript Strictness:** The project enforces strict TypeScript configurations (e.g., `strict: true`, `noUncheckedIndexedAccess: true`). Ensure all types and null checks are handled rigorously.
*   **Testing:** Backend logic is tested using Jest. The project enforces code coverage thresholds (currently configured in `jest.config.js`). All new Agent Skills or Orchestrator logic must be accompanied by unit tests.
*   **Python Skill Execution:** Python skills must be exposed via the FastAPI `skill_bridge.py` using `asyncio.to_thread` to prevent blocking the event loop. Avoid spawning new `python3` child processes directly to prevent cold-start latency and OOM issues.
*   **Security:** 
    *   OAuth flows must implement PKCE (`code_challenge`/`code_verifier`) and CSRF (`state`) protection.
    *   API Keys must be validated and passed via `Authorization: Bearer` headers.
    *   Logs containing sensitive keys (e.g., `ghp_`, `bearer `) are strictly redacted.
*   **Agent Communication:** Interactions with the Office host or LLM providers are decoupled through the ACP Connectivity Layer. Direct hardcoding of API calls outside of the `adapters/ai-providers` or specific skill invokers is discouraged.
*   **Code Style:** Managed by ESLint and Prettier. Run `npm run lint` with `--max-warnings=0` to ensure compliance before committing.