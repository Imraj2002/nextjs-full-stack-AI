# 🧠 AI-Powered Learning Pathway Generator

A full-stack Next.js application that empowers users to create highly structured learning pathways. Users can either generate comprehensive curriculums instantly using AI (via OpenRouter/Gemini) or manually build and organize their own modules, resources.

## ✨ Features

### 🤖 AI-Based Generation
- **Intelligent Curriculum Design:** Provide a learning goal (e.g., "Learn Quantum Computing"), and the AI will generate a complete, structured pathway.
- **Customizable Models:** Supports custom API keys and different LLM models via OpenRouter (defaults to free tier models if no key is provided).
- **Structured JSON Output:** Uses the Vercel AI SDK (`generateObject`) and Zod schemas to ensure the AI strictly outputs validated JSON containing modules, resources, and quizzes.

### ✍️ Manual Pathway Builder
- **Complete CRUD Operations:** Create, read, update, and delete pathways, modules, resources, and quizzes.
- **Rich Media & File Uploads:** Upload study materials (PDFs, images) directly to cloud storage using **Vercel Blob**.
- **Interactive UI:** Dynamic client-side components to easily reorder modules and edit content inline.

### 🛡️ Authentication & User Preferences
- **NextAuth Integration:** Custom Credentials authentication with MongoDB.
- **Custom API Keys:** Users can securely store their own OpenRouter API keys in their preferences to bypass global rate limits.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Database:** [MongoDB](https://www.mongodb.com/) (via native **Mongoose** integration)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Storage:** [@vercel/blob](https://vercel.com/docs/storage/vercel-blob)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/openai`, `generateObject`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Lucide React Icons

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
# Database
MONGODB_URI="your_mongodb_connection_string"

# Authentication
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="generate_a_random_secret_key"

# AI Integration
OPENROUTER_API_KEY="your_openrouter_api_key"
AI_MODEL="google/gemini-pro" # Optional default model

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

### 3. Run the Development Server
```bash
npm run dev
# The server will start on http://localhost:5000 (or 3000 depending on config)
```

---

## 🔄 Fallbacks & Error Handling

To ensure a smooth user experience, the system implements several fallback mechanisms:

1. **AI Generation Failures:** 
   - If the AI fails to generate a pathway or times out, the system catches the error and notifies the user. 
   - **Fallback:** Users are always encouraged to use the **Manual Builder** to create their pathway from scratch if the AI service is temporarily down.
2. **Missing AI API Keys:** 
   - If a user hasn't provided a custom API key, the system falls back to the globally configured `OPENROUTER_API_KEY` and a free model tier.
3. **Malformed AI Output:** 
   - The AI SDK strictly enforces output using a `zod` schema. If the AI deviates and outputs invalid JSON, the server rejects it before attempting to insert broken data into MongoDB.
4. **Data Integrity:** 
   - When updating or deleting deep nested documents (like a Quiz inside a Module inside a Pathway), the Mongoose API routes utilize robust `null` checking (`pathwayId?.userId`) to prevent `500 Internal Server Errors` if a parent document was manually deleted or orphaned.

---

## 💡 Use Cases

- **Self-Taught Developers:** Generate a step-by-step roadmap for learning new frameworks (like React or Rust).
- **Teachers & Educators:** Use the manual builder to design custom curriculums, attach PDF worksheets via Vercel Blob, and add knowledge-check quizzes for students.
- **Corporate Training:** HR teams can curate onboarding pathways for new hires, linking to internal documentation and compliance videos.
