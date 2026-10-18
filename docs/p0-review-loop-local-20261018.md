# P0 unified review and bounded local economy acceptance — 2026-10-18

This round adds the [unified evidence/replay entry](REVIEW-REPLAY.md) and [bounded local economic controller](BOUNDED-ECONOMY.md). The main agent independently ran the frozen implementation after implementation and separate audit by GPT-6.1 sol ultra agents. No production deployment or public business execution was performed.

The recorded base revision is `b2369f0d2a3a09392281dc25914311388819b23d`. Both new reports record `dirty=true`; their explicit source fingerprints describe this uncommitted implementation. Calendar date here is Asia/Shanghai; report timestamps use UTC.

## Fresh reports

| Report | SHA256 | Observed scope |
| --- | --- | --- |
| [Bounded execution](acceptance/p0-bounded-economy-20261018.json) | `c6dc17cce051a78b3b833af34d46924667ce9f48dafe70d75bb7c42f3d8a6d0d` | Passed, isolated Anvil `31337`, controlled delivery responses, real Docker verification and settlement. |
| [Default shadow](acceptance/p0-bounded-shadow-20261018.json) | `c5a614deeab77f866a5ecd46795c0df85e6e2f76fc54055764387286e4c53580` | Passed, fixture funding excluded; no business execution within the measured window. |

Both launches stopped their owned processes, removed their owned containers, private temporary directory and IPC directory, with no cleanup failures. The reports contain public-safe bindings and hashes, not wallet keys, raw signed transactions, RPC endpoints or private model responses.

## Decision and result

The catalog contains real locally funded escrow tasks, plus a guard task used to observe competing acceptance. Task status, escrow balance, rewards, deadlines and HTTP 402 quote bindings are read before selection and again before execution. In the guard probe, another fixture Agent accepted the selected task; preflight rejected it while the executing Agent's nonce, cash, payment count and model calls stayed unchanged.

| Round | Selected task | Actual result | Cash after, raw |
| --- | --- | --- | --- |
| 1 | 4, balanced-brackets | Passed; 340000 task income | 820000 |
| 2 | 5, balanced-brackets | Failed hidden verification; 120000 service loss retained | 700000 |
| 3 | 1, sum-integers | Passed; 335000 task income | 915000 |
| 4 | 3, sum-integers | Paid dispatch Unknown; paused | 795000 |

All currency uses six-decimal mock USDC. Startup capital was 600000; settled task income was 675000; four service payments totaled 480000; owner top-ups and game subsidy were zero. Cash reconciles as `600000 + 675000 - 480000 = 795000`. Accounting is **partial**, and final net operating result remains **null**, because the last request is unresolved. The last complete accounting snapshot, before the Unknown payment, showed 315000 contribution.

The success observation changes round 2 from hypothetical task 1 to actual task 5 by removing the matching route's cold-start cushion. The paid failure changes round 3 from hypothetical task 2 to actual task 1 by adding the observed failure loss. Reversing or rotating the candidate order retains the same actual selection in every round.

Unknown stops new selection even under a changed policy. Recovery reads the original durable intent/completion, constructs a new executor in the same worker, and retains the original request, payment and signed-byte hashes. Cash, nonce, payment/model-call counts and recovery quote counts remain unchanged. This does not claim OS-process restart recovery or concurrent production guard enforcement.

Default shadow retains cash 40000, wallet nonce 3, zero payments and zero model calls, while producing fresh quote observations and `CASH_RESERVE`. Local fixture deployment/funding precedes those counters; shadow is not a transaction-free installation process.

## Verification and preservation

- `npm run review:check` passed: 42 guides / 782 local links, original saved-record checks, 33 historical evidence tests, 31 unified evidence/replay/launcher tests, root/frontend TypeScript, 140 selected policy/mechanism tests, and 11 standalone SDK tests plus its smoke consumer. The selected automated tests total 215.
- `npm run review:integration` passed all three suites: original economic lifecycle, independent publisher/Worker, and bounded execution. Each returned `status=passed` and successful owned-resource cleanup.
- The main agent separately ran both new report commands above, then independently inspected cash reconciliation, counterfactual choices, state-drift rejection, Unknown stop/recovery and source fingerprints.
- Browser verification covered the newest-default entry, Chinese search, environment filtering, earlier-version toggle, timeline step selection, the decision/counterfactual table, and responsive layout at 390 × 844. The page had no console errors/warnings and no document-wide horizontal overflow. The viewer serves only embedded evidence; reproduction commands are text.
- After final evidence-checker and viewer edits, the focused evidence/replay/launcher checks were rerun. Exported standalone HTML was checked against the same manifest and refused overwrite.
- All **550** pre-existing dated acceptance and deployment files matched their initial SHA256 values. The initial protected-file manifest had SHA256 `8707f9a81ec2b7c7b15ca7cad0e0ff52b2484c4a390a4c50ed67b117747cf3d4`. No SSH, deployment command, production wallet operation or history rewrite was performed.

The unified entry now contains **21 reports, 28 claims and 146 timeline events**. It retains two earlier reports separately; the viewer hides their four claims by default and therefore initially shows 24 claims. All 17 implementation source fingerprints in each new local report match the accepted source files. Existing historical fingerprints remain tied to their original versions.

Independent mutation checks found and drove fixes for malformed historical predictions, noncanonical/negative financial amounts, coordinated policy-hash changes that bypassed recorded limits or time windows, candidate deadlines/block references, altered recovery mode/intent digests, and drift-side-effect counters. The final checks reject these mutations against saved evidence. This is consistency validation, not cryptographic authentication of external facts.

These are new local records. The previous Oct 14–17 evidence, failures, paused work, production configuration and deployment history are not rewritten or promoted into fresh public execution. The deterministic cash-only controller uses a trusted catalog and controlled responses; it does not establish permissionless demand, LLM autonomous planning, real-vendor profitability, borrowing choices or native-gas valuation.
