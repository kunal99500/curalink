const axios = require('axios');

const HF_TOKEN = process.env.HF_TOKEN;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

console.log('HF_TOKEN present:', !!HF_TOKEN);
console.log('HF_TOKEN starts with:', HF_TOKEN ? HF_TOKEN.slice(0, 5) : 'MISSING');

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

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    console.log('Calling HuggingFace API...');

    const res = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages,
        max_tokens: 700,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('HF response status:', res.status);
    return res.data?.choices?.[0]?.message?.content || 'Unable to generate response.';
  } catch (err) {
    console.error('HuggingFace error:', err.response?.status, err.response?.data, err.message);
    throw new Error('LLM service unavailable. Check HF_TOKEN.');
  }
}

module.exports = { generateResponse };
