/* eslint no-console: "off" */

import dotenv from 'dotenv';
import PDLJS from 'peopledatalabs';



// dotenv.config({ path: '../.env.local' });
const PDLJSClient = new PDLJS({ apiKey: '491e0491a606e4dc3604086455359d0130733451fdc4ba35c9de97a05f06c7bc' });
export default PDLJSClient;
// Person APIs

// PDLJSClient.person.enrichment({ phone: '4155688415' }).then((data) => {
//     console.log(data);
//   }).catch((error) => {
//     console.log(error);
//   });

// PDLJSClient.person.identify({ phone: '4155688415' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// const bulkEnrichmentRecords = {
//   requests: [
//     { params: { profile: ['linkedin.com/in/seanthorne'] } },
//     { params: { profile: ['linkedin.com/in/randrewn'] } },
//   ],
// };

// PDLJSClient.person.bulk.enrichment(bulkEnrichmentRecords).then((data) => {
//   console.log(data.items);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.person.search.sql({
//   searchQuery: "SELECT * FROM person WHERE first_name = 'mattehew'  ;",
//   size:100
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.company.search.sql({
//   searchQuery: "SELECT * FROM company WHERE name = 'kellogg company' AND ticker = 'K' AND website = 'kelloggcompany.com'   ",
//   size: 10,
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.person.retrieve({ id: 'qEnOZ5Oh0poWnQ1luFBfVw_0000' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// const bulkRetrieveRecords = {
//   requests: [
//     { id: 'qEnOZ5Oh0poWnQ1luFBfVw_0000' },
//     { id: 'PzFD15NINdBWNULBBkwlig_0000' },
//   ],
// };

// PDLJSClient.person.bulk.retrieve(bulkRetrieveRecords).then((data) => {
//   console.log(data.items);
// }).catch((error) => {
//   console.log(error);
// });

// // Company APIs

// PDLJSClient.company.enrichment({ ticker: 'k', name:'kennedy wilson', street_address:'455 market street'  }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.company.search.elastic({
//   searchQuery: {
//     query: {
//       bool: {
//         must: [{ term: { website: 'peopledatalabs.com', } }],
//       },
      
//     },
//   },
//   size: 10,
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// // Supporting APIs

// PDLJSClient.autocomplete({
//   field: 'skill',
//   text: 'c++',
//   size: 10,
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.company.cleaner({ name: 'peopledatalabs' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.location.cleaner({ location: '455 Market Street, San Francisco, California 94105, US' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.school.cleaner({ name: 'university of oregon' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.jobTitle({ jobTitle: 'software engineer' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.skill({ skill: 'c++' }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// // Sandbox APIs

// PDLJSClient.person.enrichment({ email: 'irussell@example.org', sandbox: true }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.person.search.sql({
//   searchQuery: "SELECT * FROM person WHERE location_country='mexico';",
//   size: 10,
//   sandbox: true,
// }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });

// PDLJSClient.person.identify({ company: 'walmart', sandbox: true }).then((data) => {
//   console.log(data);
// }).catch((error) => {
//   console.log(error);
// });
