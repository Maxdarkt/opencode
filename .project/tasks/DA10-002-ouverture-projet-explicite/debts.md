# Dettes et limites finales

- D1 medium, préexistant : pa-PK détecté en au lieu de pa sous Bun 1.3.14 ; reproduction isolée 7 pass/1 fail et deux sources égales HEAD (baseline-locale.json). Propriétaire parent/socle i18n, hors ouverture ; réouvrir avant qualification de cette locale/runtime.
- D2 faible, lint préexistant : warnings des fichiers existants picker/domain/layout/language ; logs finaux conservés. Aucune suppression de règle. Propriétaire UI, réouvrir dans entretien ciblé.
- D3 faible, traduction : textes du contexte fournis en source anglaise commune via bundle i18n typé, fallback explicite pour toutes locales. Pas de traduction FR/autres locale revendiquée ; propriétaire UI/localisation, réouvrir pour traduction revue selon AGENTS.
- D4 medium, runtime hors parcours : GET /provider renvoie 500 UnknownError sur API4150 isolée. Home/picker et global.context restent accessibles, aucun appel modèle effectué ; parent averti. Propriétaire socle/runtime, réouvrir avant recette provider/prompt.
- Limite de réception : smoke navigateur automatisé incomplet, parent a rapporté PASS visuel puis demandé arrêt de tout smoke et remise review. Changements finaux confirmation DA20 et bundle commun à recevoir par parent. Tests techniques/API distincts des preuves visuelles ; aucun lease, snapshot atomique ou parité OS.
