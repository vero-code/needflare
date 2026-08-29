# NeedFlare — Emergency Field Intelligence & Autonomous Logistics Agent

> **Submission for Google Cloud: All Things Agentic Hackathon**  
> **Track:** *The Taskmaster* (Autonomous event-driven workflows, asynchronous routing, and proactive multi-tool execution)  
> **Bonus Integrations:** Google Gemma (Edge PII Sanitization) & Google Veo (Non-Verbal Instructional Broadcasts)

---

## 🌟 Overview

In catastrophic disaster zones (hurricanes, earthquakes, flash floods), cellular networks collapse and emergency dispatchers are overwhelmed with fragmented, panic-driven field messages containing sensitive personally identifiable information (PII).

**NeedFlare** is a resilient, privacy-first agentic platform:
1. **Edge PII Stripping (Gemma Edge):** Local volunteers draft reports on-device; phone numbers, names, and precise coordinates are scrubbed into secure sector boundaries before entering public or mesh airwaves.
2. **Asynchronous Cloud Pipeline (Google Cloud Pub/Sub):** Reports buffer offline in local queues and burst-sync across LoRa mesh, satellite, or restored 4G pipelines into Google Cloud Pub/Sub.
3. **Autonomous Taskmaster Dispatcher (Gemini 3.7 Flash via GenKit):** An autonomous backend agent evaluates disaster triage reports asynchronously, calls specialized tools to update tactical sectors, computes survivor payloads, and auto-dispatches supply convoys without manual human bottlenecking.
4. **Universal Visual Guidance (Google Veo):** For critical survival scenarios (water decontamination, trauma wound care, emergency shelter), the agent triggers zero-text, 4K instructional survival broadcasts viewable by anyone regardless of language.

---

## 🏗️ Architecture

```
[Field Volunteers] ──(Edge Gemma)──► [Offline Queue] ──► [Cloud Pub/Sub: needflare-reports]
                                                                  │
                                                                  ▼
[Coordinator Dashboard] ◄── [Firestore: needflare-db] ◄── [Cloud Run: NeedFlare Agent]
   (Live Tactical Map)                                            │
                                                       (Gemini 3.7 Flash)
                                                       ├── triageSectorTool
                                                       ├── createLogisticsTaskTool
                                                       └── triggerVeoVisualGuideTool
                                                                  │
                                                                  ▼
                                                      [Google Veo 4K Broadcast]
```

---

## 🛠️ Technology Stack

| Layer | Google Technology | Role |
|---|---|---|
| **Core Reasoning Agent** | **Gemini 3.7 Flash** | Event triage, severity assessment, rationale generation, tool orchestration |
| **Agent Framework** | **GenKit v1.41** (`@genkit-ai/google-genai`) | Flow definition, schema validation (Zod), multi-tool execution |
| **Edge Intelligence** | **Gemma** | Local on-device classification & PII sanitization |
| **Visual Instruction Engine**| **Google Veo** | Universal non-verbal survival video generation |
| **Event Pipeline** | **Google Cloud Pub/Sub** | Asynchronous ingestion topic (`needflare-reports`) |
| **Persistent State** | **Google Cloud Firestore** | Enterprise Native database (`needflare-db`) for reports and tasks |
| **Serverless Runtime** | **Google Cloud Run** | Scalable, containerized agent server (`needflare-agent`) |
| **Frontend UI** | **React 19 + TypeScript + Vite** | Tactical coordinator map, Leaflet grid, volunteer edge terminal |

---

## 📋 Phase 0: Cloud Infrastructure Setup (Completed & Verified)

All foundational Google Cloud infrastructure resources for this hackathon project are provisioned and verified:

### 1. Google Cloud Project
- **Project ID:** `<your-project-id>`
- **Enabled APIs:**
  - `run.googleapis.com` (Cloud Run Admin API)
  - `pubsub.googleapis.com` (Cloud Pub/Sub API)
  - `firestore.googleapis.com` (Cloud Firestore API)
  - `secretmanager.googleapis.com` (Secret Manager API)

### 2. Cloud Pub/Sub Pipeline
- **Topic:** `projects/<your-project-id>/topics/needflare-reports`
- **Subscription:** `projects/<your-project-id>/subscriptions/needflare-reports-sub`

### 3. Cloud Firestore Database
- **Database ID:** `needflare-db`
- **Mode:** `FIRESTORE_NATIVE`
- **Location:** `us-central1`
- **Collections:** `reports`, `tasks`

### 4. Secret Manager
- **Secret:** `GEMINI_API_KEY` (securely provisioned for Cloud Run runtime)

### 5. Verified Models Available
- `gemini-3.7-flash` (Autonomous triage & tool execution)
- `gemma-4-31b-it` (On-device triage classification)
- `veo-3.1-generate-preview` (Instructional survival video generation)

---

## 🚀 Local Development

### Prerequisites
- Node.js v20+
- Google Cloud CLI (`gcloud`) authenticated (`gcloud auth application-default login`)

### Setup
1. **Clone repository:**
   ```bash
   git clone https://github.com/vero-code/needflare.git
   cd needflare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your `GEMINI_API_KEY`, `GOOGLE_CLOUD_PROJECT=<your-project-id>`, and `FIRESTORE_DATABASE_ID=needflare-db`.

4. **Run Agent Server:**
   ```bash
   npm run server
   ```
   *Runs on `http://localhost:8080` (GenKit Agent Flow + Express endpoints)*

5. **Run Frontend Application:**
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 🧪 Verification Commands

```bash
# Check Agent Health & Cloud Infrastructure Status
curl http://localhost:8080/api/agent/status

# Check Pub/Sub Topic
gcloud pubsub topics list

# Check Firestore Database
gcloud firestore databases list

# Test Direct Gemini API Access
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
```

## 📝 License

[MIT License](LICENSE)
