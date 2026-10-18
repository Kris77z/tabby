import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildReviewEvidence, validateBoundedEconomyReport, validateReviewEvidenceManifest } from "../review-evidence.mjs";

const ECONOMIC = "docs/acceptance/economic-loop-20261017.json";
const ROLES = "docs/acceptance/p1-role-economic-loop-final-20261017.json";
const BOUNDED = "docs/acceptance/p0-bounded-economy-20261018.json";
const load = file => JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const scenario = (report, name) => {
  const value = report.scenarios.find(item => item.name === name);
  assert.ok(value, `fixture scenario ${name}`);
  return value;
};
const rejectReport = (file, mutate) => {
  const report = load(file); mutate(report);
  const overrides = { [file]: report };
  // Recompute the narrative checksum in memory so a semantic mutation must be
  // caught by report validation, not only by a now-stale documentation digest.
  const narrative = file === ROLES ? "docs/p1-role-local-20261017.md" : "docs/p0-local-20261017.md";
  const text = readFileSync(new URL(`../../${narrative}`, import.meta.url), "utf8");
  const sha = createHash("sha256").update(JSON.stringify(report)).digest("hex");
  overrides[narrative] = text.split("\n").map(line => line.includes(`](${file.replace(/^docs\//, "")})`) ? line.replace(/`[a-f0-9]{64}`/g, `\`${sha}\``) : line).join("\n");
  assert.throws(() => buildReviewEvidence({ overrides }));
};
const rejectManifest = mutate => {
  const manifest = buildReviewEvidence(); mutate(manifest);
  assert.throws(() => validateReviewEvidenceManifest(manifest));
};
const rejectBounded = mutate => {
  const report = load(BOUNDED); mutate(report);
  assert.throws(() => validateBoundedEconomyReport(report));
};
const canonical = value => value === null || typeof value !== "object" ? JSON.stringify(value)
  : Array.isArray(value) ? `[${value.map(canonical).join(",")}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
function rehashBoundedPolicy(report) {
  const digest = createHash("sha256").update(canonical(report.policy)).digest("hex");
  report.policySha256 = digest;
  report.shadow.decision.policyHash = digest;
  report.taskStateDriftProbe.decision.policyHash = digest;
  for (const round of report.rounds) { round.decision.policyHash = digest; round.nextChoice.policyHash = digest; }
  report.stop.decision.policyHash = digest;
  report.unknownRecovery.originalPolicySha256 = digest;
  const changedPolicy = { ...report.policy, id: "bounded-local-v2-recovery-probe", minProfitRaw: "1" };
  const changedDigest = createHash("sha256").update(canonical(changedPolicy)).digest("hex");
  report.unknownRecovery.changedPolicySha256 = changedDigest;
  report.unknownRecovery.changedPolicyDecision.policyHash = changedDigest;
}

test("audit: saved historical evidence is accepted with its recorded implementation and limited scope", () => {
  const result = buildReviewEvidence();
  validateReviewEvidenceManifest(result);
  assert.equal(result.scope.externalProvenanceVerified, false);
  assert.equal(result.scope.networkOperations, 0);
  assert.equal(result.scope.walletOperations, 0);
  assert.ok(result.sources.some(source => source.file === ECONOMIC));
  assert.ok(result.sources.some(source => source.file === ROLES));
  assert.ok(result.claims.length > 0);
  assert.ok(result.timeline.length > 0);
  // The existing report intentionally predates current implementation changes.
  // Acceptance means retained consistency; it never means a fresh source run.
  assert.equal(load(ECONOMIC).provenance.source.revision, "936f80d86072a4ae998a1a7fcc0d9bfb6e6dadf5");
});

test("audit: local controlled reports cannot be promoted to live public execution", () => {
  for (const mutate of [
    report => { report.provenance.chainId = "10143"; },
    report => { report.provenance.environment = "public-monad"; },
    report => { report.provenance.model = "real-kimi-k2.6"; },
    report => { report.scope.productionNetworkUsed = true; },
    report => { report.scope.publicVendorCalls = true; },
    report => { report.scope.autonomousPlannerExercised = true; },
  ]) rejectReport(ECONOMIC, mutate);
});

test("audit: failed or unclean reports cannot keep passed capability claims", () => {
  for (const mutate of [
    report => { report.status = "failed"; },
    report => { report.cleanup.ownedContainersRemoved = false; },
    report => { report.cleanup.ownedProcessesStopped = false; },
    report => { report.cleanup.failures.push("PRIVATE_TEMP_DIRECTORY_REMAINS"); },
    report => { report.provenance.source.harnessSha256 = "malformed"; },
  ]) rejectReport(ECONOMIC, mutate);
});

test("audit: raw accounting rejects decimal, overflow and mislabeled capital", () => {
  for (const mutate of [
    report => { scenario(report, "profitable-task-1").chargedRaw = "0.12"; },
    report => { scenario(report, "profitable-task-1").chargedRaw = (1n << 256n).toString(); },
    report => { report.initialFunding.ownerTopupsAfterProvisionRaw = "1"; },
    report => { scenario(report, "paid-hidden-test-failure").taskRevenueRaw = "200000"; },
  ]) rejectReport(ECONOMIC, mutate);
});

test("audit: admission reward retains the funded task and raw amounts use canonical units", () => {
  rejectReport(ECONOMIC, report => {
    const economics = scenario(report, "reject-loss-before-payment").economics;
    economics.rewardRaw = "-100000"; economics.netRevenueRaw = "-100000"; economics.netRewardRaw = "-232000";
  });
  rejectReport(ECONOMIC, report => { scenario(report, "profitable-task-1").chargedRaw = "0120000"; });
});

test("audit: creation, settlement and refund receipts retain their original task/payment", () => {
  for (const mutate of [
    report => { report.publishedTasks[0].creation.values.taskId = "99"; },
    report => { report.publishedTasks[0].creation.values.reward = "1"; },
    report => { scenario(report, "profitable-task-1").settlement.values.taskId = "99"; },
    report => { scenario(report, "profitable-task-1").payment.values.fromCash = "40001"; },
    report => { scenario(report, "original-unknown-full-refund").refund.values.paymentId = `0x${"1".repeat(64)}`; },
    report => { scenario(report, "original-unknown-full-refund").refund.values.toCash = "120001"; },
  ]) rejectReport(ECONOMIC, mutate);
});

test("audit: rejection and Unknown recovery cannot hide fresh payment or model effects", () => {
  for (const mutate of [
    report => { scenario(report, "reject-loss-before-payment").after.agentNonce++; },
    report => { scenario(report, "reject-loss-before-payment").after.modelCalls++; },
    report => { scenario(report, "unknown-original-request-recovery").afterRecovery.agentNonce++; },
    report => { scenario(report, "unknown-original-request-recovery").afterRecovery.modelCalls++; },
    report => { scenario(report, "unknown-original-request-recovery").pendingNetOperatingRaw = "0"; },
  ]) rejectReport(ECONOMIC, mutate);
});

test("audit: preview advice remains hypothetical and read APIs preserve state", () => {
  for (const mutate of [
    report => { report.strategyAdvice[0].advice.candidates[0].source = "local-chain-and-provider-quote"; },
    report => { report.strategyAdvice[0].advice.recommendation.status = "selected"; },
    report => { report.strategyAdvice[0].after.agentNonce++; },
    report => { report.strategyAdvice[0].after.modelCalls++; },
    report => { report.strategyAdvice[0].after.quoteCalls++; },
    report => { report.operatingReports[0].after.agentNonce++; },
  ]) rejectReport(ROLES, mutate);
});

test("audit: role contribution and hypothetical runway cannot become treasury or supplier profit", () => {
  for (const mutate of [
    report => { report.operatingReports[0].operating.agent.actualProfitRaw = "1"; },
    report => { report.operatingReports[0].operating.platform.treasuryReceiptsRaw = "13800"; },
    report => { report.operatingReports[0].operating.platform.creditFeeRecipient = "platform-treasury"; },
    report => { report.operatingReports[0].operating.suppliers.actualProfitRaw = "360000"; },
    report => { report.operatingReports[0].operating.consolidation.roleTotalsAdditive = true; },
    report => { report.operatingReports[0].operating.runway.source = "confirmed-lifetime"; },
    report => { report.operatingReports[2].operating.runway.horizonMs = "1"; },
  ]) rejectReport(ROLES, mutate);
});

test("audit: unknown report paths fail closed and private payload additions never enter the manifest", () => {
  assert.throws(() => buildReviewEvidence({ overrides: { "../../outside.json": {} } }));
  assert.throws(() => buildReviewEvidence({ overrides: { "/tmp/outside.json": {} } }));
  const report = load(ECONOMIC); report.privateResponse = "audit-private-model-content";
  const manifest = buildReviewEvidence({ overrides: { [ECONOMIC]: report } });
  assert.equal(JSON.stringify(manifest).includes("audit-private-model-content"), false);
  rejectManifest(manifest => { manifest.privateKey = "not-a-secret"; });
});

test("audit: a saved manifest cannot replace source identity, environment or event ownership", () => {
  rejectManifest(manifest => { manifest.scope.networkOperations = 1; });
  rejectManifest(manifest => { manifest.sources[0].sha256 = "0".repeat(64); });
  rejectManifest(manifest => { manifest.claims[0].source.file = "docs/unregistered-report.json"; });
  rejectManifest(manifest => { manifest.claims[0].environment.chainId = "999"; });
  rejectManifest(manifest => { manifest.timeline[0].claimId = "foreign-claim"; });
  rejectManifest(manifest => { manifest.timeline[0].reportId = "foreign-report"; });
  rejectManifest(manifest => { manifest.claims[0].checkedFacts.auditTamper = true; });
  rejectManifest(manifest => {
    const source = manifest.sources[0]; source.sha256 = "0".repeat(64);
    for (const claim of manifest.claims.filter(claim => claim.reportId === source.reportId)) claim.source.sha256 = source.sha256;
  });
});

test("audit: retained bounded execution validates as local controlled evidence", () => {
  const report = load(BOUNDED);
  validateBoundedEconomyReport(report);
  assert.equal(report.provenance.chainId, "31337");
  assert.equal(report.mode, "execute-local");
  assert.equal(report.unknownRecovery.recoveryMode, "same-worker-new-executor-from-durable-intent");
});

test("audit: bounded report cannot disguise missing clocks or bypass task/start limits by recomputing hashes", () => {
  rejectBounded(report => { delete report.rounds[0].decisionAtMs; });
  rejectBounded(report => { report.rounds[0].decisionAtMs = Number.NaN; });
  rejectBounded(report => { report.policy.maxTasks = 1; rehashBoundedPolicy(report); });
  rejectBounded(report => { report.policy.maxTasks = 4.5; rehashBoundedPolicy(report); });
  rejectBounded(report => { report.policy.maxObservationAgeMs = 10_000.5; rehashBoundedPolicy(report); });
  rejectBounded(report => { report.policy.startedAtMs = Date.parse(report.completedAt) - 1; rehashBoundedPolicy(report); });
});

test("audit: bounded candidates retain funded task provenance and exact paid quote", () => {
  rejectBounded(report => { report.rounds[0].candidates[0].source = "owner-hypothetical"; });
  rejectBounded(report => { report.rounds[0].candidates[0].rewardRaw = "999999"; });
  rejectBounded(report => { report.shadow.candidates[0].deadlineMs += 60_000; });
  rejectBounded(report => { report.shadow.candidates[0].blockNumber = report.chain.latestBlock + 1; });
  rejectBounded(report => { report.rounds[0].execution.paymentId = `0x${"0".repeat(64)}`; });
  rejectBounded(report => { report.rounds[0].preflight.freshCandidateHash = "0".repeat(64); });
});

test("audit: bounded success and paid failure must change the next choice through actual history", () => {
  rejectBounded(report => { report.rounds[1].counterfactual.withoutSuccessSelectedTaskId = report.rounds[1].decision.selectedTaskId; });
  rejectBounded(report => { report.rounds[2].counterfactual.withoutFailureSelectedTaskId = report.rounds[2].decision.selectedTaskId; });
  rejectBounded(report => {
    const failed = report.rounds[2].actuals.history.entries.find(row => row.outcome === "failed");
    failed.realized.failureLossRaw = "0";
  });
});

test("audit: bounded shadow and actual task-drift rejection retain zero business side effects", () => {
  for (const field of ["agentNonce", "modelCalls", "paymentEvents"]) {
    rejectBounded(report => { report.shadow.after[field]++; });
    rejectBounded(report => { report.taskStateDriftProbe.after[field]++; });
  }
  rejectBounded(report => { report.taskStateDriftProbe.competingAcceptance.values.taskId = "999"; });
  rejectBounded(report => { report.taskStateDriftProbe.blockedCode = "RETRY_WITH_NEW_PAYMENT"; });
});

test("audit: bounded Unknown recovery preserves its original request, quote and observed recovery scope", () => {
  for (const mutate of [
    report => { report.unknownRecovery.originalRequestId = "00000000-0000-4000-8000-000000000001"; },
    report => { report.unknownRecovery.paymentId = `0x${"0".repeat(64)}`; },
    report => { report.unknownRecovery.after.agentNonce++; },
    report => { report.unknownRecovery.after.modelCalls++; },
    report => { report.unknownRecovery.quoteCallsAfterRecovery++; },
    report => { report.unknownRecovery.originalIntentSha256 = "0".repeat(64); },
    report => { report.unknownRecovery.recoveryTargetReconstructedFromDurableIntent = false; },
    report => { report.unknownRecovery.recoveryMode = "full-os-restart"; },
  ]) rejectBounded(mutate);
});
