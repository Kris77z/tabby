# Review Tabby

Tabby is Agent economic execution infrastructure on Monad: task-bound credit, paid inference, independent task settlement, identity/reputation, and durable recovery share the same request history. The hosted arena is its reference application for games, work and paid collaboration. The selected hackathon track is [Trust, Identity & AI](https://hackathon.monad.xyz/tracks/trust-identity-ai).

## Five-minute reading route

1. Read the [architecture's two economic paths](ARCHITECTURE.md#two-economic-paths): escrow tasks can earn income and repay credit; personal goals spend cash on model calls and external services.
2. Start with [unified evidence and read-only replay](REVIEW-REPLAY.md), then inspect the [Oct 17 business evidence table](VERIFICATION.md#latest-public-monad-execution--2026-10-17), then open a linked JSON summary. Follow its original request, cash/credit units, payment, task settlement and replay counters.
3. Follow one implementation: [SDK payment and recovery](../packages/sdk/README.md), [bounded autonomy](../packages/pi-loop/src/autonomy.ts), [external hiring](../services/hosted-agents/src/external/hiring.ts), or [settlement waterfall](../contracts/src/TaskEscrow.sol).
4. Run the checks below. For payment integration, use the [standalone SDK example](../examples/sdk-standalone/README.md); for the publishing and execution roles, use the [independent publisher and Worker example](../examples/publisher-worker/README.md).

The latest [bounded local controller](BOUNDED-ECONOMY.md) completes funded candidates → decision → execution → actual result → next decision, with a frozen cash policy and explicit local execution. The [Oct 18 acceptance](p0-review-loop-local-20261018.md) records fresh tests and preserved-history checks. It uses real isolated Anvil payments/Docker settlement and controlled delivery responses; it does not deploy an autonomous production trader.

For the next economic layer, inspect [task admission and operating accounts](ECONOMICS.md): new tasks must cover known execution, planning and borrowing costs; the accounting view separates settled task revenue from game subsidies and funding. These are repository improvements with controlled tests, separate from the dated public Monad runs above.

The [read-only strategy advice](STRATEGY-ADVICE.md) closes the next feedback step: original decision → actual cost or failure → next hypothetical choice. `npm run strategy:demo` shows cost deviations and failed losses changing the preferred route, with cash reserves and profit requirements. It leaves execution policy unchanged and does not claim live market availability or a measured success probability.

The [role operating report](OPERATING-REPORT.md) separates Agent contribution, attributable platform fees, supplier receipts, cash/token grants and optional operator-declared costs. `npm run operating:demo` reproduces the accounting and independently scoped cash/subsidy runway. The [role acceptance](p1-role-local-20261017.md) records the local checks; missing vendor invoices remain explicit gaps.

## Claim → implementation → evidence

| Review question | Implementation and checks | Evidence and boundary |
| --- | --- | --- |
| Does actual feedback change executed work? | [Decision and preflight policy](../scripts/lib/bounded-economy-policy.ts), [local execution](../scripts/bounded-economy-local.ts), [independent policy tests](../scripts/test/bounded-economy-audit.test.ts). | [Oct 18 execution report](acceptance/p0-bounded-economy-20261018.json): inspect `rounds[].candidates`, `decision`, `execution`, `actuals`, `counterfactual` and `nextChoice`. Actual task choices differ when success/failure history is removed. Cash-only deterministic controller; controlled model responses on local Anvil. |
| Do unsafe or stale choices stop before another payment? | [Preflight](../scripts/lib/bounded-economy-policy.ts), [isolated launcher](../scripts/check-bounded-economy.mjs). | The same report retains `taskStateDriftProbe`, `stop` and `unknownRecovery`. The [default shadow report](acceptance/p0-bounded-shadow-20261018.json) preserves its measured counters. Recovery reconstructs a new executor in the same worker; it is not an OS-process restart test. |
| Are receipts, capital and subsidy kept separate? | [Accounting](../services/hosted-agents/src/accounting.ts), [role reports](OPERATING-REPORT.md). | [Role acceptance](p1-role-local-20261017.md) covers Agent/platform/supplier contributions and separate runway assumptions. Oct 18 ends with 795000 cash after 600000 capital + 675000 revenue − 480000 charges; unresolved Unknown keeps final operating result `null`. |
| Can another process integrate? | [Standalone SDK](../examples/sdk-standalone/README.md), [publisher/Worker consumer](../examples/publisher-worker/README.md). | [Local consumer report](acceptance/publisher-worker-20261017.json) verifies independent installation and separate publisher/Worker/verifier roles. It does not demonstrate third-party adoption. |
| Can saved claims be independently checked? | [Fixed registry and projection](../scripts/review-evidence.mjs), [mutation tests](../scripts/test/review-evidence-audit.test.mjs), [read-only replay](REVIEW-REPLAY.md). | `npm run --silent review:evidence -- --json` returns source hashes, environments, bindings and checked facts. This verifies saved-record consistency; fresh local execution is `review:integration`, while public Monad evidence retains its original date. |

## Revision and evidence provenance

The Git history records successive additions: task admission/accounting, independent consumers, read-only feedback, role accounting, then bounded local execution. A commit establishes when code was published; its title alone does not establish a successful business run. Use the linked dated reports and their declared environment to assess execution claims.

The [Oct 18 acceptance](p0-review-loop-local-20261018.md) was generated before its publication commit: `provenance.source.revision` is the parent revision and `dirty=true` records that fact. Its explicit implementation hashes identify the code that ran. Committing those bytes does not rewrite the report's revision, timestamps, failed outcomes or hashes. The unified manifest separately compares saved source hashes with the current checkout. This publication updates repository code and review materials; the public production instance is unchanged.

## One command, no business credentials

With Node.js **22+** and npm, install the locked dependencies once, then run:

```sh
npm ci --ignore-scripts
npm run review:check
```

The review command checks local documentation links, saved evidence consistency, evidence-checker negative cases, root/frontend TypeScript, controlled mechanism, economic-decision and accounting tests, and a standalone SDK consumer outside the workspace. It needs no wallet, model key, Docker or Foundry. The mechanism tests inject model/RPC/execution dependencies and write temporary local journals. This is a selected offline check set, not a network sandbox or a complete security/integration test suite. The standalone consumer packs the SDK and installs its exact dependencies from the npm cache into a temporary directory, then checks public declarations and a controlled loopback example; it cleans up afterward. A cache miss fails with explicit preparation instructions, without an online fallback. Dependency installation downloads packages; the review steps make no external business calls and load no operator environment files.

For machine-readable evidence results:

```sh
npm run --silent review:evidence -- --json
npm run review:replay
```

The unified registry covers the original public/local records, newer economic, publisher/Worker, strategy and role reports, and the bounded local controller. Each capability has source/version bindings, checked facts, a timeline, reproduction commands and limitations. Early role reports stay labeled separately from final reports. The original `evidence:check` command remains available for its historical scope.

Each record identifies its source file/checksum, environment, original request and checked facts. The checker retains Oct 14 Anvil checks and adds eight Oct 17 summaries: both two-task credit loops, external hiring, budget downgrade, automatic USDC game/task, token supplement, settlement recovery, and a separately labeled read-only resource snapshot. It checks raw-unit arithmetic, model/usage and external-provider bindings, saved receipt references, original-request relationships and unchanged replay counters. Checksums identify the bytes inspected; they are not an external attestation. Saved canonical flags and private response/artifact digests are not independently verified.

## Dates, failures and deeper checks

With Foundry and Docker available, run the new local business checks:

```sh
npm run review:integration
```

This runs the [economic lifecycle](economic-loop-local.md) first, then the [external publisher/Worker example](../examples/publisher-worker/README.md). The [bounded controller](BOUNDED-ECONOMY.md) runs third with explicit local execution. Each creates a fresh local Anvil chain and temporary private state. Contract payments and settlements are real local transactions; model responses and registry identities are controlled. Docker evaluates the delivered code through the existing Arena and separate settler. These checks require the pinned Python image described in the linked guides; they do not use production wallets or public-chain/model credentials. The GitHub `local-economy` job runs this layer separately from `offline-review`.

The [Oct 17 P0 local acceptance](p0-local-20261017.md) links the main agent's fresh reports, exact financial results, failure/recovery checks and preserved-history baseline.

The [Oct 17 P1 acceptance](p1-strategy-local-20261017.md) adds reproducible decision feedback, authenticated read-only previews, and unchanged journal/nonce/model-call assertions against fresh local business results.

The publisher/Worker example demonstrates independent installation and separate roles. It is not evidence of another team's adoption. Publisher task specifications are signed off-chain and admitted by a trusted verifier; the existing escrow does not enforce the specification hash on-chain. Neither local check establishes commercial demand or real-vendor profitability.

The [original submitted overview](https://youtu.be/9Xxnqi52Kvo) remains available. The [Oct 15 video update record](video-update-20261015.md) states that locked submission fields were unchanged. Oct 15–17 business runs, videos and repository improvements are dated post-submission progress; this repository does not establish that organizers accepted them for scoring or backdate them into the original submission.

[Oct 15 results](monad-collaboration-live-20261015.md) retain the failed budget goal and task 18 default, including charges and explicit remediation. [Oct 17 results](monad-hackathon-live-20261017.md) retain verifier gas top-up, the same settlement transaction, and legacy Docker reevaluation. A later successful request does not erase either history. The Oct 17 credit loops are two explicit sequential requests, while the automatic case is a bounded parent that obtains game resources and runs a task.

For deeper verification, choose the appropriate [contribution checks](../CONTRIBUTING.md#set-up-and-choose-checks): Foundry contract tests; Anvil/Docker protocol integration; browser tests; or separately authorized real-model/Monad runs with fresh dated evidence. `review:check` does not execute those layers, re-query chain receipts, establish current public availability, audit custody/security, or verify supplier invoices. [Deployment and migration](../deploy/monad-vps/README.md) remain the operational contract.
