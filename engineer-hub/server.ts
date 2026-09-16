import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/safe initialization of Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const MODEL_NAME = "gemini-3.8-flash";

// In-memory persistent state for digital classrooms and chats
interface MemoryClassroom {
  id: string;
  name: string;
  code: string;
  department: string;
  teacherName: string;
  membersCount: number;
  description: string;
  createdAt: string;
  announcements: Array<{
    id: string;
    authorName: string;
    authorRole?: string;
    title: string;
    content: string;
    timestamp: string;
    tag?: string;
  }>;
  resources: Array<{
    id: string;
    title: string;
    type: "pdf" | "doc" | "code" | "link";
    url: string;
    category: string;
    uploader: string;
    uploadedAt: string;
    size?: string;
  }>;
}

interface MemoryMessage {
  id: string;
  classroomId: string;
  userId: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  isAi: boolean;
  attachments?: Array<{
    type: "note" | "project" | "solution";
    id: string;
    title: string;
    snippet?: string;
  }>;
}

const classrooms: MemoryClassroom[] = [];

const messagesByClassroom: Record<string, MemoryMessage[]> = {};

// ==================== API ROUTES ====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(ai) });
});

// Classrooms
app.get("/api/classrooms", (req, res) => {
  res.json({ classrooms });
});

app.post("/api/classrooms", (req, res) => {
  const { name, code, department, teacherName, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: "Name and code are required." });
  }
  const newClassroom: MemoryClassroom = {
    id: `cls-${Date.now()}`,
    name,
    code: code.toUpperCase(),
    department: department || "General Engineering",
    teacherName: teacherName || "Faculty Instructor",
    membersCount: 1,
    description: description || "Collaborative engineering classroom",
    createdAt: new Date().toISOString().split("T")[0],
    announcements: [],
    resources: [],
  };
  classrooms.push(newClassroom);
  messagesByClassroom[newClassroom.id] = [];
  res.status(201).json({ classroom: newClassroom });
});

app.get("/api/classrooms/:id/messages", (req, res) => {
  const { id } = req.params;
  const list = messagesByClassroom[id] || [];
  res.json({ messages: list });
});

app.post("/api/classrooms/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { userId, userName, userRole, message, triggerAi, attachments } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  if (!messagesByClassroom[id]) {
    messagesByClassroom[id] = [];
  }

  const userMsg: MemoryMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    classroomId: id,
    userId: userId || "usr-current",
    userName: userName || "User",
    userRole: userRole || "user",
    message: message.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isAi: false,
    attachments,
  };

  messagesByClassroom[id].push(userMsg);

  // Check if message explicitly mentions AI or triggerAi is true
  const shouldRespondAi = triggerAi || /@ai|ask ai|ai:/i.test(message);

  let aiResponseMsg: MemoryMessage | null = null;

  if (shouldRespondAi) {
    try {
      const history = messagesByClassroom[id].slice(-12);
      const room = classrooms.find((c) => c.id === id);

      let aiText = "";

      if (ai) {
        const conversationText = history
          .map((m) => `${m.userName}: ${m.message}`)
          .join("\n");

        const prompt = `You are "Engineer AI", an intelligent, pragmatic engineering mentor in Engineer Hub ("${room?.name || "Engineering Hub"}").
Engineers are collaborating on technical problems and system designs.

Here is the recent group chat conversation history:
${conversationText}

The latest message is from ${userMsg.userName}:
"${userMsg.message}"

Please provide an insightful, concise, mathematically sound, and practical engineering response.
- Answer directly and factually.
- Take into account what was previously discussed in the room (e.g. if they refer to sensors, algorithms, or project decisions).
- Use clear bullet points or short code/formula snippets where helpful.
- Keep the tone collaborative, professional, and practical.`;

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
        });

        aiText = response.text?.trim() || "";
      }

      if (!aiText) {
        aiText = `Great engineering inquiry regarding "${userMsg.message.slice(0, 60)}...". When tackling this, evaluate the core trade-offs between hardware cost, latency, fault tolerance, and implementation complexity. You can also run this problem directly through the Problem Solver or convert it into a Smart Note for team review.`;
      }

      aiResponseMsg = {
        id: `msg-${Date.now() + 1}-ai`,
        classroomId: id,
        userId: "ai-assistant",
        userName: "Engineer AI",
        userRole: "assistant",
        message: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAi: true,
      };

      messagesByClassroom[id].push(aiResponseMsg);
    } catch (err) {
      console.error("AI classroom chat generation error:", err);
    }
  }

  res.json({
    userMessage: userMsg,
    aiMessage: aiResponseMsg,
    allMessages: messagesByClassroom[id],
  });
});

