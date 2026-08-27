import { ENDPOINT_NAMES, ENDPOINTS, fillPath } from '../src/services/endpoints.js';
import { MOCK_NAMES, mockFor } from '../src/services/mocks.js';

const missing = ENDPOINT_NAMES.filter(n => !MOCK_NAMES.includes(n));
const orphan  = MOCK_NAMES.filter(n => !ENDPOINT_NAMES.includes(n));
console.log('endpoints:', ENDPOINT_NAMES.length, 'mocks:', MOCK_NAMES.length);
console.log('endpoints without a mock:', missing.length, missing);
console.log('mocks without an endpoint:', orphan.length, orphan);

// Every mock must return something without throwing, given plausible params.
const sample = { candidateId:'cnd_4a91', roleId:'rol_2c7f', runId:'run_5f2a', typeId:'fit',
  versionId:'v3', bulletId:'b3', jobId:'job_01', applicationId:'ap1', alertId:'al1',
  questionId:'q1', sessionId:'mck_31c8', topicId:'tt1', stepId:'rs1', certId:'cf1',
  pathId:'cp1', projectId:'pj1', reportId:'rp1', reviewId:'rv1', claimId:'cl1',
  templateId:'tpl_plain', letterId:'cv_1', integrationId:'in_github', keyId:'key_1',
  reqId:'r1', linkId:'pf1', itemId:'ac1', providerId:'in_github', storyId:'st1', contactId:'ct1', companyId:'wl1', findingId:'tf1', path:'identity.phone' };

let bad = 0, empty = 0;
for (const name of MOCK_NAMES) {
  try {
    fillPath(ENDPOINTS[name].path, sample);
    const out = mockFor(name, { params: sample, query: {}, body: {} });
    if (out === undefined || out === null) { console.log('EMPTY', name); empty++; }
  } catch (e) { console.log('THREW', name, '::', e.message); bad++; }
}
console.log('threw:', bad, 'empty:', empty);
