function rankPublications(publications, query, disease) {
  const keywords = `${query} ${disease}`.toLowerCase().split(/\s+/);
  const currentYear = new Date().getFullYear();

  const scored = publications.map(pub => {
    let score = 0;
    const text = `${pub.title} ${pub.abstract}`.toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw)) score += 3;
    }
    const titleLower = pub.title.toLowerCase();
    for (const kw of keywords) {
      if (titleLower.includes(kw)) score += 5;
    }
    const year = parseInt(pub.year) || 2000;
    score += Math.max(0, 10 - (currentYear - year));
    if (pub.citationCount) score += Math.min(10, Math.log10(pub.citationCount + 1) * 3);
    if (pub.abstract && pub.abstract !== 'No abstract available') score += 2;
    return { ...pub, score };
  });

  const seen = new Set();
  const deduped = scored.filter(pub => {
    const key = pub.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.sort((a, b) => b.score - a.score).slice(0, 7);
}

function rankTrials(trials, query, disease) {
  const keywords = `${query} ${disease}`.toLowerCase().split(/\s+/);

  const scored = trials.map(trial => {
    let score = 0;
    const text = `${trial.title} ${trial.briefSummary}`.toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw)) score += 3;
    }
    if (trial.status === 'RECRUITING') score += 10;
    else if (trial.status === 'ACTIVE_NOT_RECRUITING') score += 5;
    else if (trial.status === 'COMPLETED') score += 3;
    return { ...trial, score };
  });

  const seen = new Set();
  return scored.filter(t => {
    if (seen.has(t.nctId)) return false;
    seen.add(t.nctId);
    return true;
  }).sort((a, b) => b.score - a.score).slice(0, 5);
}

module.exports = { rankPublications, rankTrials };
