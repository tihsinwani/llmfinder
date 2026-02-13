const models = [
  {
    name: "GPT-4.1",
    type: "closed",
    provider: "OpenAI",
    contextK: 128,
    mmlu: 88.5,
    gsm8k: 94.0,
    humaneval: 92.1,
    inputPerMillion: 5,
    outputPerMillion: 15,
    strengths: ["coding", "agent", "general", "analysis"],
  },
  {
    name: "GPT-4o mini",
    type: "closed",
    provider: "OpenAI",
    contextK: 128,
    mmlu: 82.0,
    gsm8k: 87.0,
    humaneval: 86.0,
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
    strengths: ["chatbot", "budget", "general", "summarization"],
  },
  {
    name: "Claude 3.5 Sonnet",
    type: "closed",
    provider: "Anthropic",
    contextK: 200,
    mmlu: 88.0,
    gsm8k: 94.0,
    humaneval: 92.0,
    inputPerMillion: 3,
    outputPerMillion: 15,
    strengths: ["coding", "analysis", "long_context", "agent"],
  },
  {
    name: "Gemini 1.5 Pro",
    type: "closed",
    provider: "Google",
    contextK: 1000,
    mmlu: 85.9,
    gsm8k: 90.0,
    humaneval: 84.0,
    inputPerMillion: 1.25,
    outputPerMillion: 5,
    strengths: ["long_context", "analysis", "multimodal", "general"],
  },
  {
    name: "Llama 3.1 405B Instruct",
    type: "open",
    provider: "Meta",
    contextK: 128,
    mmlu: 86.0,
    gsm8k: 89.0,
    humaneval: 83.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["general", "open_stack", "analysis"],
  },
  {
    name: "Llama 3.1 70B Instruct",
    type: "open",
    provider: "Meta",
    contextK: 128,
    mmlu: 82.0,
    gsm8k: 84.0,
    humaneval: 81.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["budget", "open_stack", "chatbot"],
  },
  {
    name: "DeepSeek-V3",
    type: "open",
    provider: "DeepSeek",
    contextK: 128,
    mmlu: 88.0,
    gsm8k: 92.0,
    humaneval: 89.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["coding", "analysis", "budget", "open_stack"],
  },
  {
    name: "Qwen2.5-72B-Instruct",
    type: "open",
    provider: "Alibaba",
    contextK: 128,
    mmlu: 84.0,
    gsm8k: 88.0,
    humaneval: 84.0,
    inputPerMillion: 0,
    outputPerMillion: 0,
    strengths: ["coding", "multilingual", "open_stack"],
  },
  {
    name: "Mistral Large 2",
    type: "closed",
    provider: "Mistral",
    contextK: 128,
    mmlu: 84.0,
    gsm8k: 89.0,
    humaneval: 88.0,
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
  coding: { label: "Code generation and bug fixing", weights: [0.25, 0.2, 0.4, 0.15], key: "coding" },
  analysis: { label: "Reasoning and analytical tasks", weights: [0.35, 0.3, 0.2, 0.15], key: "analysis" },
  chatbot: { label: "Customer support chatbot", weights: [0.2, 0.2, 0.15, 0.45], key: "chatbot" },
  long_context: { label: "RAG and long-context document QA", weights: [0.25, 0.2, 0.15, 0.4], key: "long_context" },
  budget: { label: "Low-cost production workload", weights: [0.15, 0.15, 0.15, 0.55], key: "budget" },
};

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

function modelScore(model, profile, budget) {
  const [mmluW, gsmW, codeW, costW] = profile.weights;
  const benchmark =
    (model.mmlu / 100) * mmluW +
    (model.gsm8k / 100) * gsmW +
    (model.humaneval / 100) * codeW +
    normalizedCost(model, budget) * costW;

  const fitBonus = model.strengths.includes(profile.key) ? 0.1 : 0;
  const openBonus = model.type === "open" && model.strengths.includes("open_stack") ? 0.03 : 0;

  return benchmark + fitBonus + openBonus;
}

function populateUseCases() {
  const select = document.getElementById("useCase");
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
      <p class="muted">No models match your filters. Relax deployment or context requirements.</p>
    `;
    return;
  }

  panel.innerHTML = `<h2>Top recommendations</h2>`;

  ranked.forEach((entry, index) => {
    const { model, score } = entry;
    const reason = model.strengths.includes(profile.key)
      ? `Strong fit for ${profile.label.toLowerCase()}`
      : `Solid benchmark profile for ${profile.label.toLowerCase()}`;

    const card = document.createElement("article");
    card.className = "rec-card";
    card.innerHTML = `
      <h3>#${index + 1} ${model.name} <span class="score">${(score * 100).toFixed(1)} pts</span></h3>
      <p>${reason}.</p>
      <p class="muted">
        ${model.provider} · ${model.type === "open" ? "Open source" : "Closed source"} · Context ${model.contextK}K ·
        ${model.type === "open" ? "Self-host (infra cost varies)" : `Estimated API cost $${avgPrice(model).toFixed(2)} / 1M tokens`}
      </p>
    `;
    panel.appendChild(card);
  });
}

populateUseCases();
renderTable();
document.getElementById("recommendBtn").addEventListener("click", recommend);
