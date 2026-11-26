# Sine qua non en ligne

Version **en ligne** du logiciel de traçage de courbes **Sine qua non**, pour que les enseignants puissent continuer à l'utiliser depuis un simple navigateur (Chromebook, Linux léger, postes sans aucun logiciel installé).

> **Version 1.** Utilisable en classe ; quelques éléments restent à reproduire : voir [Ce qui n'est pas encore reproduit](#ce-qui-nest-pas-encore-reproduit).

## Utiliser

- **En ligne** : <https://texierjulien.forge.apps.education.fr/sine-qua-non-en-ligne/>
- **Hors connexion** : télécharger `sinequanon.html` et l'ouvrir dans Chrome, Firefox ou Edge. Un seul fichier, aucune installation, aucun compte, aucune donnée envoyée.

Les menus et la barre d'icônes reprennent l'organisation de la version Windows, pour ne pas dérouter les utilisateurs habituels.

## Hommage

Ce projet n'existerait pas sans **Sine qua non**, logiciel de **Patrice Rabiller** et **Patrick Pradeau**, qui accompagne depuis de nombreuses années les enseignants de mathématiques par la qualité de ses figures.

👉 Le logiciel d'origine, sa documentation et ses exemples : <http://patrice-rabiller.fr/SineQuaNon/menusqn.htm>

Cette réécriture **n'est pas un produit officiel** et n'est ni validée ni soutenue par les auteurs. Le code est écrit de zéro en JavaScript ; il ne reprend ni code, ni fichier d'installation, ni exemple, ni documentation du logiciel d'origine. Pour comprendre le format de fichier `.sqn` et le comportement des boîtes de dialogue, des sources de l'original ont été consultées, mais elles ne sont pas diffusées ici. **Pour la version de référence, utilisez le logiciel des auteurs.**

## Fonctionnalités

**Dessin**
- Repère, graduations, grilles, cadre, orientation ; échelles logarithmiques.
- Fonctions, courbes paramétrées et polaires, familles de fonctions, droites, dérivée, primitive, courbes implicites (coniques).
- Points, segments, figures géométriques, textes, expressions LaTeX, rapporteur (lycée et collège).

**Statistiques et probabilités**
- Statistiques à une variable (bâtons, histogrammes, boîtes à moustaches simples et multiples, effectifs et fréquences cumulés, diagrammes qualitatifs) et à deux variables (nuage, régressions).
- Lois binomiale, de Poisson, normale, exponentielle ; simulations ; arbres de probabilités.

**Analyse**
- Suites numériques, intégrales (aire, rectangles, trapèzes), inéquations avec hachures, courbes point par point (pentes ou lissage de Bézier), tableaux de signes et de variations (modèles Var1 à Var8), table de valeurs, calculs.

**Fichiers**
- Ouverture et enregistrement des dessins `.sqn` de la version Windows. Les objets pédagogiques suivants sont lus et affichés à l'ouverture : lois, statistiques, suites, intégrales, inéquations, courbes point par point, arbres, simulations (boîtes et histogrammes), dérivée, primitive.
- Export PNG (300 ppp), SVG, impression ou PDF à l'échelle réelle.
- Format `.sqnw` pour les dessins contenant des compléments propres à cette version ; le bouton « ⤓ .sqn » produit un fichier pour la version Windows (sans ces compléments).

## Ce qui n'est pas encore reproduit

- Les statistiques en boîte ou en droite de Henry sur données groupées, les graphiques de simulation « points » et « histogrammes des échantillons », l'échelle automatique des simulations.
- Les objets lus à l'ouverture d'un `.sqn` Windows (lois, statistiques, suites, intégrales, inéquations, courbes, dérivées, primitives…) se modifient dans l'application et **sont réécrits dans le `.sqn` exporté**. Exception : les arbres de probabilités, les simulations, les tableaux de variations et les tables de valeurs ne sont pas réécrits (supprimés dans l'application, ils sont retirés du `.sqn` ; modifiés, ils gardent leur ancienne version dans le `.sqn`).
- Les tableaux de variations ou de signes de Windows s'affichent à l'ouverture avec le même code ; la mise en page est proche mais pas identique.
- Le rendu est fidèle aux couleurs, styles et valeurs du fichier, mais n'est pas identique pixel pour pixel à celui de Windows.

Merci de signaler tout écart avec le logiciel d'origine via les *tickets* du projet, idéalement avec le fichier `.sqn` concerné.

## Enregistrer sans stockage local : une question ouverte

Les postes visés (« carbonBook » sous Fedora Kinoite, avec Firefox) sont conçus pour n'utiliser aucun stockage local. Or Firefox ne permet pas à une page web d'écrire directement dans un dossier : **« Enregistrer » produit aujourd'hui un téléchargement**, qui passe par le disque du poste. À court terme, il faut régler Firefox pour demander l'emplacement à chaque fois et vérifier si le dossier Téléchargements est vidé à la fin de la session.

Pistes à étudier, selon ce que permettent le Nuage (Nextcloud) et les postes :
- **Enseignants** : enregistrer dans leur espace Nuage ; une écriture directe depuis l'application dépend d'un réglage côté serveur, à vérifier auprès de ses administrateurs.
- **Élèves** : un lien Nextcloud de *dépôt de fichiers* (sans compte, en écriture seule) permettrait de remettre un travail ; il ne permet pas de le rouvrir. Pour reprendre un travail, il faut un dossier partagé par classe (lisible par toute la classe) ou un espace personnel, si les élèves ont un compte.
- **Dans l'application** : un bouton « Déposer dans le dossier de la classe » (lien fourni par l'enseignant), une copie de secours dans le navigateur contre la perte d'un dessin en cours, et la copie de la figure dans le presse-papiers pour la coller dans un document.

Rien de cela n'est encore réalisé : le mécanisme reste à définir avec l'établissement.

## Développement

Les sources sont dans `src/` (JavaScript sans dépendance). Pour régénérer `sinequanon.html` : `sh src/build.sh` (Node.js et Python 3 requis).

## Licence

[GNU AGPL v3](LICENSE) pour le code de cette réécriture. Le nom « Sine qua non », le logiciel d'origine et ses contenus restent la propriété de leurs auteurs.
