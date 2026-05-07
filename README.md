# futureMe

A multi-agent future-self simulator. Ask a life-decision question and six AI agents explore what could happen — the upside, the risks, the pragmatic middle, and what life looks like if nothing changes.

**Live app:** https://future-me-phi.vercel.app

Built with [AG2 Beta](https://docs.ag2.ai/latest/docs/beta/motivation/) (agent orchestration), [Gemini 2.5](https://openrouter.ai/) (via OpenRouter), [Next.js](https://nextjs.org/), and [CopilotKit](https://www.copilotkit.ai/). Deployed with the frontend on Vercel and the backend on Render.

## How It Works

1. **Consultant** gathers context through conversation — your situation, values, hopes, fears, constraints.
2. **Specialist Discussion** runs two rounds of live deliberation:
   - **Optimist** — what could go right
   - **Realist** — what will probably happen
   - **Risk Analyst** — what could go wrong and how to prepare
3. The specialists produce their final structured analyses **in parallel** after the discussion transcript exists.
4. **Future Self** synthesizes four scenarios: Hopeful, Balanced, Cautious, and Unchanged Path.
5. **Reporter** produces a final decision-support report with themes, uncertainties, and reflection questions.

No agent tells you what to do. They help you see clearly. The chat starts with warm example prompts for decisions like relationships, work, relocation, and whether to stay or begin again.

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai/) API key

### Backend

```bash
# Clone and enter the project
git clone <repo-url> && cd future-me

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Run the backend
python -m uvicorn backend.server:app --reload --port 8008
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to localhost:8008)
cp .env.example .env.local
# Edit .env.local if your backend runs on a different host/port

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The left panel is the Consultant chat interface; the right panel shows the live pipeline as it arrives: Consultant briefing, specialist discussion, final specialist outputs, future scenarios, and final report.

### Verification

```bash
# Backend syntax check
python -m compileall backend

# Frontend checks
cd frontend && npm run lint
cd frontend && npm run build
```

The `backend/test_*.py` scripts are LLM-backed smoke scripts. They require a configured OpenRouter key and network access, so they are not part of the default local verification loop.

## Project Structure

```
backend/
├── config.py              # Model configs (Gemini 2.5 Pro/Flash via OpenRouter)
├── models.py              # Pydantic models for structured agent output
├── prompts_consultant.py  # Consultant agent system prompt
├── prompts_discussion.py  # Free-text specialist discussion prompts
├── prompts_specialists.py # Structured specialist + synthesis agent prompts
├── agents.py              # Consultant, Future Self, Reporter, and tool wiring
├── discussion.py          # 2-round discussion + final parallel specialist pass
├── pipeline_state.py      # Shared pipeline state shape
├── state_middleware.py    # AG-UI state snapshots for subagent tools
├── errors.py              # Retry logic for structured output parsing
├── main.py                # CLI runner with streaming events
└── server.py              # FastAPI + AG-UI SSE endpoint

frontend/src/
├── app/                   # Next.js app router (API route, layout, page)
├── components/            # UI panels and responsive pipeline wrappers
└── types.ts               # TypeScript types matching backend models
```

## Deployment

The app is split across two services. Both deploy automatically from `main` on push.

### Backend → Render

Render Web Service connected to the GitHub repo. Root directory left blank (uses repo root where `pyproject.toml` lives).

| Setting | Value |
|---|---|
| Runtime | Python 3 |
| Build command | `pip install -e .` |
| Start command | `uvicorn backend.server:app --host 0.0.0.0 --port $PORT` |

Environment variables on Render:

| Name | Value |
|---|---|
| `OPENROUTER_API_KEY` | your OpenRouter key |
| `CORS_ORIGINS` | `http://localhost:3000,https://future-me-phi.vercel.app` (no trailing slashes — must match the browser's `Origin` header byte-for-byte) |

Render's free tier sleeps after 15 minutes of inactivity; the first request takes ~30 seconds to wake the service.

### Frontend → Vercel

Vercel project connected to the GitHub repo with **Root Directory** set to `frontend/` (the Next.js app lives in a subfolder). Framework auto-detects as Next.js; build/output commands stay at defaults. **Deployment Protection** is turned off so the production URL is publicly reachable.

Environment variables on Vercel:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | the Render URL (e.g. `https://futureme-backend-mtht.onrender.com`) | The `NEXT_PUBLIC_` prefix is required so the value is embedded in the browser bundle. Baked in at **build time** — changing the value requires a redeploy. |

### How the two halves connect

The frontend hits `/healthz` on the backend at mount as a connectivity check, and streams the agent pipeline over `/chat` (Server-Sent Events). For the browser to be allowed to make those calls cross-origin, the backend's `CORS_ORIGINS` must list the exact Vercel origin (scheme + host, no trailing slash) — FastAPI's CORS middleware does an exact-match comparison against the `Origin` header.

## Safety

- Crisis topics (self-harm, abuse, addiction) trigger professional resource referrals before any simulation.
- Agents never diagnose mental health conditions.
- The "Unchanged Path" scenario is honest, not guilt-tripping — sometimes staying put is the right call.

## License

MIT
