const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function generateResponse(prompt, conversationHistory = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Curalink, an AI medical research assistant. Based on the provided research data, give structured responses with: 1) Condition Overview 2) Research Insights 3) Clinical Trials 4) Important Note. Always recommend consulting a doctor. Be concise and clear.`
      },
      ...conversationHistory.slice(-4),
      { role: 'user', content: prompt }
    ];

    const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: 'phi3',
      messages,
      stream: false,
      options: { temperature: 0.3, num_predict: 500 }
    }, { timeout: 120000 });

    return res.data.message?.content || 'Unable to generate response.';
  } catch (err) {
    console.error('Ollama error:', err.message);
    throw new Error('LLM service unavailable. Make sure Ollama is running with: ollama serve');
  }
}

module.exports = { generateResponse };
