# Plan — DA20-002
Gate Plan autonome validée conformément au mandat, après Analyze.

B01 : contrat Schema et service Core (~250 lignes), inspection explicite sans initialisation. FSUtil realPath/stat, AppProcess Git lecture seule avec optional locks désactivés, timeout et sorties bornées. requested_directory/canonical_directory/session_directory + état de session/concordance, disponibilité, top-level/git-dir/common-dir, branche/HEAD/detached/unborn, base_ref/base_oid/status, dirty/conflits/review.
B02 : fixtures Core réelles ciblées : absent/non-directory/non-Git/symlink, clones, detached/unborn, base absente/non résolue/résolue, dirty/conflits ; préserver index/HEAD/refs. Tests au paquet Core et typecheck Schema/Core.
B03 : endpoint authentifié /global/context sans InstanceContext, Session.get optionnel et mapping absent ; assemblage service au graphe. SDK legacy généré par script prescrit ; client generate prescrit si nécessaire. Tests HTTP ciblés, checks opencode et SDK.
B04 : smoke technique, contrat consommateur DA10 et Pass B parent, dettes et handoff review. Pas de visuel enfant, commit/done/archive parent uniquement.

Environnement : Bun exact DA40, dépendances locales frozen/ignore-scripts ; aucun serveur existant touché. Tests routés in-process ; recette live à allouer par parent si nécessaire.

B03 subdivisé : B03a endpoint/assemblage (3 fichiers) ; B03b tests HTTP et adaptation de 2 harness globaux (3 fichiers), B03c génération SDK (artefacts générés exclusivement). Les harness globaux doivent fournir les deux nouveaux services stables.
