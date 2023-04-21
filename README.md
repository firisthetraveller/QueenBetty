# QueenBetty
## Description
Un jeu de type Rogue-like (ex: Slay the Spire) avec des combats tour par tour.
Le joueur a un deck de cartes représentant les attaques qu'il peut effectuer.
Ici, les effets de cartes (sauf une, l'attaque de base) auront un effet basé sur une loi de probabilité.

## Où est-ce qu'il y aura des probas ?
- Une loi uniforme pour sélectionner du texte aléatoire affiché.
- Une loi par carte :
  - Bernoulli : Un lancer de pièce décide du résultat de l'attaque.
  - géométrique : L'attaque continue jusqu'à qu'une rate

On ajoutera à cette description les lois utilisées quand on les aura apprises.

## Comment tester (provisoire)
Il faut manuellement ouvrir le fichier index.html dans le navigateur.
