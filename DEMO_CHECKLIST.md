# BatchBridge AI — Demo Checklist

## Before recording

- [ ] Start the app and sign into the Northstar Foods demo tenant.
- [ ] Confirm `ING-4502` returns 7 connected lot records, 4 finished-goods lots and 5 downstream partners.
- [ ] Confirm `FIN-8821-A` traces back upstream to `ING-4502`.
- [ ] Confirm sample data is visibly presented as fictional / simulated.
- [ ] If Vultr inference is enabled, run **Workspace settings → Test Vultr connection** and verify an investigation records provider `vultr`.
- [ ] If not enabled, state clearly that the local deterministic fallback is active.
- [ ] Reset demo data before recording if prior tests have changed statuses or acknowledgements. Delete the local demo database only when you are sure it contains no required data; first start reseeds it.

## Suggested 2-minute walkthrough

1. **Problem (15 sec):** A supplier flags a potentially contaminated ingredient. The manufacturer must identify every connected product and recipient.
2. **Incident (15 sec):** Open `BB-2026-001`; show the source lot and the uncertainty in the original alert.
3. **Agent workflow (25 sec):** Run investigation; show agent stages and the separation between database facts and model reasoning.
4. **Traceability (25 sec):** Show `ING-4502 → PRD-8821 / PRD-8822 → finished goods → five downstream partners`.
5. **Human control (20 sec):** Approve the internal hold action; approve notice preparation and show that it creates drafts, not automatic external messages.
6. **Recall effectiveness (15 sec):** Record a recipient acknowledgement and quantity response; run the mock recall drill.
7. **India + US (10 sec):** Show separate FSSAI and FDA operational profiles.
8. **Infrastructure (15 sec):** Show Vultr VM, environment-based inference configuration and README architecture.

## Do not claim

- That a legal recall decision is made autonomously.
- That email/SMS or public notices are actually sent.
- That the platform files notices with FSSAI or FDA.
- That stock is physically quarantined in a warehouse.
- That the readiness number is a regulatory compliance score.
- That demo partner or shipment data is real.
