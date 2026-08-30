# NeedFlare — Emergency Field Intelligence & Autonomous Logistics Agent

[![Gemini 3.7 Flash](https://img.shields.io/badge/Gemini_3.7_Flash-Autonomous_Agent-8E75C4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Google Gemma 4](https://img.shields.io/badge/Gemma_4-Edge_PII_Scrub-34A853?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Google Veo 3.1](https://img.shields.io/badge/Google_Veo_3.1-Visual_Broadcasts-EA4335?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/veo/)
[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Serverless-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)

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
4. **Universal Visual Guidance (Google Veo):** For critical survival scenarios (water decontamination, trauma wound care, emergency shelter), the agent triggers zero-text, high-contrast instructional survival broadcasts viewable by anyone regardless of language.

---

## 🏗️ Architecture

```
[Field Volunteers] ──(Edge Gemma 4)──► [Offline Queue] ──► [Cloud Pub/Sub: needflare-reports]
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
                                                   [Google Veo 3.1 Fast Broadcast]
```

---

## 🛠️ Technology Stack

- **Gemini 3.7 Flash via GenKit** (agent reasoning + multi-tool invocation)
- **Gemma 4 / Gemma 3-27B-IT** (`models/gemma-4-26b-a4b-it`) (on-device report classification & edge PII sanitization)
- **Google Cloud Run** (serverless containerized agent backend)
- **Google Cloud Pub/Sub** (asynchronous event ingestion pipeline)
- **Google Cloud Firestore** (persistent report + task + visual guide state)
- **Google Veo 3.1 Fast / Veo 2** (`models/veo-3.1-fast-generate-preview`) (universal survival video generation)
- **React 19 + TypeScript + Vite** (tactical coordinator dashboard & edge volunteer UI)

| Layer | Google Technology | Role |
|---|---|---|
| **Core Reasoning Agent** | **Gemini 3.7 Flash** | Event triage, severity assessment, rationale generation, tool orchestration |
| **Agent Framework** | **GenKit v1.41** (`@genkit-ai/google-genai`) | Flow definition, schema validation (Zod), multi-tool execution |
| **Edge Intelligence** | **Gemma 4** (`models/gemma-4-26b-a4b-it`) | Local on-device classification & PII sanitization |
| **Visual Instruction Engine**| **Google Veo 3.1 Fast** (`models/veo-3.1-fast-generate-preview`) | Universal non-verbal survival video generation |
| **Event Pipeline** | **Google Cloud Pub/Sub** | Asynchronous ingestion topic (`needflare-reports`) |
| **Persistent State** | **Google Cloud Firestore** | Enterprise Native database (`needflare-db`) for reports, tasks, and visual guides |
| **Serverless Runtime** | **Google Cloud Run** | Scalable, containerized agent server (`needflare-agent`) |
| **Frontend UI** | **React 19 + TypeScript + Vite** | Tactical coordinator map, Leaflet grid, volunteer edge terminal |

---

## ☁️ Cloud Infrastructure & Services

All foundational Google Cloud infrastructure resources for this platform are provisioned, verified, and running in production:

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
- **Collections:** `reports`, `tasks`, `veo_guides`

### 4. Secret Manager
- **Secret:** `GEMINI_API_KEY` (securely mounted for Cloud Run runtime)

---

## ⚡ Asynchronous Event Pipeline & Cloud Ingestion

The end-to-end event-driven ingestion pipeline is active and verified across Google Cloud services:

### Ingestion Flow
1. **Batch Ingestion Endpoint:** `POST /api/reports/batch-sync` receives anonymized survivor and volunteer field reports.
2. **Cloud Pub/Sub Ingestion:** Each incoming report is published directly to `projects/<your-project-id>/topics/needflare-reports` with sector and urgency attributes.
3. **Cloud Firestore Persistence:**
   - Raw scrubbed reports are written to the `reports` collection in `needflare-db`.
   - Autonomous logistics tasks generated by Gemini 3.7 Flash are written to the `tasks` collection with `aiGenerated: true`.
4. **Autonomous GenKit Reasoning Loop:** The agent evaluates the report, calculates victim headcount requirements (water liters, medical kits), and triggers universal Google Veo visual prompt guides.

### Local & Cloud Verification

#### Ingestion Request (curl)
Submit an emergency batch containing a sanitized field report:
```bash
curl -X POST http://localhost:8080/api/reports/batch-sync \
  -H "Content-Type: application/json" \
  -d '{"reports":[{"id":"test-001","sectorId":"sector-alpha","sanitizedSummary":"Water shortage, 5 people","category":"water","preliminaryUrgency":"critical","estimatedPeopleCount":5,"timestamp":1234567890,"syncStatus":"offline_queued"}]}'
```

**Agent Response:** Returns `{ "synced": 1 }` along with the autonomous Gemini 3.7 Flash triage assessment, calculated survival rations (e.g. 75L drinking water), dispatched task ID (`task-genkit-...`), and triggered Google Veo visual guide prompt.

---

## 🚀 Serverless Agent Deployment on Google Cloud Run

The GenKit agent server is containerized and deployed on **Google Cloud Run**, serving as the autonomous serverless backend for disaster triage:

### Deployment Architecture & Settings
- **Service Name:** `needflare-agent`
- **Region:** `us-central1`
- **Scaling Policy:** Serverless scale-to-zero (`--min-instances 0`, `--max-instances 3`) — zero compute charges during idle periods, scaling on incoming batches.
- **Security & Governance:** `GEMINI_API_KEY` is securely mounted via **Google Secret Manager** (`roles/secretmanager.secretAccessor`) without hardcoding credentials in the image or container environment.

### Live Cloud Verification
```bash
# 1. Live Agent Health Check
curl https://<your-cloud-run-url>/health

# 2. Live Multi-Service Diagnostics (Pub/Sub + Firestore + Gemini 3.7 Flash)
curl https://<your-cloud-run-url>/api/agent/status

# 3. Live Batch Ingestion & Autonomous Dispatch in Cloud Run
curl -X POST https://<your-cloud-run-url>/api/reports/batch-sync \
  -H "Content-Type: application/json" \
  -d '{"reports":[{"id":"cloud-test-003","sectorId":"sector-alpha","sanitizedSummary":"Flash flood rescue needed, 3 elderly people trapped on roof","category":"rescue","preliminaryUrgency":"critical","estimatedPeopleCount":3,"timestamp":1234567890,"syncStatus":"offline_queued"}]}'

# 4. Live Firestore Persistence & Task Queue Verification
curl https://<your-cloud-run-url>/api/tasks

# 5. Live AI Disaster Copilot Query (Gemini 3.7 Flash)
curl -X POST https://<your-cloud-run-url>/needflareTriageFlow \
  -H "Content-Type: application/json" \
  -d '{"data":{"sanitizedReport":"What is the standard water triage quota for 6 trapped citizens?","sectorId":"coordinator-copilot-query","estimatedPeople":1}}'
```

**Verified Response (Gemini 3.7 Flash Autonomous Dispatch):**
```json
{
  "synced": 1,
  "results": [
    {
      "id": "cloud-test-003",
      "taskGenerated": true,
      "agentReasoning": "### Emergency Assessment & Dispatch Summary\n\n**Sector:** `sector-alpha`\n**Report:** Flash flood rescue needed – 3 elderly individuals trapped on roof\n**Assessed Severity:** **CRITICAL**\n**Dominant Need:** **Rescue**\n\n### Actions Taken:\n1. **Sector Triage Updated:** Elevated to CRITICAL urgency.\n2. **Logistics Task Dispatched (`task-genkit-5213`):**\n   - Title: Emergency Roof Extraction - 3 Trapped Elderly Victims\n   - Payload: 1 swift water rescue boat, 3 adult life vests, rescue ropes & extraction harnesses, 3 thermal blankets, 1 trauma first-aid kit"
    }
  ]
}
```

**Verified Response (Gemini 3.7 Flash Disaster Copilot):**
```markdown
### Emergency Dispatch Response & Humanitarian Water Quota Guidelines
- **Sector:** `coordinator-copilot-query`
- **Dominant Need:** Water
- **Assessed Urgency:** Medium (Triage Logged)

#### Standard Humanitarian Water Quotas (Sphere Standards)
For 6 trapped / isolated citizens, standard emergency water allocations are calculated as follows:

1. **Immediate Survival Baseline (Drinking Only):**
   - Rate: 2.5 to 3.0 Liters / person / day
   - Immediate 24-Hour Payload for 6 People: 18 Liters clean drinking water
   - 72-Hour Survival Payload for 6 People: 54 Liters clean drinking water
2. **Basic Disaster Minimum (Drinking + Basic Sanitation / Cooking):**
   - Rate: 7.5 to 15 Liters / person / day
   - 72-Hour Sustained Operations for 6 People: 135 – 270 Liters
3. **Recommended Field Kit for 6 Trapped Individuals:**
   - 54L potable water (or 6x 10L collapsible jerrycans)
   - 1 pack of Aquatabs / water purification tablets (sufficient for 100+ L)
   - 12 packets of Oral Rehydration Salts (ORS) / electrolytes
```

---

## 🧠 Google AI Ecosystem: Gemini 3.7 Flash, Gemma 4 & Google Veo 3.1

NeedFlare tightly integrates three state-of-the-art Google AI models into an end-to-end disaster response lifecycle:

### 1. Gemini 3.7 Flash — Autonomous Taskmaster & Reasoning Agent
- **Role:** Autonomous triage reasoning, humanitarian ration calculations (Sphere standards), and multi-tool orchestration via Google GenKit.
- **Workflow:** Ingests Pub/Sub messages asynchronously, evaluates sector risk levels, generates actionable task dispatches (`task-genkit-...`), and proactively executes tactical tools without human dispatch bottlenecks.
- **Disaster Copilot:** Powers the interactive coordinator assistant for conversational crisis queries and real-time operational advice.

### 2. Google Gemma 4 (`models/gemma-4-26b-a4b-it`) — Edge PII Sanitization & Hybrid Triage
- **Role:** Autonomous edge-level privacy protection and rapid priority classification directly in the volunteer terminal.
- **Architecture:**
  - **Online Mode:** Calls Google's hosted `gemma-4-26b-a4b-it:generateContent` endpoint for high-precision category (`medical`, `water`, `shelter`, `food`, `rescue`, `power`) and urgency scoring.
  - **Offline/Blackout Mode:** Executes client-side regex heuristics to scrub names, phone numbers, and coordinates directly on the volunteer's device before queuing to encrypted local store-and-forward storage.
- **Latency & Reliability:** Robust JSON extraction prevents parsing exceptions; live edge latency is benchmarked and displayed directly in the UI.

### 3. Google Veo 3.1 Fast (`models/veo-3.1-fast-generate-preview`) — Universal Non-Verbal Visual Guides
- **Role:** Rapid synthesis of zero-text, high-contrast instructional survival video broadcasts for disaster victims facing panic or language barriers.
- **Workflow:**
  1. **Trigger:** Coordinator or autonomous agent requests protocol generation via `POST /api/veo/generate`.
  2. **Rendering:** Veo 3.1 Fast synthesizes an 8-second instructional video via `predictLongRunning` (~30–50s rendering latency).
  3. **Cloud Persistence:** Server polls the operation status, streams the verified MP4, and registers the protocol in **Google Cloud Firestore** (`veo_guides` collection).
  4. **Gallery Player:** Displays real-time looping video previews inside tactical cards and provides full playback via HTML5 `<video>` player with active ON AIR broadcasting toggles.

---

## 🚀 Local Setup & Spin-Up (< 10 Minutes)

Anyone can spin up and verify the entire NeedFlare system locally in under 10 minutes:

### 1. Clone & Install
```bash
git clone https://github.com/vero-code/needflare.git
cd needflare
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Fill in `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` in `.env` (along with `GOOGLE_CLOUD_PROJECT` if syncing to live Firestore/PubSub).

### 3. Launch Services
```bash
# Terminal 1: Start Agent Backend (:8080)
npm run server

# Terminal 2: Start Tactical Dashboard (:5173)
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## ☁️ Cloud Deployment (Google Cloud Run)

Deploy the containerized serverless agent directly to Google Cloud Run:

```bash
gcloud run deploy needflare-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=<your-project-id>,FIRESTORE_DATABASE_ID=needflare-db \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

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

---

## 🔮 Production Roadmap

1. **Persistent Google Cloud Storage (GCS) Multi-Region Buckets:** Fully automate direct uploads to `gs://needflare-veo-assets` with public signed URLs and Cloud CDN to persist media independently of server container lifecycles.
2. **Physical LoRa SX1262 Transceiver Hardware:** Connect physical packet radio transceivers via the Web Serial API for field tests with off-grid LoRa mesh repeaters.
3. **Multi-Language Audio Companion Tracks:** Leverage Gemini 3.7 Voice generation to synthesize optional spoken emergency broadcasts in local dialects alongside Veo's non-verbal visuals.

---

## 📝 License

[MIT License](LICENSE)
