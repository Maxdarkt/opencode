# Contrat de phases pilote — DA30-006 → DA10-004

Version : `1` · statut : **stable pour Build DA10-004** · source : DA30-006 Sprint 3.

## Autorités et identité

| Donnée | Autorité | Le pilote fait |
| --- | --- | --- |
| `mtStatus` | MT Tasks | lit une observation explicite; ne la modifie pas |
| `apexPhase` | `STATE.md` APEX | lit une observation explicite; ne la modifie pas |
| binding/session/worktree/HEAD | runtime + Git | exige la concordance déjà garantie par `TaskBinding` |
| owner/effects | `TaskExecution` | les affiche; un effet `pending` bloque toute commande |

La clé de reprise est `mtTaskID`, `apexExternalRef`, `sessionID`, `worktree`, `HEAD`. Une nouvelle
commande n'alloue jamais de carte, de session, de worktree ou de propriétaire. La même observation
produit la même réponse; le pilote est donc idempotent et consultatif.

## Entrée v1

```ts
type ApexPhase = "analyze" | "plan" | "build" | "smoke" | "verify"
type MtStatus = "todo" | "in_progress" | "review" | "done" | "blocked"

type PilotInput = {
  mtStatus: MtStatus
  apexPhase?: ApexPhase
  context: "concordant" | "incomplete" | "divergent" | "resuming"
}
```

`context` reprend les valeurs UI existantes. Une phase est obligatoire hors `todo`; `resuming`
désigne un effet `TaskExecution` pending, jamais une phase APEX.

## Sortie v1

```ts
type PilotResult =
  | { kind: "next"; action: "start_analyze" | "write_plan" | "start_build" | "run_smoke" | "verify" | "request_review" | "parent_close" }
  | { kind: "blocked"; reason: "context_incomplete" | "context_divergent" | "execution_resuming" | "mt_blocked" | "invalid_status_phase" }
```

## Table de décision

| mtStatus | apexPhase | context | résultat |
| --- | --- | --- | --- |
| `todo` | absent | `concordant` | `next:start_analyze` |
| `in_progress` | `analyze` | `concordant` | `next:write_plan` |
| `in_progress` | `plan` | `concordant` | `next:start_build` |
| `in_progress` | `build` | `concordant` | `next:run_smoke` |
| `in_progress` | `smoke` | `concordant` | `next:verify` |
| `in_progress` | `verify` | `concordant` | `next:request_review` |
| `review` | `verify` | `concordant` | `next:parent_close` |
| `done` | `verify` | `concordant` | `next:parent_close` (information; aucune mutation enfant) |
| `blocked` | toute phase admise | toute valeur | `blocked:mt_blocked` |
| toute autre paire, phase absente hors `todo` | — | — | `blocked:invalid_status_phase` |
| toute paire | — | `incomplete` / `divergent` / `resuming` | blocage de contexte prioritaire |

Le frontend DA10-004 affiche phase et statut sur des libellés séparés, désactive une commande bloquée,
montre `reason`, et ouvre/reprend le chat/worktree existant avec l'identité de reprise. Il ne déduit
jamais `mtStatus` de `apexPhase`, et ne fait pas passer `review → done` : cette décision reste parent.

## Tests d'interopérabilité requis

1. Les sept parcours admis de la table donnent exactement l'action indiquée.
2. `in_progress + verify` et `review + verify` restent distincts.
3. `todo + plan`, `review + build`, `done + smoke` et une phase absente hors `todo` sont refusés.
4. `incomplete`, `divergent` et `resuming` masquent l'action même si la paire statut/phase est admise.
5. Deux évaluations de la même entrée sont égales et n'écrivent aucun binding/execution.
