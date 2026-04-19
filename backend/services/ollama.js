const axios = require('axios');

const HF_TOKEN = process.env.HF_TOKEN;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function generateResponse(prompt, conversationHistory = []) {
  if (HF_TOKEN) {
    return await generateHuggingFace(prompt, conversationHistory);
  } else {
    return await generateOllama(prompt, conversationHistory);
  }
}

async function generateOllama(prompt, conversationHistory = []) {
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
      options: { temperature: 0.3, num_predict: 600 }
    }, { timeout: 120000 });

    return res.data.message?.content || 'Unable to generate response.';
  } catch (err) {
    console.error('Ollama error:', err.message);
    throw new Error('LLM service unavailable.');
  }
}

async function generateHuggingFace(prompt, conversationHistory = []) {
  try {
    const systemPrompt = `You are Curalink, an AI medical research assistant. Based on the provided research data, give structured responses with these sections:
1. Condition Overview
2. Research Insights (cite publications by number)
3. Clinical Trials
4. Important Note (always recommend consulting a doctor)
Be concise, accurate, and empathetic.`;

    const history = conversationHistory.slice(-4).map(m =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\n${history ? history + '\n' : ''}User: ${prompt}\nAssistant:`;

    const res = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.3,
          return_full_text: false,
          stop: ['User:', '\nUser']
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
    throw new Error('LLM service unavailable.');
  }
}

module.exports = { generateResponse };
