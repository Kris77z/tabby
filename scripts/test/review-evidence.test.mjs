import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { buildReviewEvidence, EVIDENCE_REGISTRY, REVIEW_EVIDENCE_SCHEMA, validateReviewEvidenceManifest } from '../review-evidence.mjs';

const read = file => JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url)));
const economic = 'docs/acceptance/economic-loop-20261017.json';
const strategy = 'docs/acceptance/p1-strategy-offline-20261017.json';
const role = 'docs/acceptance/p1-role-offline-final-20261017.json';
function reject(file, mutate, reason) {
  const data = read(file); mutate(data);
  assert.throws(() => buildReviewEvidence({ overrides: { [file]: data } }), reason);
}

test('manifest deterministically covers public Monad, controlled chains, offline feedback and retained earlier reports', () => {
  const a = buildReviewEvidence(), b = buildReviewEvidence(); assert.deepEqual(a, b);
  assert.equal(a.sources.length, EVIDENCE_REGISTRY.length);
  assert.equal(a.claims.filter(c => c.source.file.startsWith('frontend/acceptance/')).length, 13);
  assert.deepEqual(new Set(a.sources.map(s => s.environment.kind)), new Set(['local-anvil', 'public-monad', 'offline-fixture']));
  const earlier = a.sources.filter(s => s.evidenceStatus === 'earlier'); assert.equal(earlier.length, 2);
  for (const s of earlier) assert.equal(a.sources.find(t => t.reportId === s.supersededBy).evidenceStatus, 'final');
  assert.equal(validateReviewEvidenceManifest(a), true);
  assert.equal(REVIEW_EVIDENCE_SCHEMA.$defs.claim.additionalProperties, false);
});

test('report checksum identifies actual bytes and historical implementation hashes remain separately comparable', () => {
  const m = buildReviewEvidence();
  for (const s of m.sources) {
    const bytes = readFileSync(new URL(`../../${s.file}`, import.meta.url));
    assert.equal(s.sha256, createHash('sha256').update(bytes).digest('hex'));
    assert.ok(s.implementation.semantics.includes('uncommitted'));
    for (const hash of s.implementation.sourceHashes) assert.equal(hash.matchesCurrent, hash.sha256 === hash.currentSha256);
  }
  const earlier = m.sources.find(s => s.reportId === 'p1-role-offline-earlier-20261017');
  assert.ok(earlier.implementation.sourceHashes.some(s => !s.matchesCurrent), 'an actual earlier implementation remains recorded without requiring current code equality');
});

test('local financial report checks conservation rather than headline predicates', () => {
  for (const [mutate, reason] of [
    [d => { d.scenarios[1].payment.values.fromCash = '40001'; }, /cash plus credit/],
    [d => { d.scenarios[2].settlement.values.toAgent = '186201'; }, /equal/],
    [d => { d.scenarios[3].fromCreditRaw = '1'; }, /equal/],
    [d => { d.scenarios[4].taskRevenueRaw = '200000'; }, /failed task/],
    [d => { d.accounting.totals.netOperatingRaw = '226200'; }, /operating result/],
    [d => { d.chain.providerPaidEventCount = 4; }, /payment event count/],
    [d => { d.accounting.entries[0].paymentId = d.accounting.entries[1].paymentId; }, /payment ownership/],
  ]) reject(economic, mutate, reason);
});

test('scenario, predicate and published task references cannot be dropped or relabeled', () => {
  reject(economic, d => { d.scenarios.splice(4, 1); }, /scenario sequence/);
  reject(economic, d => { delete d.predicates.failedCostRetainedWithoutInventedIncome; }, /predicates/);
  reject(economic, d => { d.publishedTasks[1].creation.values.taskId = '6'; }, /creation ownership/);
  reject(economic, d => { d.provenance.environment = 'public Monad'; }, /environment/);
});

test('feedback arithmetic and route changes are checked independently of saved assertion names', () => {
  reject(strategy, d => { d.costDeviation.deviationRaw = '0'; }, /deviation arithmetic/);
  reject(strategy, d => { d.costDeviation.after.recommendation.providerId = 'route-a'; }, /equal/);
  reject(strategy, d => { d.paidFailure.after.candidates[0].requiredProfitRaw = '20000'; }, /failure loss/);
  reject(strategy, d => { d.minimumProfit.candidates[0].successfulCompletionProfitRaw = '10001'; }, /profit floor/);
});

test('role accounting keeps refunds, principal, grants, unknown invoice costs and missing-grant corrections separate', () => {
  reject(role, d => { d.contribution.agent.settlementOperatingRaw = '1185000'; }, /contribution arithmetic/);
  reject(role, d => { d.contribution.suppliers.netReceiptsRaw = '160000'; }, /refunds counted once/);
  reject(role, d => { d.operatorDeclarations.platform.subsidy.remainingBudgetRaw = '850000'; }, /distribution budget/);
  reject(role, d => { d.subsidyGrantsUnknown.scenario.subsidyBudgetRemainingRaw = '200000'; }, /missing grant evidence/);
  reject(role, d => { d.runway.finite.horizonMs = '604800001'; }, /horizon arithmetic/);
});

test('source and narrative references are fixed and cannot be rebound to arbitrary files', () => {
  reject(strategy, d => { d.sourceSha256['../../private-response.json'] = '1'.repeat(64); }, /unregistered implementation/);
  const doc = 'docs/p0-local-20261017.md';
  const content = readFileSync(new URL(`../../${doc}`, import.meta.url), 'utf8').replace('acceptance/economic-loop-20261017.json', 'acceptance/other.json');
  assert.throws(() => buildReviewEvidence({ overrides: { [doc]: content } }), /narrative must reference/);
  reject(economic, d => { d.provenance.source.revision = '0'.repeat(40); }, /base revision reference/);
});

test('CLI uses fixed inputs, prints no injected input paths, and exports a schema without evidence access', () => {
  const script = new URL('../review-evidence.mjs', import.meta.url);
  const invalid = spawnSync(process.execPath, [script.pathname, '--input=/tmp/private-response'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1); assert.equal(invalid.stderr.includes('/tmp/private-response'), false);
  const schema = spawnSync(process.execPath, [script.pathname, '--schema'], { encoding: 'utf8' });
  assert.equal(schema.status, 0); assert.equal(JSON.parse(schema.stdout).$id, REVIEW_EVIDENCE_SCHEMA.$id);
});
