const FALLBACK_MODELS = [
  {
    name: "GPT-4o",
    type: "closed",
    provider: "OpenAI",
    contextK: 128,
    mmlu: 88.7,
    gsm8k: 94.8,
    humaneval: 90.2,
    inputPerMillion: 5,
    outputPerMillion: 15,
    strengths: ["coding", "analysis", "chatbot", "long_context"],
  },
  {
    name: "GPT-4.1",
    type: "closed",
    provider: "OpenAI",
    contextK: 1000,
    mmlu: 90.1,
    gsm8k: 95.4,
    humaneval: 91.3,
    inputPerMillion: 10,
    outputPerMillion: 30,
    strengths: ["coding", "analysis", "long_context"],
  },
  {
    name: "Claude 3.5 Sonnet",
    type: "closed",
    provider: "Anthropic",
    contextK: 200,
    mmlu: 88.0,
    gsm8k: 92.3,
    humaneval: 88.5,
    inputPerMillion: 3,
    outputPerMillion: 15,
    strengths: ["analysis", "chatbot", "long_context"],
  },
  {
    name: "Gemini 1.5 Pro",
    type: "closed",
    provider: "Google",
    contextK: 1000,
    mmlu: 85.9,
    gsm8k: 90.0,
    humaneval: 84.3,
    inputPerMillion: 3.5,
    outputPerMillion: 10.5,
    strengths: ["long_context", "analysis", "chatbot"],
  },
  {
    name: "Llama 3.1 405B",
    type: "open",
    provider: "Meta",
    contextK: 128,
    mmlu: 86.4,
    gsm8k: 91.0,
    humaneval: 87.2,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["open_stack", "analysis", "coding"],
  },
  {
    name: "Llama 3.1 70B",
    type: "open",
    provider: "Meta",
    contextK: 128,
    mmlu: 82.0,
    gsm8k: 86.0,
    humaneval: 81.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["open_stack", "budget", "general"],
  },
  {
    name: "Qwen2.5 72B",
    type: "open",
    provider: "Alibaba",
    contextK: 128,
    mmlu: 85.0,
    gsm8k: 90.0,
    humaneval: 84.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["coding", "open_stack", "analysis"],
  },
  {
    name: "Mistral Large 2",
    type: "closed",
    provider: "Mistral",
    contextK: 128,
    mmlu: 84.0,
    gsm8k: 88.5,
    humaneval: 84.0,
    inputPerMillion: 2,
    outputPerMillion: 6,
    strengths: ["coding", "budget", "general"],
  },
  {
    name: "Mixtral 8x22B Instruct",
    type: "open",
    provider: "Mistral",
    contextK: 64,
    mmlu: 81.0,
    gsm8k: 85.0,
    humaneval: 79.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["budget", "open_stack", "general"],
  },
];

const useCases = {
  coding: { label: "Code generation and bug fixing", weights: [0.24, 0.2, 0.41, 0.15], key: "coding" },
  analysis: { label: "Reasoning and analytical tasks", weights: [0.35, 0.28, 0.2, 0.17], key: "analysis" },
  chatbot: { label: "Customer support chatbot", weights: [0.2, 0.2, 0.15, 0.45], key: "chatbot" },
  long_context: { label: "RAG and long-context document QA", weights: [0.24, 0.2, 0.15, 0.41], key: "long_context" },
  budget: { label: "Low-cost production workload", weights: [0.15, 0.15, 0.15, 0.55], key: "budget" },
};

