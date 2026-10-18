# Bounded local economic decisions

This isolated demonstration connects funded task candidates and genuine loopback provider quotes to a deterministic decision, the existing payment/execution path, observed settlement or loss, and the next decision. It reuses the [strategy history](STRATEGY-ADVICE.md) and [accounting readers](ECONOMICS.md); it does not enable a new production execution policy.

## Reproduce

Use Node.js 22+, Foundry 1.8.1 and a local Docker Unix socket. Prepare the same pinned execution image as the [economic lifecycle](economic-loop-local.md):

```sh
docker pull python:3.12-alpine@sha256:4c47124a8391cb7a9f571164147d154777cf012a4ece5f86097130d7a4478111
npm run economics:bounded
npm run economics:bounded -- --execute-local
```

The default is **shadow**: create an owned local chain/fixture, read funded tasks and HTTP 402 quotes, and decide without business execution. Fixture deployment and funding happen before the measured shadow window and do send local transactions. Within that window, cash, wallet nonce, payment count and model calls must stay unchanged. Shadow requires Foundry/Docker just like execution; it is not the offline `review:check`.

`--execute-local` explicitly enables the controlled business run. An optional `--report /absolute/new-report.json` writes an exclusive new report; existing files are never overwritten. `npm run review:integration` runs the previous economic lifecycle and publisher/Worker consumer, then this explicit local run. Each suite owns and cleans up its temporary state, processes and containers.

## Decision boundaries

The policy is versioned, deeply frozen and hashed before a new payment. Its current parameters are:

| Limit | Value |
| --- | --- |
| Chain and routes | Owned Anvil `31337`, loopback services, one allowlisted provider |
| Task attempts | At most 4 |
| Cumulative service spend | `480000` raw = 0.48 mock USDC |
| One payment | At most `120000` raw = 0.12 mock USDC |
| Cash reserve | `120000` raw = 0.12 mock USDC after the contemplated cost |
| Minimum profit | At least `20000` raw and 10% of net task revenue, plus risk cushions |
| Cold start | `60000` raw extra cushion; quote capped at `120000` raw |
| Observation age / run deadline | 10 seconds / 240 seconds from worker start |

All currency amounts use six decimals. Credit and subsidy are not treated as available cash. Existing debt, unresolved history, an Unknown payment, expired quote/task, stale observation, insufficient reserve or exceeded limits prevents a new selection.

The controller reads every still-open task in a trusted catalog from the local escrow, including its reward, funded balance, status and deadline. It obtains a real local HTTP quote bound to the agent, task, route and request digest. It ranks eligible choices by surplus after quoted cost, worst observed positive cost deviation, minimum profit, maximum observed failed loss, and the explicit cold-start cushion. These conservative heuristics are not calibrated success probabilities.

Before execution, it reads candidates, finance and history again and revalidates the exact selected task and quote. A changed binding or a newly preferable choice rejects that execution; it does not silently purchase another task. Durable intent is saved before the existing executor may accept or pay. The test-only provider adapter preserves the first genuine quote for the same request so that discovery and the executor use the same payment binding.

## What the run demonstrates

Delivery responses are controlled to expose successful work, paid failure and uncertain dispatch. Selection is computed from observed candidate economics and history; it is not fed an ordered task list. The report includes reversed/rotated candidate checks and counterfactual decisions with success or failure history removed, demonstrating that both outcomes affect the next choice.

Successful tasks undergo real Docker public/hidden tests and independent local settlement. A failed task retains its service cost and has no task income. An Unknown dispatch stops new business; recovery reconstructs the original request from durable intent using a new executor, preserving payment/request bindings and signed-byte hashes without another charge or model call. This is **same-worker executor reconstruction**, not an OS-process restart test or a reusable production daemon.

The final report separates startup capital, realized task income, service charges and subsidy. Unknown remains unresolved; its pending accounting means full net operating result remains `null`, even when the cash balance is observable. No later successful row erases the failed or uncertain request.

## Scope and source

- [Pure decision and preflight policy](../scripts/lib/bounded-economy-policy.ts)
- [Local execution harness](../scripts/bounded-economy-local.ts)
- [Isolated launcher and cleanup](../scripts/check-bounded-economy.mjs)
- [Independent policy checks](../scripts/test/bounded-economy-audit.test.ts)
- [Fresh acceptance and report](p0-review-loop-local-20261018.md)

The run is cash-only with a trusted task catalog and one owned wallet writer. It does not test competing credit options, a permissionless market, LLM planning, commercial demand, real-vendor profitability, native-gas valuation, or concurrent production reserve enforcement. No production deployment, public-chain transaction, existing wallet or historical journal is changed.
