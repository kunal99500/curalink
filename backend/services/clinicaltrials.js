const axios = require('axios');

async function fetchClinicalTrials(disease, query, maxResults = 50) {
  try {
    const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&query.term=${encodeURIComponent(query)}&filter.overallStatus=RECRUITING,ACTIVE_NOT_RECRUITING,COMPLETED&pageSize=${maxResults}&format=json`;
    const res = await axios.get(url, { timeout: 10000 });
    const studies = res.data.studies || [];

    return studies.map(study => {
      const proto = study.protocolSection;
      const id = proto?.identificationModule;
      const status = proto?.statusModule;
      const desc = proto?.descriptionModule;
      const eligibility = proto?.eligibilityModule;
      const contacts = proto?.contactsLocationsModule;

      const locations = (contacts?.locations || []).slice(0, 3).map(l =>
        [l.city, l.country].filter(Boolean).join(', ')
      );

      const contactList = (contacts?.centralContacts || []).slice(0, 1).map(c =>
        `${c.name || ''} ${c.phone || ''} ${c.email || ''}`.trim()
      );

      return {
        title: id?.briefTitle || 'No title',
        nctId: id?.nctId || '',
        status: status?.overallStatus || 'Unknown',
        phase: proto?.designModule?.phases?.join(', ') || 'Not specified',
        briefSummary: (desc?.briefSummary || 'No summary').slice(0, 400),
        eligibilityCriteria: (eligibility?.eligibilityCriteria || 'Not specified').slice(0, 300),
        minimumAge: eligibility?.minimumAge || 'Not specified',
        maximumAge: eligibility?.maximumAge || 'Not specified',
        locations: locations.length > 0 ? locations : ['Location not specified'],
        contact: contactList[0] || 'Contact not available',
        url: `https://clinicaltrials.gov/study/${id?.nctId || ''}`
      };
    }).filter(t => t.title !== 'No title');
  } catch (err) {
    console.error('ClinicalTrials error:', err.message);
    return [];
  }
}

module.exports = { fetchClinicalTrials };
