---
doc: scope
status: approved
---

# ClaimClock: Proposed Scope

## Problem
An independent builder can mistake registration or an attractive prize headline for a submission-ready cash opportunity. Deadlines, integration requirements, evidence and eligibility need to be considered together.

## Intended User
A solo builder preparing legitimate cash-prize entries. This is a hypothesis, not validated customer demand.

## One End-to-End Workflow
Enter an opportunity, its official source, absolute deadline/timezone and remaining requirements. The app flags non-cash or unknown rewards, blockers and deadlines; shows the next incomplete requirement; and exports a local readiness checklist. Nothing registers or submits automatically.

## Smallest Experiment
Single local page, manually entered opportunities, deterministic readiness checks and explicit source timestamps. Three synthetic examples: cash-ready, cash-blocked, and non-cash-excluded. No API scraping or AI inference claims.

## Proof of Success
Changing a required integration from unverified to verified removes that blocker but does not claim a submission. Expired deadlines cannot rank ready. Non-cash entries cannot join the cash-only shortlist. A platform receipt is required before an entry counts submitted. Exported state can be reimported without changing values. Tests cover those invariants.

## Not Included
Auto-submission, legal acceptance, accounts, credentials, wallets, spending, revenue predictions, fabricated eligibility, reward guarantees, cloud sync or integrations. Existing Opportunity Scout code will not be copied into this event's required fresh project.

## Scope Review
The user approved the displayed ClaimClock scope on October 6, 2026 with "confirmed". The proof of concept starts with manually entered opportunity checklists and local export/import, as described above. Product-level layout and interaction details will be clarified in the PRD step; scope approval is not publication or final competition-submission approval.