const quizQuestions = [
  {
    id: "useCase",
    text: "What are you primarily building?",
    options: [
      { value: "coding", label: "Code generation, debugging, and developer copilots" },
      { value: "analysis", label: "Analytical reasoning and deep research workflows" },
      { value: "chatbot", label: "Customer-facing chatbot or assistant" },
      { value: "long_context", label: "RAG and long-document question answering" },
      { value: "budget", label: "Cost-optimized automation at scale" },
    ],
  },
  {
    id: "deployment",
    text: "Do you have a deployment preference?",
    options: [
      { value: "any", label: "No strict preference" },
      { value: "open", label: "Open-source/self-host preferred" },
      { value: "closed", label: "Managed API/closed-source preferred" },
    ],
  },
  {
    id: "privacy",
    text: "How strict are your data/privacy requirements?",
    options: [
      { value: "cloud_ok", label: "Cloud-hosted providers are acceptable" },
      { value: "private_required", label: "Private/self-hosted is required" },
    ],
  },
  {
    id: "context",
    text: "What minimum context window do you need?",
    options: [
      { value: 0, label: "No strong requirement" },
      { value: 32, label: "At least 32K tokens" },
      { value: 128, label: "At least 128K tokens" },
      { value: 1000, label: "1M+ context" },
    ],
  },
  {
    id: "budget",
    text: "What monthly budget range best matches your plan?",
    options: [
      { value: 50, label: "Starter (< $50/month)" },
      { value: 250, label: "Growth ($50-$250/month)" },
      { value: 1000, label: "Scale ($250-$1,000/month)" },
      { value: 5000, label: "Enterprise ($1,000+/month)" },
    ],
  },
  {
    id: "latency",
    text: "What matters more right now?",
    options: [
      { value: "fast", label: "Fastest responses and low latency" },
      { value: "balanced", label: "Balanced quality and cost" },
      { value: "best_quality", label: "Highest quality regardless of speed" },
    ],
  },
];

let models = [...FALLBACK_MODELS];
let currentQuestionIndex = 0;
const answers = {
  useCase: "coding",
  deployment: "any",
  privacy: "cloud_ok",
  context: 0,
  budget: 250,
  latency: "balanced",
};

const MODEL_FEED_URL = window.LLMFINDER_FEED_URL || "models.json";
const AUTO_REFRESH_MS = 15 * 60 * 1000;

function avgPrice(model) {
  return model.inputPerMillion + model.outputPerMillion;
}

function normalizedCost(model, budget) {
  if (model.type === "open") {
    return 1;
  }
  const ratio = avgPrice(model) / Math.max(budget, 1);
  return Math.max(0, 1 - ratio);
}

function latencyAdjustment(model, latencyPreference) {
  if (latencyPreference === "balanced") {
    return 0;
  }

  if (latencyPreference === "fast") {
    return model.type === "open" ? 0.02 : 0.04;
  }

  if (latencyPreference === "best_quality") {
    return model.humaneval > 88 ? 0.06 : 0;
  }

  return 0;
}

function modelScore(model, profile, budget, latencyPreference) {
  const [mmluW, gsmW, codeW, costW] = profile.weights;
  const benchmark =
    (model.mmlu / 100) * mmluW +
    (model.gsm8k / 100) * gsmW +
    (model.humaneval / 100) * codeW +
    normalizedCost(model, budget) * costW;

  const fitBonus = model.strengths.includes(profile.key) ? 0.1 : 0;
  const openBonus = model.type === "open" && model.strengths.includes("open_stack") ? 0.03 : 0;

  return benchmark + fitBonus + openBonus + latencyAdjustment(model, latencyPreference);
}

function setFeedStatus(message, tone = "neutral") {
  const status = document.getElementById("feedStatus");
  status.textContent = message;
  status.style.borderColor =
    tone === "ok" ? "#2e7d62" : tone === "warn" ? "#866e2a" : "var(--border)";
}

function setLastUpdated(timestampText) {
  document.getElementById("lastUpdated").textContent = `Last sync: ${timestampText}`;
}

