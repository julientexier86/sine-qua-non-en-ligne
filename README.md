# Sine qua non en ligne (beta 1)

Version **en ligne** du logiciel de traçage de courbes **Sine qua non**, pour que les enseignants puissent continuer à l'utiliser depuis un simple navigateur (Chromebook, Linux léger, postes sans logiciel installé).

➡️ **Utilisation** : ouvrir `sinequanon.html` dans un navigateur (Chrome, Firefox, Edge). Un seul fichier, aucune installation, fonctionne hors connexion.

## Hommage

Ce projet n'existerait pas sans **Sine qua non**, logiciel de **Patrice Rabiller** et **Patrick Pradeau**, qui accompagne depuis de nombreuses années des générations d'enseignants de mathématiques par la qualité de ses figures.

👉 Le logiciel d'origine, sa documentation et ses exemples : <http://patrice-rabiller.fr/SineQuaNon/menusqn.htm>

Cette réécriture **n'est pas un produit officiel** et n'est ni validée ni soutenue par les auteurs. Elle ne contient aucun code, fichier d'installation, exemple ni documentation du logiciel d'origine : l'interface (menus et barre d'icônes) en reprend l'organisation pour ne pas dérouter les utilisateurs, et le format de fichier `.sqn` est lu et écrit pour rester compatible. **Pour la version de référence, utilisez le logiciel des auteurs.**

## Fonctionnalités (beta 1)

- Ouverture et enregistrement des dessins `.sqn` de la version Windows (relecture identique sur les 34 exemples testés).
- Repère, grilles, fonctions, courbes paramétrées et polaires, droites, familles, points et segments, textes, expressions LaTeX, échelle logarithmique, rapporteur trigonométrique.
- Compléments : dérivée, primitive, courbe point par point, figures géométriques, statistiques à 1 et 2 variables, lois de probabilité, arbres, suites, intégrales, inéquations, courbes implicites (coniques), tableaux de signes et de variations, calculs (équations, table de valeurs, intégrale).
- Export PNG (300 ppp), SVG, impression / PDF à l'échelle réelle.

Les compléments sont propres à cette version : un dessin qui en contient s'enregistre en `.sqnw` ; le bouton « ⤓ .sqn » produit un fichier pour la version Windows (sans eux).

## Limites connues de la beta

- Certains objets du logiciel d'origine (icônes « atome » et autres outils non identifiés) ne sont pas reproduits ; plusieurs outils ouvrent un panneau de réglages au lieu d'une boîte de dialogue.
- Les compléments ne sont pas lisibles par la version Windows.
- Merci de signaler tout écart de rendu par rapport au logiciel d'origine via les *tickets* du projet.

## Développement

Les sources sont dans `src/` (JavaScript sans dépendance). Pour régénérer `sinequanon.html` : `sh src/build.sh`.

## Licence

[GNU AGPL v3](LICENSE) pour le code de cette réécriture. Le nom « Sine qua non », le logiciel d'origine et ses contenus restent la propriété de leurs auteurs.
