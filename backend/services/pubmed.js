const axios = require('axios');
const xml2js = require('xml2js');

async function fetchPubMed(query, maxResults = 80) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=pub+date&retmode=json`;
    const searchRes = await axios.get(searchUrl, { timeout: 10000 });
    const ids = searchRes.data.esearchresult.idlist;
    if (!ids || ids.length === 0) return [];

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
    const fetchRes = await axios.get(fetchUrl, { timeout: 15000 });

    const parser = new xml2js.Parser({ explicitArray: false });
    const parsed = await parser.parseStringPromise(fetchRes.data);
    const articles = parsed?.PubmedArticleSet?.PubmedArticle;
    if (!articles) return [];

    const list = Array.isArray(articles) ? articles : [articles];

    return list.map(article => {
      const medline = article.MedlineCitation;
      const articleData = medline?.Article;
      const pmid = medline?.PMID?._ || medline?.PMID || '';
      const title = articleData?.ArticleTitle?._ || articleData?.ArticleTitle || 'No title';
      const abstract = articleData?.Abstract?.AbstractText?._ || articleData?.Abstract?.AbstractText || 'No abstract available';
      const year = articleData?.Journal?.JournalIssue?.PubDate?.Year || 'Unknown';

      let authors = [];
      const authorList = articleData?.AuthorList?.Author;
      if (authorList) {
        const arr = Array.isArray(authorList) ? authorList : [authorList];
        authors = arr.slice(0, 3).map(a => `${a.LastName || ''} ${a.ForeName || ''}`.trim()).filter(Boolean);
      }

      return {
        title,
        abstract: typeof abstract === 'string' ? abstract.slice(0, 400) : 'No abstract',
        authors,
        year,
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        pmid
      };
    }).filter(a => a.title !== 'No title');
  } catch (err) {
    console.error('PubMed error:', err.message);
    return [];
  }
}

module.exports = { fetchPubMed };
