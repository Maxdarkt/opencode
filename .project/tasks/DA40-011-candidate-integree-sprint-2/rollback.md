# Retour non destructif à la baseline

## Référence et principe

La baseline acceptée avant Sprint 2 est `9ba850b68b49bd20e2e40d24ceba39dd5fb19af2`. Le commit de
remise est enregistré dans `STATE.md`. Le retour ne modifie jamais la branche candidate existante
par reset/clean et ne supprime aucun worktree : elle reste la preuve récupérable du Sprint 2.

## Méthode recommandée : nouvelle candidate

1. Inventorier et préserver l'état Git, les projections dirty et les worktrees enregistrés.
2. Par la procédure projet autorisée, créer une nouvelle branche courte et un nouveau worktree
   depuis la baseline exacte.
3. Réappliquer uniquement les commits ou corrections explicitement acceptés, avec vérification du
   pathset et du tree après chaque étape.
4. Rejouer les gates de `verify.md` et produire un nouveau commit de candidate.
5. Ne promouvoir cette nouvelle candidate qu'après smoke et autorisation distincte du parent.

Cette méthode laisse `sprint2-integration` et son commit B6 intacts ; la récupération consiste donc
simplement à rouvrir le worktree original.

## Alternative : série de reverts explicites

Si le parent exige de conserver la branche, inventorier d'abord la plage
`9ba850b68b49bd20e2e40d24ceba39dd5fb19af2..<commit-B6-du-STATE>`, puis préparer sur une branche de
travail dédiée une série de `git revert` explicites dans l'ordre inverse. Vérifier le diff et les
conflits avant le commit de revert. Cette alternative nécessite une autorisation spécifique : elle
n'est ni exécutée ni implicitement autorisée par B6.

## Interdictions

Ne jamais utiliser `git reset --hard`, `git clean`, `git checkout -- .`, supprimer le worktree ou
écraser les projections locales pour revenir à la baseline.
