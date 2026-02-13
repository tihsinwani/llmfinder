const seedModels = [
  {
    name: "GPT-4.1",
    type: "closed",
    provider: "OpenAI",
    contextK: 128,
    mmlu: 88.5,
    gsm8k: 94,
    humaneval: 92.1,
    inputPerMillion: 5,
    outputPerMillion: 15,
    strengths: ["coding", "agent", "general", "analysis"],
    source: "seed",
  },
  {
    name: "Claude 3.5 Sonnet",
    type: "closed",
    provider: "Anthropic",
    contextK: 200,
    mmlu: 88,
    gsm8k: 94,
    humaneval: 92,
    inputPerMillion: 3,
    outputPerMillion: 15,
    strengths: ["coding", "analysis", "long_context", "agent"],
    source: "seed",
  },
  {
    name: "Gemini 1.5 Pro",
    type: "closed",
    provider: "Google",
    contextK: 1000,
    mmlu: 85.9,
    gsm8k: 90,
    humaneval: 84,
    inputPerMillion: 1.25,
    outputPerMillion: 5,
    strengths: ["long_context", "analysis", "multimodal", "general"],
    source: "seed",
  },
  {
    name: "DeepSeek-V3",
    type: "open",
    provider: "DeepSeek",
    contextK: 128,
    mmlu: 88,
    gsm8k: 92,
    humaneval: 89,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["coding", "analysis", "budget", "open_stack"],
    source: "seed",
  },
  {
    name: "Llama 3.1 70B Instruct",
    type: "open",
    provider: "Meta",
    contextK: 128,
    mmlu: 82,
    gsm8k: 84,
    humaneval: 81,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["budget", "open_stack", "chatbot"],
    source: "seed",
  },
];

const useCases = {
  coding: { label: "Code generation and bug fixing", weights: [0.25, 0.2, 0.4, 0.15], key: "coding" },
  analysis: { label: "Reasoning and analytical tasks", weights: [0.35, 0.3, 0.2, 0.15], key: "analysis" },
  chatbot: { label: "Customer support chatbot", weights: [0.2, 0.2, 0.15, 0.45], key: "chatbot" },
  long_context: { label: "RAG and long-context document QA", weights: [0.25, 0.2, 0.15, 0.4], key: "long_context" },
  budget: { label: "Low-cost production workload", weights: [0.15, 0.15, 0.15, 0.55], key: "budget" },
};

const questions = [
  {
    id: "useCase",
    prompt: "What is your primary use case?",
    options: [
      { label: "Coding assistant", value: "coding" },
      { label: "Research / analysis", value: "analysis" },
      { label: "Chat support bot", value: "chatbot" },
      { label: "Long-document QA / RAG", value: "long_context" },
      { label: "Low-cost general usage", value: "budget" },
    ],
  },
  {
    id: "deployment",
    prompt: "Which deployment style do you prefer?",
    options: [
      { label: "Any (open or closed)", value: "any" },
      { label: "Open source / self-host", value: "open" },
      { label: "Closed source APIs", value: "closed" },
    ],
  },
  {
    id: "contextRequirement",
    prompt: "Minimum context window needed?",
    options: [
      { label: "Any", value: "0" },
      { label: "32K", value: "32" },
      { label: "128K", value: "128" },
      { label: "1M+", value: "1000" },
    ],
  },
  {
    id: "budget",
    prompt: "What is your API budget per 1M tokens?",
    options: [
      { label: "<$2", value: "2" },
      { label: "$2-$8", value: "8" },
      { label: "$8-$20", value: "20" },
      { label: "$20+", value: "50" },
    ],
  },
];

let models = [...seedModels];
let currentQuestionIndex = 0;
const answers = {
  useCase: "coding",
  deployment: "any",
  contextRequirement: "0",
  budget: "8",
};

function avgPrice(model) {
  return (model.inputPerMillion || 0) + (model.outputPerMillion || 0);
}

