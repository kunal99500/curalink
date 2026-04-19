const axios = require('axios');

const HF_TOKEN = process.env.HF_TOKEN;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function generateResponse(prompt, conversationHistory = []) {
  if (HF_TOKEN) {
    return await generateHuggingFace(prompt);
  } else {
    return await generateOllama(prompt, conversationHistory);
  }
}

async function generateOllama(prompt, conversationHistory = []) {
  try {
    const messages = [
      { role: 'system', content: 'You are Curalink, an AI medical research assistant. Give structured responses with: 1) Condition Overview 2) Research Insights 3) Clinical Trials 4) Important Note. Always recommend consulting a doctor.' },
      ...conversationHistory.slice(-4),
      { role: 'user', content: prompt }
    ];
    const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: 'phi3',
      messages,
      stream: false,
      options: { temperature: 0.3, num_predict: 600 }
    }, { timeout: 120000 });
    return res.data.message?.content || 'Unable to generate response.';
  } catch (err) {
    console.error('Ollama error:', err.message);
    throw new Error('LLM service unavailable.');
  }
}

async function generateHuggingFace(prompt) {
  try {
    const systemPrompt = `You are Curalink, an AI medical research assistant. Based on the research data provided, give a structured response with these exact sections:

1. Condition Overview
2. Research Insights (cite publications by number like [Publication 1])
3. Clinical Trials (if available)
4. Important Note (recommend consulting a doctor)

Be concise, accurate, and empathetic.`;

    const fullPrompt = `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`;

    const res = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      {
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 700,
          temperature: 0.3,
          return_full_text: false,
          stop: ['</s>', '[INST]']
        }
      },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 60000
      }
    );

    const text = res.data?.[0]?.generated_text || '';
    return text.trim() || 'Unable to generate response.';
  } catch (err) {
    console.error('HuggingFace error:', err.message);
    throw new Error('LLM service unavailable. Check HF_TOKEN.');
  }
}

module.exports = { generateResponse };
