# PaperLens AI

A research paper analysis tool that turns dense academic PDFs into structured, beginner-friendly learning material — summaries, concept breakdowns, flashcards, difficulty ratings, and more.

---

## Table of Contents

- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Why this stack](#why-this-stack)
- [Folder structure](#folder-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [API endpoints](#api-endpoints)
- [AI prompt design](#ai-prompt-design)
- [Processing pipeline](#processing-pipeline)
- [Frontend completion detection](#frontend-completion-detection)
- [Known limitations](#known-limitations)
- [What I'd improve with more time](#what-id-improve-with-more-time)

---

## What it does

PaperLens AI accepts a research paper through one of input methods and runs it through a structured AI analysis pipeline:

**Input methods:**

- Upload a PDF file directly
- Paste plain text or an abstract
- Provide an arXiv link (fetched and extracted server-side)

**What gets generated:**

- **Executive summary** — a short, plain-language overview of what the paper argues and why it matters
- **Key concepts** — extracted terminology with definitions written for a non-specialist reader
- **Difficulty estimation** — a rating of how technically demanding the paper is, with a brief justification
- **Beginner-friendly explanation** — the core ideas rewritten as if explaining to someone with no domain background
- **Flashcards** — question-and-answer pairs for active recall, expandable/collapsible in the UI
- **Related topics** — adjacent areas worth exploring based on the paper's subject matter

All of this is displayed in a single-page result view. No account required, no data stored between sessions.

---

## Architecture

```
Browser
  |
  | (1) User submits PDF / text
  v
Next.js Frontend  (app/page.tsx, components/)
  |
  | (2) POST request with extracted content
  v
Next.js API Route  (app/api/analyze/route.ts)
  |
  | (3) If PDF: extract text with pdf-parse
  | If URL: fetch arXiv page, extract abstract/body
  | If text: use as-is
  |
  | (4) Send structured text to Gemini API
  v
Google Gemini API
  |
  | (5) Returns structured JSON response
  v
Next.js API Route  (parses and validates response)
  |
  | (6) Returns result to frontend
  v
Browser
  |
  | (7) Frontend renders result panels
  v
User sees: summary, concepts, flashcards, etc.
```

**This is a single Next.js application.** The API route handles PDF extraction and Gemini communication in one synchronous request-response cycle. Results are not persisted — each page load is stateless.

The "async processing" feel in the UI is a staged animation: the frontend shows a sequence of processing steps while the single API request completes. It is a UX pattern, not distributed infrastructure.

---

## Why this stack

**Next.js (App Router)**  
Keeps frontend and API in one project with zero deployment configuration overhead. API routes run as serverless functions on Vercel, which is a natural fit for request-response AI calls. The App Router's file-based routing is clean to navigate for anyone reading the code.

**TypeScript**  
The Gemini response has a non-trivial shape. TypeScript makes the data contract explicit and catches mismatches between what the prompt requests and what the UI expects to render. Given the number of fields (summary, concepts array, flashcards array, etc.), the type safety pays off quickly.

**pdf-parse**  
Straightforward Node.js library for extracting plain text from PDFs server-side. It runs in a Next.js API route without requiring a separate process or binary dependency. Text quality on standard academic PDFs (including arXiv exports) is acceptable for AI summarization.

**Gemini API**  
Google's Gemini models handle the full analysis in a single prompt. The model is given the complete extracted text and asked to return a JSON object with all output fields. One API call per analysis keeps the implementation simple and costs proportional to usage.

**Vercel**  
Zero-config deployment for Next.js. Serverless functions handle the API routes, and the free tier is sufficient for a demo-scale project.

**What was deliberately left out:**  
A database would require a schema, migrations, and session management for no user-facing benefit at this stage. A queue would add operational complexity and a second service to deploy. Authentication would gate the demo behind a sign-up flow. All three were omitted to keep the project focused on the core problem: turning a paper into useful learning material.

---

## Folder structure

```
paper-lens/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        # Core API: PDF extraction + Gemini call
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Home page with input form
│   └── globals.css
│
├── components/                 # UI components
│   ├── ui/                     # shadcn/ui base components
│   ├── InputForm.tsx           # Upload / paste / URL input panel
│   ├── ResultView.tsx          # Renders the full analysis output
│   ├── FlashcardList.tsx       # Expandable flashcard deck
│   ├── ConceptList.tsx         # Key concepts display
│   ├── ProcessingStages.tsx    # Animated progress steps during API call
│   └── ...
│
├── hooks/                      # Custom React hooks
│   └── useAnalysis.ts          # Manages submission state and API call
│
├── lib/                        # Utility functions
│   ├── gemini.ts               # Gemini API client and prompt construction
│   ├── pdf.ts                  # pdf-parse wrapper
│   └── arxiv.ts                # arXiv URL fetcher and text extractor
│
├── stores/                     # Zustand state (UI state only)
│   └── analysisStore.ts
│
├── styles/                     # Additional CSS
│
├── types/                      # TypeScript type definitions
│   └── analysis.ts             # AnalysisResult and related types
│
├── public/
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Local setup

**Prerequisites:** Node.js 18 or later.

**1. Clone the repository**

```bash
git clone https://github.com/RajnandiniK58/paper-lens.git
cd paper-lens
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Gemini API key (see [Environment variables](#environment-variables) below).

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Getting a Gemini API key:**  
Go to [aistudio.google.com](https://aistudio.google.com), sign in with a Google account, and create an API key. The free tier is sufficient for development.

---

## Environment variables

**`.env.example`:**

```env
# Required
# Gemini API key from Google AI Studio (aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
```

Only one environment variable is required. There is no database connection string, no storage secret, and no third-party service token needed beyond the Gemini key.

On Vercel, add `GEMINI_API_KEY` under Project Settings → Environment Variables before deploying.

---

## API endpoints

### `POST /api/analyze`

Accepts paper content in one of three forms, extracts text if needed, sends it to Gemini, and returns structured analysis.

**Request body:**

```typescript
// PDF upload
{
  "type": "pdf",
  "content": "<base64-encoded PDF>"
}

// Plain text or abstract paste
{
  "type": "text",
  "content": "We propose a novel approach to..."
}

// arXiv URL
{
  "type": "url",
  "content": "https://arxiv.org/abs/2310.06825"
}
```

**Success response `200`:**

```json
{
  "summary": "This paper proposes a method for...",
  "difficulty": {
    "level": "Advanced",
    "reason": "Assumes familiarity with transformer architectures and measure theory."
  },
  "concepts": [
    {
      "term": "Attention mechanism",
      "definition": "A technique that lets a model focus on specific parts of the input when producing each output token."
    }
  ],
  "beginnerExplanation": "Imagine you're reading a book and highlighting the most important sentences...",
  "flashcards": [
    {
      "question": "What problem does the paper's method solve?",
      "answer": "It reduces the quadratic memory cost of standard attention to linear."
    }
  ],
  "relatedTopics": [
    "Transformer architectures",
    "Efficient attention mechanisms",
    "Language model scaling"
  ]
}
```

**Error response `400`:**

```json
{
  "error": "Could not extract text from the provided PDF."
}
```

**Error response `500`:**

```json
{
  "error": "Gemini API request failed."
}
```

**Notes:**

- There is no request authentication. Any client can call this endpoint.
- Response time depends on PDF size and Gemini latency, typically 10–30 seconds.
- The Vercel free tier has a 60-second serverless function timeout. Very long papers may approach this limit.

---

## AI prompt design

The core prompt is constructed in `lib/gemini.ts`. The extracted paper text is injected into a single structured prompt sent to Gemini.

**Design goals:**

- One API call returns all output fields. This keeps latency predictable and avoids partial results from sequencing failures.
- The model is instructed to return strict JSON. The response is parsed directly — no intermediate text cleanup.
- Each output field has an explicit instruction describing the target audience and expected length.

**Approximate prompt structure:**

```
You are analyzing an academic research paper. Extract and return the following
as a valid JSON object with no additional text, markdown, or explanation.

Paper text:
"""
{extracted_text}
"""

Return exactly this structure:
{
  "summary": "3-5 sentence plain-language summary of the paper's contribution...",
  "difficulty": {
    "level": "Beginner | Intermediate | Advanced",
    "reason": "One sentence explaining why..."
  },
  "concepts": [
    { "term": "...", "definition": "Plain English definition, 1-2 sentences..." }
  ],
  "beginnerExplanation": "Explain the paper's core idea as if to a curious person
                          with no domain expertise. Use analogies. 2-3 paragraphs.",
  "flashcards": [
    { "question": "...", "answer": "..." }
  ],
  "relatedTopics": ["topic1", "topic2", ...]
}

Rules:
- Return only valid JSON. No markdown fences. No preamble.
- If the text is too short or not a research paper, still return the structure
  with best-effort answers.
- Definitions should be accessible to a first-year undergraduate.
- Generate between 5 and 10 flashcards.
```

**Why this approach:**  
Prompting for the entire output in one JSON block is simpler and faster than running separate prompts for each section. The tradeoff is that one malformed field can break the entire parse — the API route includes a try/catch and returns a descriptive error rather than a partial result.

---

## Processing pipeline

From the user's perspective, the flow has three stages:

**1. Input and submission**  
The user selects an input method (upload, paste, or URL) and submits. The frontend sends a POST request to `/api/analyze`.

**2. Server-side extraction**  
Inside the API route:

- If the input is a PDF, `pdf-parse` runs synchronously and extracts the full text.
- If the input is an arXiv URL, the route fetches the page and extracts the abstract and body text.
- If the input is plain text, it is used directly.

The extracted text is then passed to the Gemini prompt.

**3. Gemini analysis**  
A single call to the Gemini API with the full extracted text and the structured prompt. The response is parsed from JSON and returned to the frontend.

**Total time:** Typically 10–30 seconds depending on paper length and Gemini response time. There is no batching, streaming, or background processing. The HTTP connection stays open for the duration.

---

## Frontend completion detection

The UI shows a sequence of "processing" steps (e.g., "Extracting text...", "Identifying concepts...", "Generating flashcards...") while the API request is in flight.

**How it actually works:**  
This is a timed animation, not real step-by-step progress signals. The frontend advances through the stage labels at fixed intervals using a `setInterval` while the `fetch` call to `/api/analyze` is pending. When the API response arrives, the animation stops and the result view renders.

The stages are defined in `components/ProcessingStages.tsx`. The timing is tuned to feel proportional to the typical response time without the animation completing before the actual response arrives.

**Why not real streaming:**  
Streaming Gemini's response incrementally would require the model to produce output in a strict field-by-field order, and the frontend would need to parse partial JSON — a meaningful implementation effort. For the current scope, the simulated stages provide a good enough experience while keeping the implementation straightforward.

---

## Known limitations

**PDF text extraction quality**  
`pdf-parse` works well for text-layer PDFs, which includes most arXiv papers. Scanned PDFs (image-based) will extract no text and return an error. PDFs with complex multi-column layouts or heavy figure placement may produce garbled text ordering.

**Vercel function timeout**  
Serverless functions on Vercel's free tier have a 60-second maximum execution time. Very long papers (50+ pages) may hit this limit before Gemini responds.

**No result persistence**  
Results are not saved. Navigating away from the result page loses the analysis. Re-running the same paper makes a full new API call.

**Gemini rate limits**  
The free tier of the Gemini API has per-minute and per-day quotas. If multiple users submit papers concurrently, requests may be rate-limited and return errors.

**arXiv URL support is limited**  
The URL fetcher extracts text from the arXiv abstract page. For papers with complex math-heavy content, the plain-text extraction loses LaTeX formatting, which can reduce the quality of Gemini's math-related explanations.

**No input size validation on the client**  
A very large PDF can be sent to the API before the server rejects or times out on it. A client-side file size warning would improve the experience.

**Prompt output is not validated beyond JSON parsing**  
If Gemini returns valid JSON with missing or malformed fields, the frontend may render empty sections rather than a clear error.

---

## What I'd improve with more time

**Streaming results**  
Return each analysis section as Gemini generates it rather than waiting for the full response. This would make the actual progress visible and dramatically reduce the perceived wait time.

**Result persistence**  
Store results in a database (e.g., Neon Postgres) keyed to a short ID so users can share or return to an analysis. No authentication required — just a shareable link.

**Proper arXiv PDF fetching**  
Instead of scraping the abstract page, resolve the arXiv ID to its PDF URL and process the actual paper, which contains the full text including methods and results sections.

**PDF size and type validation on the client**  
Reject files over a reasonable size limit before upload, and check the MIME type before sending to the API.

**Flashcard export**  
Allow downloading flashcards as a CSV or in Anki-compatible format.

**Prompt field-level error handling**  
If one section of the Gemini response fails to parse, return the sections that succeeded rather than failing the entire request.

**Better handling of scanned PDFs**  
Integrate an OCR step (e.g., via a dedicated API) to handle image-based PDFs. Currently these return no useful text.

**Rate limiting on the API route**  
Add a simple IP-based rate limit on `/api/analyze` to prevent the Gemini key from being exhausted by repeated requests.

---

## Tech stack summary

| Layer            | Technology               |
| ---------------- | ------------------------ |
| Framework        | Next.js (App Router)     |
| Language         | TypeScript               |
| Styling          | Tailwind CSS + shadcn/ui |
| PDF extraction   | pdf-parse                |
| AI model         | Google Gemini API        |
| State management | Zustand (UI state only)  |
| Deployment       | Vercel                   |

U can access it from:

**Live demo:** [paper-lens-gilt.vercel.app](https://paper-lens-gilt.vercel.app)  
**Repository:** [github.com/RajnandiniK58/paper-lens](https://github.com/RajnandiniK58/paper-lens)

**Outputs**

### Landing Page
Main homepage showing the AI-powered research assistant interface and supported input methods.

![Landing Page](/public/OUTPUT/Landing.png)

---

### Upload Workspace
Workspace where users can upload PDFs, paste abstracts, or provide arXiv links for analysis.

![Upload Workspace](/public/OUTPUT/Workspace.png)

---

### Analysis Results — Paper Difficulty & Core Insights
Shows the detected difficulty level, AI-generated overview, executive summary, and extracted research concepts from the uploaded paper.

![Results Page](/public/OUTPUT/Resultpage1.png)

---

### Analysis Results — Detailed Summary View
Displays the structured paper breakdown with problem statement, methodology explanation, and beginner-friendly interpretation of the research.

![Results Page](/public/OUTPUT/Resultpage2.png)

---

### Interactive Flashcards
Expandable flashcards designed for active recall and research paper revision.

![Flashcards](/public/OUTPUT/Flashcard.png)