function normalizedCost(model, budget) {
  if (model.type === "open") return 1;
  const ratio = avgPrice(model) / Math.max(budget, 1);
  return Math.max(0, 1 - ratio);
}

function modelScore(model, profile, budget) {
  const [mmluW, gsmW, codeW, costW] = profile.weights;
  const benchmark =
    (model.mmlu / 100) * mmluW +
    (model.gsm8k / 100) * gsmW +
    (model.humaneval / 100) * codeW +
    normalizedCost(model, budget) * costW;

  const fitBonus = model.strengths.includes(profile.key) ? 0.1 : 0;
  const openBonus = model.type === "open" && model.strengths.includes("open_stack") ? 0.03 : 0;
  const liveBonus = model.source === "live" ? 0.02 : 0;

  return benchmark + fitBonus + openBonus + liveBonus;
}

function inferStrengths(modelName) {
  const n = modelName.toLowerCase();
  const strengths = ["general"];
  if (/(code|coder|dev|program|instruct)/.test(n)) strengths.push("coding");
  if (/(chat|mini|flash)/.test(n)) strengths.push("chatbot", "budget");
  if (/(reason|think|sonnet|o1|r1)/.test(n)) strengths.push("analysis");
  if (/(long|1m|128k|200k|context)/.test(n)) strengths.push("long_context");
  if (/(llama|mistral|mixtral|qwen|deepseek)/.test(n)) strengths.push("open_stack");
  return [...new Set(strengths)];
}

function detectType(idText) {
  const s = (idText || "").toLowerCase();
  if (s.includes("meta-llama") || s.includes("mistralai") || s.includes("qwen") || s.includes("deepseek")) {
    return "open";
  }
  return "closed";
}

function providerFromId(idText) {
  const s = idText || "Unknown";
  return s.includes("/") ? s.split("/")[0] : "Unknown";
}

async function fetchLiveModels() {
  const syncStatus = document.getElementById("syncStatus");
  syncStatus.textContent = "Live model sync: refreshing from OpenRouter catalog...";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const data = Array.isArray(payload.data) ? payload.data : [];

    const liveModels = data.slice(0, 200).map((item) => {
      const context = Number(item.context_length || 0);
      const inPrice = Number(item.pricing?.prompt || 0) * 1_000_000;
      const outPrice = Number(item.pricing?.completion || 0) * 1_000_000;
      const modelName = item.name || item.id || "Unnamed model";

      return {
        name: modelName,
        type: detectType(item.id),
        provider: providerFromId(item.id),
        contextK: Math.max(1, Math.round(context / 1000)),
        mmlu: 75,
        gsm8k: 75,
        humaneval: 75,
        inputPerMillion: Number.isFinite(inPrice) ? inPrice : 0,
        outputPerMillion: Number.isFinite(outPrice) ? outPrice : 0,
        strengths: inferStrengths(modelName),
        source: "live",
      };
    });

    const byName = new Map(seedModels.map((m) => [m.name.toLowerCase(), m]));
    liveModels.forEach((m) => byName.set(m.name.toLowerCase(), m));
    models = [...byName.values()];

    syncStatus.textContent = `Live model sync: updated ${liveModels.length} models from OpenRouter.`;
    renderTable();
  } catch (error) {
    syncStatus.textContent = "Live model sync: failed (using built-in catalog).";
  }
}

function populateUseCases() {
  const select = document.getElementById("useCase");
  select.innerHTML = "";
  Object.entries(useCases).forEach(([value, cfg]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = cfg.label;
    select.appendChild(option);
  });
}