app.post("/api/classrooms/:id/announcements", (req, res) => {
  const { id } = req.params;
  const { title, content, authorName, authorRole, tag } = req.body;
  const classroom = classrooms.find((c) => c.id === id);
  if (!classroom) return res.status(404).json({ error: "Classroom not found" });

  const ann = {
    id: `ann-${Date.now()}`,
    title,
    content,
    authorName: authorName || "Faculty Instructor",
    authorRole: authorRole || "teacher",
    timestamp: "Just now",
    tag: tag || "Notice",
  };
  classroom.announcements.unshift(ann);
  res.status(201).json({ announcement: ann });
});

// ==================== AI ENDPOINTS ====================

// 1. Problem Solver AI
app.post("/api/ai/solve-problem", async (req, res) => {
  const { problem, domain } = req.body;

  if (!problem || !problem.trim()) {
    return res.status(400).json({ error: "Problem description is required." });
  }

  try {
    if (ai) {
      const prompt = `You are a Principal Engineering Problem Solver. Analyze this real-world engineering problem rigorously:
Domain: ${domain || "General Engineering"}
Problem Statement: "${problem.trim()}"

Provide an in-depth engineering breakdown in valid JSON format only (no markdown fencing, just raw JSON).
The JSON MUST follow this exact schema:
{
  "category": "e.g. Energy Management / Embedded Systems / Cybersecurity / Distributed Systems",
  "mainCause": "Core technical and systemic root cause",
  "impact": "Quantifiable or operational impact and wastage/risk",
  "usersAffected": "Stakeholders and users affected (e.g. Students, Faculty, Facility Operators)",
  "solutions": [
    {
      "name": "Solution 1 Name",
      "description": "Brief technical explanation of how this solution works",
      "cost": "Low" | "Medium" | "High",
      "complexity": "Low" | "Medium" | "High",
      "efficiency": "Low" | "Medium" | "High" | "Very High",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    },
    {
      "name": "Solution 2 Name",
      "description": "Technical explanation",
      "cost": "Low" | "Medium" | "High",
      "complexity": "Low" | "Medium" | "High",
      "efficiency": "Low" | "Medium" | "High" | "Very High",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    },
    {
      "name": "Solution 3 Name",
      "description": "Technical explanation",
      "cost": "Low" | "Medium" | "High",
      "complexity": "Low" | "Medium" | "High",
      "efficiency": "Low" | "Medium" | "High" | "Very High",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"]
    }
  ],
  "recommendedSolution": {
    "title": "Selected Best Solution Title",
    "rationale": "Comprehensive engineering justification balancing cost, reliability, maintenance, and ROI."
  },
  "implementationPlan": [
    "Step 1: Specific action with technology or sensor/code",
    "Step 2: Specific action",
    "Step 3: Specific action",
    "Step 4: Specific action",
    "Step 5: Specific action"
  ]
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text?.trim() || "{}";
      const parsed = JSON.parse(text);

      const result = {
        id: `solv-${Date.now()}`,
        originalProblem: problem.trim(),
        domain: domain || "General Engineering",
        ...parsed,
        timestamp: new Date().toISOString(),
      };

      return res.json(result);
    }
  } catch (err) {
    console.error("Gemini problem solve failed, using intelligent engineering fallback:", err);
  }

  // Intelligent fallback if API is not set or times out
  const fallback = {
    id: `solv-${Date.now()}`,
    originalProblem: problem.trim(),
    domain: domain || "Energy & Automation",
    category: "System Optimization & Automation",
    mainCause: "Lack of automated telemetry and reliance on manual human intervention",
    impact: "Unnecessary resource depletion, higher operational expenses, and lack of accountability",
    usersAffected: "Institution administration, facility maintenance, and campus community",
    solutions: [
      {
        name: "Scheduled Timer Relay",
        description: "Hardcoded scheduled cutoffs synchronized with class timetables.",
        cost: "Low",
        complexity: "Low",
        efficiency: "Medium",
        pros: ["Minimal setup cost", "No network dependence"],
        cons: ["Rigid schedule; fails during overtime or schedule changes"],
      },
      {
        name: "PIR Motion & Ultrasonic Sensors",
        description: "Ceiling-mounted motion detection with 10-minute idle hysteresis shutoff.",
        cost: "Medium",
        complexity: "Medium",
        efficiency: "High",
        pros: ["Direct responsiveness to room presence", "Standard off-the-shelf components"],
        cons: ["Requires calibrated placement to prevent blind spots"],
      },
      {
        name: "IoT Edge Mesh with Thermal Occupancy & Telemetry",
        description: "ESP32 microcontrollers with thermal array sensors reporting to a campus MQTT dashboard.",
        cost: "Medium",
        complexity: "High",
        efficiency: "Very High",
        pros: ["Real-time power monitoring", "Zero false-positives from stationary students", "Long-term analytics"],
        cons: ["Requires local WiFi/mesh networking and backend server"],
      },
    ],
    recommendedSolution: {
      title: "Occupancy-Based Edge Automation with Local Hysteresis Relay",
      rationale:
        "Provides the optimal balance between high energy efficiency and affordable bill-of-materials. Microcontroller-based sensors eliminate dependency on human habit while ensuring fail-safe power availability.",
    },
    implementationPlan: [
      "1. Audit room electrical conduits and quantify baseline idle kilowatt-hour draw.",
      "2. Bench-test dual-technology sensor array (PIR + Ultrasonic) with ESP32 edge node.",
      "3. Fabricate optically isolated relay module for safe 230V AC load switching.",
      "4. Implement fail-safe manual override switch to maintain safety standards.",
      "5. Connect nodes to campus dashboard via MQTT for reporting and anomaly detection.",
    ],
    timestamp: new Date().toISOString(),
  };

  res.json(fallback);
});

// 2. Engineering Idea Generator
app.post("/api/ai/generate-idea", async (req, res) => {
  const { domain, problem, constraints, difficulty } = req.body;

  try {
    if (ai) {
      const prompt = `You are an expert Engineering Capstone Project Advisor & Hackathon Mentor.
Generate an innovative, practical, and highly impressive Engineering Project Idea based on:
- Domain: ${domain || "Computer Science / IoT"}
- Problem: "${problem || "Need an innovative solution"}"
- Constraints: "${constraints || "Low cost, beginner friendly"}"
- Difficulty Preference: "${difficulty || "Intermediate"}"

Respond with ONLY a raw JSON object (no markdown, no formatting text):
{
  "title": "Creative, Catchy Engineering Project Title",
  "tagline": "A sharp, compelling 1-line elevator pitch",
  "problemStatement": "Clear definition of the core engineering problem",
  "innovation": "What makes this novel or superior to standard existing tools",
  "techStack": {
    "frontend": ["Tech 1", "Tech 2"],
    "backend": ["Tech 1", "Tech 2"],
    "hardware": ["Sensor/Board 1", "Component 2"],
    "database": ["DB Tech"],
    "apisAndTools": ["API 1", "Tool 2"]
  },
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTimeline": "e.g. 4-6 Weeks / 1 Semester Capstone",
  "keyFeatures": [
    "Feature 1: Description",
    "Feature 2: Description",
    "Feature 3: Description",
    "Feature 4: Description"
  ],
  "futureScope": "Future scalability, patent potential, or industrial adoption potential"
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        id: `proj-${Date.now()}`,
        domain: domain || "General Engineering",
        ...parsed,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Gemini idea generator failed:", err);
  }

  // Fallback
  res.json({
    id: `proj-${Date.now()}`,
    title: "Secure Student Credential Monitor & Zero-Trust Auth Sentinel",
    tagline: "Proactive leak detection, credential hygiene scoring, and decentralized student identity guard.",
    domain: domain || "Cybersecurity",
    problemStatement:
      problem || "Students frequently reuse weak passwords across multiple academic and public platforms, heightening credential stuffing vulnerabilities.",
    innovation:
      "Combines local k-Anonymity SHA-1 hash lookup against breach dumps with automated OAuth revocation warnings and gamified security hygiene ratings.",
    techStack: {
      frontend: ["React", "Tailwind CSS", "Lucide Icons"],
      backend: ["Node.js", "Express", "Crypto API"],
      hardware: ["YubiKey FIDO2 support (Optional)"],
      database: ["SQLite / PostgreSQL"],
      apisAndTools: ["HaveIBeenPwned k-Anonymity API", "NIST Password Validator"],
    },
    difficulty: difficulty || "Intermediate",
    estimatedTimeline: "4-6 Weeks",
    keyFeatures: [
      "Client-side zero-knowledge hash checking (passwords never leave device in plain text)",
      "Automated campus credential vulnerability index and risk visualization",
      "Real-time alerts when university domain emails surface in fresh threat feeds",
      "Actionable 1-click credential rotation recommendations and passkey generator",
    ],
    futureScope:
      "Enterprise integration with Active Directory/SAML SSO and hardware token verification for campus lab access.",
    timestamp: new Date().toISOString(),
  });
});

// 3. Problem -> Project Converter
app.post("/api/ai/problem-to-project", async (req, res) => {
  const { analysis } = req.body;

  if (!analysis) {
    return res.status(400).json({ error: "Problem analysis data is required." });
  }

  try {
    if (ai) {
      const prompt = `You are an engineering project director.
Convert this completed Engineering Problem Analysis directly into a production-ready Engineering Capstone Project:

Original Problem: ${analysis.originalProblem}
Category: ${analysis.category}
Main Cause: ${analysis.mainCause}
Impact: ${analysis.impact}
Recommended Solution: ${analysis.recommendedSolution?.title} (${analysis.recommendedSolution?.rationale})
Key Steps: ${JSON.stringify(analysis.implementationPlan || [])}

Create a project specification in JSON format only (raw JSON, no markdown):
{
  "title": "Comprehensive Engineering Project Title",
  "tagline": "Crisp 1-line engineering pitch",
  "domain": "${analysis.domain || analysis.category}",
  "problemStatement": "Synthesized problem statement",
  "innovation": "Innovative engineering edge derived from the recommended solution",
  "techStack": {
    "frontend": ["Tech 1", "Tech 2"],
    "backend": ["Tech 1", "Tech 2"],
    "hardware": ["Microcontroller/Sensors if applicable"],
    "database": ["DB system"],
    "apisAndTools": ["Tools & Frameworks"]
  },
  "difficulty": "Intermediate",
  "estimatedTimeline": "6-8 Weeks Capstone",
  "keyFeatures": [
    "Core feature 1 addressing root cause",
    "Core feature 2 implementing recommended solution",
    "Telemetry/Monitoring feature",
    "Analytics/Reporting feature"
  ],
  "futureScope": "Future commercial, campus, or Smart India Hackathon scope"
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        id: `proj-${Date.now()}`,
        sourceProblemId: analysis.id,
        ...parsed,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Gemini problem-to-project conversion error:", err);
  }

  // Fallback
  res.json({
    id: `proj-${Date.now()}`,
    sourceProblemId: analysis.id,
    title: `Smart ${analysis.category || "Engineering"} Automation & Monitoring System`,
    tagline: `Engineered implementation of: ${analysis.recommendedSolution?.title || "Optimized Solution"}`,
    domain: analysis.domain || "Applied Engineering",
    problemStatement: analysis.originalProblem || "Inefficient manual workflows causing resource depletion.",
    innovation: `Integrates automated telemetry and closed-loop control to eliminate ${analysis.mainCause || "manual inefficiency"}.`,
    techStack: {
      frontend: ["React", "Tailwind CSS", "Recharts"],
      backend: ["Node.js", "Express", "MQTT Protocol"],
      hardware: ["ESP32 DevKit", "Relay Matrix", "Sensor Subsystem"],
      database: ["TimescaleDB / SQLite"],
      apisAndTools: ["REST API", "Telemetry Dashboard"],
    },
    difficulty: "Intermediate",
    estimatedTimeline: "6 Weeks",
    keyFeatures: [
      "Autonomous real-time sensor polling and threshold evaluation",
      "Fail-safe load switching and manual override safeguard",
      "Audited energy/resource consumption analytics dashboard",
      "Predictive anomaly detection and automated maintenance alerts",
    ],
    futureScope: "Campus-wide distributed mesh deployment and integration with Smart City BMS standards.",
    timestamp: new Date().toISOString(),
  });
});

// 4. Smart Notes AI Tools (Explain, Summarize, Questions, Expand)
app.post("/api/ai/note-action", async (req, res) => {
  const { action, noteTitle, noteContent } = req.body;

  if (!noteContent || !action) {
    return res.status(400).json({ error: "action and noteContent are required." });
  }

  let promptInstruction = "";
  switch (action) {
    case "explain":
      promptInstruction = `Explain the following engineering note in simple, clear English using intuitive analogies, breaking down any complex formulas or jargon so any student can grasp the intuition immediately:`;
      break;
    case "summarize":
      promptInstruction = `Summarize the following engineering note into exactly 5 punchy, high-impact bullet points containing the most crucial technical takeaways:`;
      break;
    case "questions":
      promptInstruction = `Generate 5 high-yield engineering examination and technical interview viva questions based on this note, along with concise, accurate model answers for each:`;
      break;
    case "expand":
      promptInstruction = `Expand this engineering note with practical, real-world industry applications, circuit/software implementation blueprints, and common edge-case pitfalls engineers must avoid:`;
      break;
    default:
      promptInstruction = `Provide practical engineering feedback on this note:`;
  }

  try {
    if (ai) {
      const prompt = `${promptInstruction}

Note Title: "${noteTitle || "Engineering Notes"}"
Note Content:
"""
${noteContent}
"""

Format your response cleanly in readable Markdown with bold titles, bullet points, and code/math blocks where appropriate.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return res.json({ result: response.text?.trim() || "" });
    }
  } catch (err) {
    console.error("Gemini note action error:", err);
  }

  // Fallback responses
  let fallbackText = "";
  if (action === "explain") {
    fallbackText = `### 💡 Plain-English Explanation\n\nAt its core, **${noteTitle}** revolves around breaking down complexity into predictable, modular units. Think of it like a standardized assembly line: each component handles one well-defined responsibility with known input and output specs, preventing cascading system failures.`;
  } else if (action === "summarize") {
    fallbackText = `### 📌 5 Key Engineering Takeaways\n\n1. **Core Problem**: Addresses latency, resource wastage, and manual fragility in traditional systems.\n2. **Architecture**: Relies on decoupled components for higher fault isolation.\n3. **Trade-offs**: Balances initial hardware/implementation overhead against long-term operational savings.\n4. **Security & Safety**: Enforces fail-safe defaults whenever unexpected state transitions occur.\n5. **Verification**: Requires benchmarked telemetry data before production deployment.`;
  } else if (action === "questions") {
    fallbackText = `### ❓ Engineering Viva & Interview Questions\n\n**Q1: What are the primary bottlenecks in this design?**\n*Answer*: Memory overhead during peak traffic and state synchronization latencies.\n\n**Q2: How does the system handle power or network dropouts?**\n*Answer*: Through non-volatile EEPROM caching and local hysteresis fallback.\n\n**Q3: What metric best validates this implementation?**\n*Answer*: Mean Time Between Failures (MTBF) and net efficiency percentage gain.\n\n**Q4: Which communication protocol is optimal here?**\n*Answer*: Lightweight pub/sub like MQTT over TCP for minimal packet overhead.\n\n**Q5: How would you scale this to 100x users?**\n*Answer*: Implement distributed caching, horizontal edge workers, and read-replica databases.`;
  } else {
    fallbackText = `### 🚀 Real-World Practical Expansion\n\n- **Industrial Adoption**: Widely deployed in automotive CAN buses, SCADA microgrids, and cloud-native Kubernetes clusters.\n- **Implementation Pro-Tip**: Always add a watchdog timer in firmware and timeout guards on external API calls to prevent hanging threads.\n- **Testing Strategy**: Run boundary value tests and stress tests under simulated 150% maximum load.`;
  }

  res.json({ result: fallbackText });
});

// ==================== VITE MIDDLEWARE / SPA ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Engineer Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