async function loadModelsFromFeed({ silent = false } = {}) {
  if (!silent) {
    setFeedStatus("Model feed: syncing...");
  }

  try {
    const response = await fetch(`${MODEL_FEED_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Feed request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const incoming = Array.isArray(payload.models) ? payload.models : payload;
    if (!Array.isArray(incoming) || !incoming.length) {
      throw new Error("Feed returned no models");
    }

    models = incoming;
    renderTable();
    setFeedStatus(`Model feed: synced (${models.length} models)`, "ok");
    setLastUpdated(new Date().toLocaleString());
  } catch (error) {
    console.error(error);
    models = [...FALLBACK_MODELS];
    renderTable();
    setFeedStatus("Model feed: using fallback catalog", "warn");
    setLastUpdated(`fallback ${new Date().toLocaleTimeString()}`);
  }
}

function renderTable() {
  const tbody = document.getElementById("modelTable");
  tbody.innerHTML = "";

  models.forEach((model) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${model.name}</td>
      <td>${model.type}</td>
      <td>${model.provider}</td>
      <td>${model.contextK}K</td>
      <td>${model.mmlu}</td>
      <td>${model.gsm8k}</td>
      <td>${model.humaneval}</td>
      <td>${model.type === "open" ? "Self-hosted" : `$${avgPrice(model).toFixed(2)}`}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderQuestion() {
  const q = quizQuestions[currentQuestionIndex];
  const questionText = document.getElementById("questionText");
  const optionsWrap = document.getElementById("questionOptions");
  const progress = document.getElementById("quizProgress");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  questionText.textContent = q.text;
  progress.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;

  optionsWrap.innerHTML = "";
  q.options.forEach((option) => {
    const id = `${q.id}-${String(option.value).replace(/\s+/g, "-")}`;
    const selected = String(answers[q.id]) === String(option.value);

    const label = document.createElement("label");
    label.className = `option${selected ? " selected" : ""}`;
    label.setAttribute("for", id);

    label.innerHTML = `
      <input type="radio" name="${q.id}" id="${id}" value="${option.value}" ${selected ? "checked" : ""} />
      <span>${option.label}</span>
    `;

    label.querySelector("input").addEventListener("change", (event) => {
      const value = ["context", "budget"].includes(q.id) ? Number(event.target.value) : event.target.value;
      answers[q.id] = value;
      renderQuestion();
    });

    optionsWrap.appendChild(label);
  });

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? "Get recommendations" : "Next";
}

function explainFilters(profileLabel) {
  const reasons = [];
  reasons.push(`Use case profile: ${profileLabel}`);
  reasons.push(`Deployment preference: ${answers.deployment}`);
  reasons.push(`Privacy requirement: ${answers.privacy === "private_required" ? "private/self-hosted" : "cloud acceptable"}`);
  reasons.push(`Minimum context: ${answers.context}K`);
  reasons.push(`Budget anchor: $${answers.budget}/month`);
  reasons.push(`Latency goal: ${answers.latency}`);
  return reasons.join(" • ");
}

function recommendFromAnswers() {
  const profile = useCases[answers.useCase] || useCases.coding;

  const filtered = models.filter((model) => {
    const deploymentMatch = answers.deployment === "any" || model.type === answers.deployment;
    const contextMatch = model.contextK >= Number(answers.context || 0);
    const privacyMatch = answers.privacy !== "private_required" || model.type === "open";
    return deploymentMatch && contextMatch && privacyMatch;
  });

  const ranked = filtered
    .map((model) => ({
      model,
      score: modelScore(model, profile, Number(answers.budget || 0), answers.latency),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const panel = document.getElementById("recommendations");
  panel.innerHTML = `<h2>Your recommendations</h2><p class="muted">${explainFilters(profile.label)}</p>`;

  if (!ranked.length) {
    panel.innerHTML +=
      '<p class="muted">No models match all selected constraints. Try loosening deployment, context, or privacy requirements.</p>';
    return;
  }

  ranked.forEach((entry, index) => {
    const { model, score } = entry;
    const reason = model.strengths.includes(profile.key)
      ? `Strong fit for ${profile.label.toLowerCase()}`
      : `Strong benchmark and cost profile for ${profile.label.toLowerCase()}`;

    const card = document.createElement("article");
    card.className = "rec-card";
    card.innerHTML = `
      <h3>#${index + 1} ${model.name} <span class="score">${(score * 100).toFixed(1)} pts</span></h3>
      <p>${reason}.</p>
      <p class="muted">
        ${model.provider} • ${model.type === "open" ? "Open source" : "Closed source"} • Context ${model.contextK}K •
        ${model.type === "open" ? "Self-host (infra cost varies)" : `Estimated API cost $${avgPrice(model).toFixed(2)} / 1M tokens`}
      </p>
    `;
    panel.appendChild(card);
  });
}

function setupQuizActions() {
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex -= 1;
      renderQuestion();
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex += 1;
      renderQuestion();
      return;
    }

    recommendFromAnswers();
  });
}

function setupFeedRefresh() {
  document.getElementById("refreshModelsBtn").addEventListener("click", () => {
    loadModelsFromFeed();
  });

  setInterval(() => loadModelsFromFeed({ silent: true }), AUTO_REFRESH_MS);
}

renderQuestion();
setupQuizActions();
setupFeedRefresh();
loadModelsFromFeed();