function renderTable() {
  const tbody = document.getElementById("modelTable");
  tbody.innerHTML = "";

  models
    .slice()
    .sort((a, b) => b.contextK - a.contextK)
    .forEach((model) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${model.name}</td>
      <td>${model.type}</td>
      <td>${model.provider}</td>
      <td>${model.contextK}K</td>
      <td>${model.mmlu.toFixed(1)}</td>
      <td>${model.gsm8k.toFixed(1)}</td>
      <td>${model.humaneval.toFixed(1)}</td>
      <td>${model.type === "open" ? "Self-hosted" : `$${avgPrice(model).toFixed(2)}`}</td>
      <td>${model.source}</td>
    `;
      tbody.appendChild(row);
    });
}

function syncAnswersToControls() {
  document.getElementById("useCase").value = answers.useCase;
  document.getElementById("deployment").value = answers.deployment;
  document.getElementById("contextRequirement").value = answers.contextRequirement;
  document.getElementById("budget").value = answers.budget;
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  const qaCard = document.getElementById("qaCard");

  qaCard.innerHTML = `
    <div class="qa-progress">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
    <h3>${question.prompt}</h3>
    <div class="option-list">
      ${question.options
        .map(
          (option) => `
          <label class="option-item">
            <input
              type="radio"
              name="${question.id}"
              value="${option.value}"
              ${answers[question.id] === option.value ? "checked" : ""}
            />
            <span>${option.label}</span>
          </label>
        `,
        )
        .join("")}
    </div>
  `;

  qaCard.querySelectorAll(`input[name="${question.id}"]`).forEach((input) => {
    input.addEventListener("change", (event) => {
      answers[question.id] = event.target.value;
      syncAnswersToControls();
    });
  });

  document.getElementById("prevQuestion").disabled = currentQuestionIndex === 0;
  document.getElementById("nextQuestion").disabled = currentQuestionIndex === questions.length - 1;
}

function recommend() {
  const deployment = document.getElementById("deployment").value;
  const minContext = Number(document.getElementById("contextRequirement").value);
  const budget = Number(document.getElementById("budget").value || 0);
  const useCase = document.getElementById("useCase").value;
  const profile = useCases[useCase];

  const filtered = models.filter((model) => {
    const deploymentMatch = deployment === "any" || model.type === deployment;
    const contextMatch = model.contextK >= minContext;
    return deploymentMatch && contextMatch;
  });

  const ranked = filtered
    .map((model) => ({ model, score: modelScore(model, profile, budget) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const panel = document.getElementById("recommendations");
  if (!ranked.length) {
    panel.innerHTML = `
      <h2>Top recommendations</h2>
      <p class="muted">No models match your filters. Try broader deployment/context requirements.</p>
    `;
    return;
  }

  panel.innerHTML = `<h2>Top recommendations</h2>`;
  ranked.forEach((entry, index) => {
    const { model, score } = entry;
    const reason = model.strengths.includes(profile.key)
      ? `Strong fit for ${profile.label.toLowerCase()}`
      : `Good fit based on available benchmarks and constraints`;

    const card = document.createElement("article");
    card.className = "rec-card";
    card.innerHTML = `
      <h3>#${index + 1} ${model.name} <span class="score">${(score * 100).toFixed(1)} pts</span></h3>
      <p>${reason}.</p>
      <p class="muted">
        ${model.provider} · ${model.type === "open" ? "Open source" : "Closed source"} · Context ${model.contextK}K ·
        ${model.type === "open" ? "Self-host (infra cost varies)" : `Estimated API cost $${avgPrice(model).toFixed(2)} / 1M tokens`} ·
        Catalog source: ${model.source}
      </p>
    `;
    panel.appendChild(card);
  });
}

function init() {
  populateUseCases();
  syncAnswersToControls();
  renderQuestion();
  renderTable();

  document.getElementById("recommendBtn").addEventListener("click", recommend);
  document.getElementById("refreshModels").addEventListener("click", fetchLiveModels);
  document.getElementById("finishQuestionnaire").addEventListener("click", recommend);

  document.getElementById("prevQuestion").addEventListener("click", () => {
    currentQuestionIndex = Math.max(0, currentQuestionIndex - 1);
    renderQuestion();
  });

  document.getElementById("nextQuestion").addEventListener("click", () => {
    currentQuestionIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
    renderQuestion();
  });

  fetchLiveModels();
}

init();
