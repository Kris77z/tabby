# Unified evidence and review replay

The current review entry joins the preserved public Monad records, local economic lifecycle and independent consumer, strategy feedback, role accounting/subsidy analysis, and [independent economic Worker recovery](INDEPENDENT-ECONOMY.md) alongside [bounded local decisions](BOUNDED-ECONOMY.md). Reports keep their original dates and environments; the viewer does not combine them into one production run.

## Run without business credentials

Use Node.js 22+ and install the lockfile dependencies with `npm ci --ignore-scripts` once:

```sh
npm run review:check
npm run --silent review:evidence -- --json
npm run review:replay
```

`review:replay` prints a random `http://127.0.0.1:PORT/` URL. Open it locally and stop the server with Ctrl+C. The page embeds the checked evidence; it has no wallet, model, RPC or execution endpoint. Search for a capability, filter its environment, choose a step, and inspect the original request/payment/task bindings. Earlier reports are hidden by default but remain available with the version toggle.

For a portable file, choose a new absolute path:

```sh
npm run review:replay -- --output /tmp/tabby-review.html
```

The file can be opened offline. Existing output files are rejected rather than replaced. Export time identifies when the page was assembled, not when the recorded business took place. Its content security policy denies network connections; displayed reproduction commands are inert text.

## What is checked

[The closed registry and validator](../scripts/review-evidence.mjs) select public-safe fields from specific checked-in reports. Each claim carries:

- Source path and SHA256, environment/model mode, historical revision and source fingerprints.
- Capability, original request/task/payment/transaction bindings, checked amounts and event sequence.
- Reproduction command, limitations and final/earlier/historical status.

The validator checks financial arithmetic, original-request and event relationships, no-new-payment recovery counters, strategy/accounting separation, runway assumptions and the bounded controller's decision/result sequence. It validates the original registered sources before building the projection. Altering a projected fact, amount, timeline or coordinated checksum is rejected by manifest validation against those sources. No CLI accepts arbitrary evidence files or private journal directories.

`npm run --silent review:evidence -- --schema` prints the machine-readable schema. `npm run evidence:check` retains its original historical scope. `review:check` now runs both validators, mutation tests, replay/launcher checks and bounded policy tests alongside the previous review checks.

## Interpretation

| Label | What it establishes |
| --- | --- |
| Public Monad history | Saved Testnet `10143` executions or explicitly labeled read-only snapshots; no fresh query or current-availability claim. |
| Local Anvil | Real isolated `31337` contracts and local execution with controlled model responses; no public vendor or production transaction. |
| Offline fixture | Synthetic records and declared assumptions; no network execution, even if a fixture internally contains chain-shaped fields. |
| Earlier version | Retained intermediate evidence, explicitly linked to its final report; not silently replaced. |

Historical source hashes can differ from current code. The manifest reports saved and current hashes separately; an old hash mismatch does not invalidate an honestly labeled historical run. A revision accompanied by `dirty=true` describes a base commit plus the listed source fingerprints, not a clean committed release.

Checksums and internally consistent evidence are not external attestations. This tool does not re-query receipts, authenticate vendor responses, verify invoices, prove third-party adoption or establish that post-submission work counts toward judging. [Oct 19 independent Worker acceptance](p0-independent-local-20261019.md) records the latest local execution; [Oct 18 bounded acceptance](p0-review-loop-local-20261018.md) remains separately preserved. Production contracts and historical records remain governed by the [deployment contract](../deploy/monad-vps/README.md).

## Fresh CI evidence bundles

[Independent Worker and recovery](INDEPENDENT-ECONOMY.md#ci-artifacts) adds `review:artifacts`: offline mode packages checked historical evidence; explicit local mode runs all local economic suites and exports separate fresh summaries and replays. Each bundle records check results, base revision and byte checksums. Failed suites remain failed, and raw journals/logs are never uploaded. `--verify` checks bundle completeness and byte integrity, not external provenance. The [Oct 19 acceptance](p0-independent-local-20261019.md) records local verification of this path.
