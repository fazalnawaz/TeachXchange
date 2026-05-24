const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_MODEL = "google/flan-t5-large";
const FALLBACK_MODEL = "google/flan-t5-base";

/**
 * Calls Hugging Face Inference API for text generation.
 */
async function generateText(prompt, model = process.env.HF_MODEL || DEFAULT_MODEL) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HF_API_KEY is not configured in server .env");
  }

  const response = await axios.post(
    `${HF_API_URL}/${model}`,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 768,
        temperature: 0.8,
        return_full_text: false,
      },
      options: { wait_for_model: true },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 90000,
    }
  );

  const data = response.data;

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data?.generated_text) {
    return data.generated_text;
  }
  if (typeof data === "string") {
    return data;
  }

  throw new Error("Unexpected response format from Hugging Face API");
}

/**
 * Generate with primary model, retry with smaller model on failure.
 */
async function generateWithFallback(prompt) {
  const primary = process.env.HF_MODEL || DEFAULT_MODEL;

  try {
    const text = await generateText(prompt, primary);
    return { text, modelUsed: primary, source: "ai" };
  } catch (primaryError) {
    console.warn("HF primary model failed:", primaryError.message);
    try {
      const text = await generateText(prompt, FALLBACK_MODEL);
      return { text, modelUsed: FALLBACK_MODEL, source: "ai" };
    } catch (fallbackError) {
      throw new Error(
        `Hugging Face API unavailable: ${fallbackError.message}`
      );
    }
  }
}

module.exports = { generateText, generateWithFallback, DEFAULT_MODEL };
