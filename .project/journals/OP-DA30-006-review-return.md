# Journal — OP-DA30-006-review-return

- Target: MT card `DA30-006` in Sprint `415b28cf-2d9c-4162-9be7-f6502a453b8e`.
- Preconditions: MT reread `review`; parent validates the received STATE generation 11.
- Evidence: `validate-apex-state.mjs` rejects every prose Read-set evidence marker and two `../../journals/` paths escaping the task root.
- Intended effect: return only DA30-006 to `in_progress` for the bounded STATE correction; no code, Git, scope, or dependency change.
- Status: `pending observation`
- Resume: reread the exact card before any retry.
