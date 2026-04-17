const axios = require('axios');

async function fetchOpenAlex(query, maxResults = 80) {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${Math.min(maxResults, 100)}&page=1&sort=relevance_score:desc&filter=from_publication_date:2018-01-01`;
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Curalink/1.0 (mailto:curalink@example.com)' }
    });

    const results = res.data.results || [];

    return results.map(work => {
      const authors = (work.authorships || [])
        .slice(0, 3)
        .map(a => a.author?.display_name)
        .filter(Boolean);

      const abstract = work.abstract_inverted_index
        ? reconstructAbstract(work.abstract_inverted_index).slice(0, 400)
        : 'No abstract available';

      return {
        title: work.title || 'No title',
        abstract,
        authors,
        year: work.publication_year || 'Unknown',
        source: 'OpenAlex',
        url: work.primary_location?.landing_page_url || work.id || '',
        citationCount: work.cited_by_count || 0
      };
    }).filter(p => p.title !== 'No title');
  } catch (err) {
    console.error('OpenAlex error:', err.message);
    return [];
  }
}

function reconstructAbstract(invertedIndex) {
  const wordMap = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) wordMap[pos] = word;
  }
  return Object.keys(wordMap).sort((a, b) => a - b).map(k => wordMap[k]).join(' ');
}

module.exports = { fetchOpenAlex };
