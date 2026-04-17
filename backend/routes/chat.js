const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const { fetchPubMed } = require('../services/pubmed');
const { fetchOpenAlex } = require('../services/openalex');
const { fetchClinicalTrials } = require('../services/clinicaltrials');
const { rankPublications, rankTrials } = require('../services/ranker');
const { generateResponse } = require('../services/ollama');

router.post('/session', async (req, res) => {
  try {
    const { patientName, disease, location, sessionId } = req.body;
    if (sessionId) {
      const existing = await Session.findOne({ sessionId });
      if (existing) return res.json({ sessionId: existing.sessionId, existing: true });
    }
    const newId = uuidv4();
    const session = new Session({ sessionId: newId, patientName, disease, location });
    await session.save();
    res.json({ sessionId: newId, existing: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message required' });

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const disease = session.disease || '';
    const expandedQuery = disease ? `${message} ${disease}` : message;

    const [pubmedRaw, openalexRaw, trialsRaw] = await Promise.all([
      fetchPubMed(expandedQuery, 80),
      fetchOpenAlex(expandedQuery, 80),
      fetchClinicalTrials(disease, message, 40)
    ]);

    const allPublications = [...pubmedRaw, ...openalexRaw];
    const rankedPublications = rankPublications(allPublications, message, disease);
    const rankedTrials = rankTrials(trialsRaw, message, disease);

    const pubContext = rankedPublications.slice(0, 5).map((p, i) =>
      `[Publication ${i + 1}] "${p.title}" (${p.year}, ${p.source})\nAbstract: ${p.abstract}`
    ).join('\n\n');

    const trialContext = rankedTrials.slice(0, 3).map((t, i) =>
      `[Trial ${i + 1}] "${t.title}" | Status: ${t.status} | Phase: ${t.phase}\nSummary: ${t.briefSummary}`
    ).join('\n\n');

    const prompt = `
Patient context:
- Name: ${session.patientName || 'Not provided'}
- Primary condition: ${session.disease || 'Not specified'}
- Location: ${session.location || 'Not specified'}

User question: "${message}"

Recent research publications:
${pubContext || 'No publications found.'}

Related clinical trials:
${trialContext || 'No clinical trials found.'}

Please provide a structured response with:
1. Condition Overview
2. Research Insights (cite publications by number)
3. Clinical Trials
4. Important Note (consult a healthcare professional)`;

    const history = session.messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
    const llmResponse = await generateResponse(prompt, history);

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: llmResponse });
    session.updatedAt = new Date();
    await session.save();

    res.json({
      response: llmResponse,
      publications: rankedPublications,
      trials: rankedTrials,
      stats: {
        pubmedFetched: pubmedRaw.length,
        openalexFetched: openalexRaw.length,
        trialsFetched: trialsRaw.length,
        afterRanking: rankedPublications.length
      }
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
