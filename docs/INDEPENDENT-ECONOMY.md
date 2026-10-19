# Independent economic Worker and process recovery

The [economic Worker example](../examples/economic-worker/README.md) connects an independently installed SDK consumer to signed publisher tasks, genuine HTTP 402 quotations, a frozen cash policy, verified settlement, and the next task choice. It runs on an owned local Anvil chain (`31337`) with controlled model responses and the existing Docker Arena. The production Monad instance is unchanged.

## Reproduce

Use Node.js 22, Foundry 1.8.1, Docker on a local Unix socket, and the pinned image:

```sh
npm ci --ignore-scripts
docker pull python:3.12-alpine@sha256:4c47124a8391cb7a9f571164147d154777cf012a4ece5f86097130d7a4478111
npm run economics:independent
npm run economics:independent -- --execute-local --report /tmp/tabby-independent-new.json
```

The first command after preparation is a shadow observation. Fixture setup publishes and funds local tasks; the shadow controller itself adds no acceptance, payment, model dispatch or settlement. Execution requires `--execute-local`. Reports use exclusive creation: choose a new absolute filename on every run. SDK dependencies must already be in the npm cache; no automatic online fallback is used by this acceptance.

The launcher installs the consumer outside the workspace, creates temporary configuration, keys and journals, then removes its owned processes, containers and directories. Publisher, Worker and verifier use separate keys. Task specifications carry publisher signatures and are admitted by a trusted verifier; the escrow does not enforce the specification hash on-chain.

## One operating history

The Worker observes funded task state and original provider quotes, checks reserve cash, minimum profit, per-payment limits, cumulative spending, task count and an absolute deadline, then persists the selected input and quote. It resumes that exact public SDK payment handle. It does not replace the provider's quote function with a fixture cache.

Successful settlements and paid failures enter the same durable history used by the next decision. Counterfactual decisions remove success or failure history, and reverse candidate order, to distinguish feedback from a scripted sequence. This is a deterministic admission policy; it does not establish a learned success probability, open-market demand or commercial profitability.

## Interrupt, recover, continue

The local acceptance kills the Worker process with `SIGKILL`, starts a different OS process, and compares original request, quote, signed-payment and policy fingerprints. Checkpoints cover signed payment before broadcast, payment committed while delivery acknowledgement is lost, settlement before history commit, and unresolved delivery. Recovery reconciles the original state before discovering more work.

Unknown blocks new purchases. The test's separately authorized provider refund and verifier task closure must resolve the original payment and task before the Worker can continue. A refund changes cash accounting but does not restore the cumulative gross spending allowance, restart the clock or create a new budget. The refund branch does not claim a successful hidden-test verdict or zero supplier cost.

Durable writes use temporary files, file sync, rename and directory sync. Exclusive ownership binds the wallet's authorization and original journal. Ambiguous lock ownership fails closed; recovery never deletes an unverified live writer's lock. These mechanisms protect cooperating consumers using the same local authority store, not a wallet owner who deliberately copies keys or erases state.

## CI artifacts

```sh
npm run review:artifacts -- --output /tmp/tabby-review-offline-new
npm run review:artifacts -- --execute-local --output /tmp/tabby-review-local-new
node scripts/review-artifacts.mjs --verify /tmp/tabby-review-local-new
```

Offline packaging runs `review:check` and exports the checked saved manifest plus a portable replay. Explicit local packaging runs economic lifecycle, publisher/Worker, bounded execution, independent shadow, and independent execution. Every successful fresh suite gets a public summary, checked manifest and standalone HTML replay. `index.json` records all check outcomes and base revision; `SHA256SUMS` binds file bytes. `--verify` checks bundle completeness, hashes and shapes; it does not authenticate external provenance or repeat execution.

The two GitHub jobs upload only their fixed artifact directories, even after a failed check, and retain them for 30 days. Raw logs, journals, keys, private model output and signed transactions are excluded. A failed suite gets a fixed diagnostic code rather than a fabricated passing observation; rerun its command locally to investigate. A timed-out or forcibly cancelled job may not finish a bundle.

See [the dated acceptance](p0-independent-local-20261019.md), [review replay](REVIEW-REPLAY.md), [controller](../examples/economic-worker/controller.mjs), [durable storage](../examples/economic-worker/durable.mjs), [policy](../examples/economic-worker/policy.mjs), and [artifact builder](../scripts/review-artifacts.mjs).
