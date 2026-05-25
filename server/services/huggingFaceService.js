const axios = require("axios");

/** Legacy host was decommissioned — use Inference Providers router (2025+). */
const HF_ROUTER_V1 =
  process.env.HF_ROUTER_URL || "https://router.huggingface.co/v1";
const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_URL || "https://router.huggingface.co/hf-inference";

const DEFAULT_MODEL =
  process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct-1M";
const FALLBACK_MODEL =
  process.env.HF_FALLBACK_MODEL || "google/gemma-2-2b-it";

function getApiKey() {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HF_API_KEY is not configured in server .env");
  }
  return apiKey;
}

/**
 * Append :fastest so the router picks an available inference provider.
 */
function formatModelId(model) {
  const m = String(model).trim();
  if (m.includes(":")) return m;
  return `${m}:fastest`;
}

function normalizeHfError(err) {
  const code = err.code || err.cause?.code;
  const status = err.response?.status;
  const body =
    typeof err.response?.data === "string"
      ? err.response.data
      : JSON.stringify(err.response?.data || {});

  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return new Error(
      "Cannot reach Hugging Face (DNS/network). Check internet connection and that HF_ROUTER_URL is https://router.huggingface.co/v1 — the old api-inference.huggingface.co endpoint no longer exists."
    );
  }
  if (status === 401 || status === 403) {
    return new Error(
      "Hugging Face token rejected. Create a token at huggingface.co/settings/tokens with 'Make calls to Inference Providers' permission."
    );
  }
  if (status === 410 || body.includes("no longer supported")) {
    return new Error(
      "Hugging Face legacy API is retired. Update server to use router.huggingface.co (pull latest huggingFaceService.js)."
    );
  }
  return new Error(
    err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Hugging Face request failed"
  );
}

function extractGeneratedText(data) {
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data?.generated_text) {
    return data.generated_text;
  }
  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  if (typeof data === "string") {
    return data;
  }
  return null;
}

/**
 * OpenAI-compatible chat completions (recommended for instruct models).
 */
async function generateViaChatCompletions(prompt, model, options = {}) {
  const apiKey = getApiKey();
  const modelId = formatModelId(model);

  const response = await axios.post(
    `${HF_ROUTER_V1}/chat/completions`,
    {
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.max_new_tokens ?? 3000,
      temperature: options.temperature ?? 0.6,
      top_p: 0.92,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: options.timeout ?? 120000,
    }
  );

  const text = extractGeneratedText(response.data);
  if (!text) {
    throw new Error("Unexpected chat completion response from Hugging Face");
  }
  return text;
}

/**
 * Text-generation task on hf-inference router (fallback for non-chat models).
 */
async function generateViaTextGeneration(prompt, model, options = {}) {
  const apiKey = getApiKey();
  const url = `${HF_INFERENCE_BASE}/models/${encodeURIComponent(model)}`;

  const response = await axios.post(
    url,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.max_new_tokens ?? 2048,
        temperature: options.temperature ?? 0.65,
        top_p: 0.92,
        return_full_text: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: options.timeout ?? 120000,
    }
  );

  const text = extractGeneratedText(response.data);
  if (!text) {
    throw new Error("Unexpected text-generation response from Hugging Face");
  }
  return text;
}

/**
 * Calls Hugging Face for text generation (router API).
 */
async function generateText(prompt, model = DEFAULT_MODEL, options = {}) {
  try {
    return await generateViaChatCompletions(prompt, model, options);
  } catch (chatError) {
    console.warn("HF chat completions failed:", chatError.message);
    try {
      return await generateViaTextGeneration(prompt, model, options);
    } catch (textError) {
      throw normalizeHfError(textError);
    }
  }
}

/**
 * Generate with primary model, retry with fallback model.
 */
async function generateWithFallback(prompt, options = {}) {
  const primary = process.env.HF_MODEL || DEFAULT_MODEL;
  const fallback = process.env.HF_FALLBACK_MODEL || FALLBACK_MODEL;

  try {
    const text = await generateText(prompt, primary, options);
    return { text, modelUsed: formatModelId(primary), source: "ai" };
  } catch (primaryError) {
    console.warn("HF primary model failed:", primaryError.message);
    try {
      const text = await generateText(prompt, fallback, {
        ...options,
        temperature: 0.65,
        max_new_tokens: 2048,
      });
      return { text, modelUsed: formatModelId(fallback), source: "ai" };
    } catch (fallbackError) {
      const normalized = normalizeHfError(fallbackError);
      throw normalized;
    }
  }
}

module.exports = {
  generateText,
  generateWithFallback,
  generateViaChatCompletions,
  DEFAULT_MODEL,
  HF_ROUTER_V1,
};
