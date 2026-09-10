# Revue parent — DA10-002

Réception acceptée le 2026-09-06 dans la candidate unique `10-product-ui`.

## Contrôle des chemins

- 33 chemins produit uniques et présents : 18 UI, 15 DA20.
- Empreintes courantes égales à `evidence/candidate-sha256.json`.
- Les 15 chemins DA20 sont les seuls chemins staged avant réception et correspondent au commit source `2d973aeaf6a289ba1f343663a758d7c70b1bcc11`.
- Les modifications M0 et les projections globales ne font pas partie du commit de tâche.

## Vérifications parent

- UI : 41 tests, 0 échec, 1087 assertions ; parité i18n incluse ; typecheck vert.
- Core : 7 tests, 0 échec ; typecheck vert.
- HTTP/OpenAPI : 26 tests, 0 échec ; typecheck opencode vert.
- SDK : 1 test, 0 échec ; typecheck vert.
- Format : vert. Lint : 0 erreur ; avertissements hérités documentés.
- `git diff --check` et `git diff --cached --check` : verts.

## Smoke

Sur UI `4450` / API `4150`, le parent a ouvert explicitement la fixture `runtime/home`, constaté le bandeau de contexte, déplié requested/canonical/checkout/branche/HEAD et résolu explicitement `HEAD` vers l’OID attendu. Le dernier ajustement i18n déplace les mêmes textes vers un fallback anglais commun typé et passe le test de parité ; l’indisponibilité ultérieure de la surface CUA est conservée comme limite, sans transformer le smoke automatisé incomplet en succès.

Décision : candidate acceptée pour commit local exact et clôture DA10-002.
