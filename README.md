# Sine qua non en ligne

Version **en ligne** du logiciel de traçage de courbes **Sine qua non**, pour que les enseignants puissent continuer à l'utiliser depuis un simple navigateur (Chromebook, Linux léger, postes sans aucun logiciel installé).

> **Version 1.3.0.** Utilisable en classe, y compris sur tablette ; quelques éléments restent à reproduire : voir [Ce qui n'est pas encore reproduit](#ce-qui-nest-pas-encore-reproduit).

## Utiliser

- **En ligne** : <https://texierjulien.forge.apps.education.fr/sine-qua-non-en-ligne/>
- **Hors connexion** : télécharger `sinequanon.html` et l'ouvrir dans Chrome, Firefox ou Edge. Un seul fichier, aucune installation, aucun compte, aucune donnée envoyée.

Les menus et la barre d'icônes reprennent l'organisation de la version Windows, pour ne pas dérouter les utilisateurs habituels.

**Tablette et téléphone** : l'interface s'adapte aux petits écrans (menus défilants, barre d'icônes sur une ligne, boutons plus grands au doigt). Sur l'écran tactile : deux doigts pour zoomer, un doigt sur le fond pour déplacer la feuille, glisser pour déplacer l'origine, les unités et les textes.

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
- Ouverture et enregistrement des dessins `.sqn` de la version Windows. Les objets pédagogiques suivants sont lus et affichés à l'ouverture : lois, statistiques, suites, intégrales, inéquations, courbes point par point, arbres, simulations (boîtes et histogrammes), dérivée, primitive, tableaux de variations ou de signes, table de valeurs.
- Export PNG, JPEG, BMP, GIF, SVG, EMF, WMF, EPS (EMF, WMF et EPS contiennent une image), impression ou PDF à l'échelle réelle. « Réouvrir » (10 derniers dessins) et « Ouvrir exemple ». Enregistrement direct dans le fichier choisi sous Chrome et Edge.
- Format `.sqnw` pour les dessins contenant des compléments propres à cette version ; le bouton « ⤓ .sqn » produit un fichier pour la version Windows (les compléments pris en charge y sont écrits).

## Historique des versions

**1.3.0**
- « Enregistrer » et « Ouvrir » passent par le sélecteur de fichiers du système sur Chrome, Edge et Chromebook : le dessin est écrit directement dans le fichier ou le dossier choisi (disque, Drive, dossier Nextcloud monté), et « Enregistrer » réécrit ensuite le même fichier sans nouveau téléchargement. « Enregistrer sous… » demande un nouvel emplacement. Sous Firefox, le comportement reste un téléchargement.

**1.2.1**
- Points des schémas : formes des marques corrigées (5 et 6 pleines, 7 à 9 à fond blanc), tailles d'après l'original, noms écrits avec la police « points » du dessin, centrés, dernier caractère en indice, option « aucun nom ».
- À l'écran, comme dans la version Windows : grille et segments d'un pixel quel que soit le zoom, noms de points à taille fixe. À l'export : traits en millimètres, noms à la taille de la police.
- Validé sur un fichier d'usage fourni par une enseignante et des captures de la version Windows à 100, 200 et 250 %.

**1.2.0**
- Schémas : objets nommés et dépendants comme dans la version Windows (points par intersection, barycentre, projeté, rotation, polaires ; segments, médianes, hauteurs ; vecteurs ; droites, médiatrices, bissectrices ; demi-droites ; cercles inscrit, circonscrit, tangent ; ellipses ; carrés ; polygones et 14 polygones prédéfinis ; coniques ; Bézier ; angles ; coloriage de zone), avec les mêmes chaînes dans le `.sqn`. Points déplaçables à la souris.
- Lois de probabilité : p(X=k), p(X≤k), p(X≥k), p(a≤X≤b), intervalle de confiance centré, lecture inverse, paramètres, tableau des probabilités ; binomiale limitée à n ≤ 100.
- Exports JPEG, BMP, GIF, EMF, WMF, EPS ; « Réouvrir » (10 derniers) ; « Ouvrir exemple » (15 exemples) ; marges déplaçables à la souris.
- Textes : indices (`A1`, `Cf`) et inclinaison (`/45;texte`) ; Ctrl + molette = zoom, Maj + molette = unités.

**1.1.3**
- Objets du schéma : ajout des figures « Point » (un point `x;y` par ligne) et « Segment » (`x1;y1;x2;y2`, un segment par ligne).
- « Nouveau » crée un dessin réellement vide (sans la courbe d'exemple) et actualise le panneau de réglages.

**1.1.2**
- Boîte « À propos » complète : auteurs du logiciel d'origine, licence, appartenance à la Forge des communs numériques éducatifs, lien vers le dépôt, mention de l'usage d'une IA générative.
- README : section « Forge des communs et IA générative ».

**1.1.1**
- Lecture des anciens fichiers `.sqn` (avant octobre 2012) : épaisseur et vitesse des courbes, qui étaient codées sur une seule valeur, sont converties comme dans le logiciel d'origine ; les traits ne sont plus démesurés.
- Lecture des fractions à signe doublé écrites par Windows (`--6655/16`), qui plaçaient le point à l'origine.
- L'en-tête « Expressions LaTeX » sans précision (transparent ou opaque) est conservé à l'export.

**1.1**
- Les objets lus à l'ouverture d'un `.sqn` Windows se modifient et sont réécrits dans le `.sqn` exporté.
- Tableaux de variations ou de signes de Windows : affichés à l'ouverture.
- Table de valeurs affichée sous le dessin.
- Statistiques et simulations : boîtes à moustaches, déciles, droite de Henry (papier gausso-arithmétique), échelle automatique des simulations.
- Adaptation tablette et téléphone : menus défilants, boutons plus grands, zoom à deux doigts, déplacement de la feuille au doigt.

**1.0** : première version utilisable en classe (sortie de la bêta).

## Ce qui n'est pas encore reproduit

La version 1.2.0 couvre l'ensemble des fonctions décrites dans le mode d'emploi de la version Windows (v2.9.3). Restent les écarts suivants :

- **Rendu des schémas** : le tracé des extrémités de segments, des hachures et des mesures de coniques est reconstitué d'après les sources, mais n'a pas été comparé point par point avec Windows. Les règles de nommage de l'original (noms de points de 3 caractères au plus) ne sont pas imposées.
- **Exports EMF, WMF et EPS** : ils contiennent une image, pas un dessin vectoriel. Pour un rendu vectoriel, utiliser le SVG.
- **« Réouvrir »** : la liste des 10 derniers dessins est conservée dans le navigateur (pas de chemin de fichier) ; elle est propre à chaque poste.
- **Limites de l'original** (10 fonctions, 60 textes, environ 50 expressions LaTeX) : volontairement non reproduites.
- **Réécriture dans le `.sqn` exporté** : les objets lus à l'ouverture (lois, statistiques, suites, intégrales, inéquations, courbes, dérivées, primitives, schémas…) se modifient et sont réécrits. Exception : arbres de probabilités, simulations, tableaux de variations et tables de valeurs (supprimés dans l'application, ils sont retirés du `.sqn` ; modifiés, ils gardent leur ancienne version).
- **À vérifier sur vos fichiers** : droite de Henry, échelle automatique des simulations et table de valeurs (faute de fichiers `.sqn` de référence), et mise en page des tableaux de variations ou de signes, proche mais pas identique.
- Le rendu est fidèle aux couleurs, styles et valeurs du fichier, mais pas identique pixel pour pixel à celui de Windows.

Merci de signaler tout écart avec le logiciel d'origine via les *tickets* du projet, idéalement avec le fichier `.sqn` concerné.

## Enregistrer sans stockage local

Les postes visés (« carbonBook » sous Fedora Kinoite, Chromebook) sont conçus pour n'utiliser aucun stockage local.

- **Chrome, Edge, Chromebook** : depuis la 1.3.0, « Enregistrer » écrit directement dans l'emplacement choisi dans le sélecteur de fichiers, y compris un dossier réseau ou cloud accessible depuis l'application Fichiers. Rien ne passe par le dossier Téléchargements.
- **Firefox** : une page web ne peut pas écrire dans un dossier ; « Enregistrer » produit un téléchargement, qui passe par le disque du poste. À court terme, il faut régler Firefox pour demander l'emplacement à chaque fois et vérifier si le dossier Téléchargements est vidé à la fin de la session.
- Une copie de secours du dessin en cours est conservée dans le navigateur (reprise proposée à la réouverture).

Pistes restant à étudier avec l'établissement, selon ce que permettent le Nuage (Nextcloud) et les postes :
- **Élèves** : un lien Nextcloud de *dépôt de fichiers* (sans compte, en écriture seule) permettrait de remettre un travail ; il ne permet pas de le rouvrir. Pour reprendre un travail, il faut un dossier partagé par classe ou un espace personnel, si les élèves ont un compte.
- **Dans l'application** : un bouton « Déposer dans le dossier de la classe » (lien fourni par l'enseignant) ; il dépend d'un réglage côté serveur à tester sur votre Nextcloud.

## Développement

Les sources sont dans `src/` (JavaScript sans dépendance). Pour régénérer `sinequanon.html` : `sh src/build.sh` (Node.js et Python 3 requis).

## Forge des communs et IA générative

Ce projet est hébergé sur la **Forge des communs numériques éducatifs** (<https://forge.apps.education.fr/texierjulien/sine-qua-non-en-ligne>) et en fait partie. Il est publié en logiciel libre, sans dépendance externe : tout tient dans un seul fichier, sans police ni bibliothèque chargée depuis un autre site.

La réécriture a été réalisée **avec l'aide d'une IA générative** (Claude, d'Anthropic) : écriture du code, tests, documentation. Le code et les rendus ont été vérifiés sur des fichiers `.sqn` de la version Windows et par des tests automatiques ; ils restent à valider par les utilisateurs (voir ci-dessus).

## Licence

[GNU AGPL v3](LICENSE) pour le code de cette réécriture. Le nom « Sine qua non », le logiciel d'origine et ses contenus restent la propriété de leurs auteurs.
