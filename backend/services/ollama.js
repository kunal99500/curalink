const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

console.log('GROQ_API_KEY present:', !!GROQ_API_KEY);

async function generateResponse(prompt, conversationHistory = []) {
  if (GROQ_API_KEY) {
    return await generateGroq(prompt, conversationHistory);
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

async function generateGroq(prompt, conversationHistory = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Curalink, an AI medical research assistant. Based on the research data provided, give a structured response with these exact sections:
1. Condition Overview
2. Research Insights (cite publications by number like [Publication 1])
3. Clinical Trials (if available)
4. Important Note (always recommend consulting a doctor)
Be concise, accurate, and empathetic.`
      },
      ...conversationHistory.slice(-4),
      { role: 'user', content: prompt }
    ];

    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 700,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return res.data?.choices?.[0]?.message?.content || 'Unable to generate response.';
  } catch (err) {
    console.error('Groq error:', err.response?.status, JSON.stringify(err.response?.data), err.message);
    throw new Error('LLM service unavailable.');
  }
}

module.exports = { generateResponse };
