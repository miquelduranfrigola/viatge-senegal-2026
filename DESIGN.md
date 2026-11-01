---
version: alpha
name: Teranga
description: >-
  Sistema de disseny de la web "Viatge a Senegal 2026". Càlid i lluminós com la
  llum de la tarda a la Petite Côte: terracota de la laterita, blau de l'Atlàntic
  i verd de baobab sobre superfícies color sorra. Segueix l'especificació
  DESIGN.md de Google (google-labs-code/design.md) amb noms de tokens Material 3.
colors:
  primary: "#9A4A1C"
  on-primary: "#FFFFFF"
  primary-container: "#FFDBC9"
  on-primary-container: "#351000"
  inverse-primary: "#FFB68E"
  secondary: "#00658E"
  on-secondary: "#FFFFFF"
  secondary-container: "#C7E7FF"
  on-secondary-container: "#001E2E"
  tertiary: "#3F6837"
  on-tertiary: "#FFFFFF"
  tertiary-container: "#C0EFB1"
  on-tertiary-container: "#002200"
  error: "#BA1A1A"
  on-error: "#FFFFFF"
  error-container: "#FFDAD6"
  on-error-container: "#410002"
  background: "#FFF8F4"
  on-background: "#221A15"
  surface: "#FFF8F4"
  surface-dim: "#E7D7CE"
  surface-bright: "#FFF8F4"
  surface-container-lowest: "#FFFFFF"
  surface-container-low: "#FFF1EA"
  surface-container: "#FBEBE2"
  surface-container-high: "#F5E5DC"
  surface-container-highest: "#EFDFD7"
  surface-variant: "#F4DED3"
  on-surface: "#221A15"
  on-surface-variant: "#53443C"
  outline: "#85736B"
  outline-variant: "#D8C2B8"
  inverse-surface: "#382E29"
  inverse-on-surface: "#FFEDE5"
  surface-tint: "#9A4A1C"
  accent-sun: "#F2B233"
  dark-primary: "#FFB68E"
  dark-on-primary: "#562000"
  dark-primary-container: "#7B3405"
  dark-on-primary-container: "#FFDBC9"
  dark-secondary: "#84CFFF"
  dark-secondary-container: "#004C6C"
  dark-on-secondary-container: "#C7E7FF"
  dark-tertiary: "#A5D396"
  dark-tertiary-container: "#285020"
  dark-on-tertiary-container: "#C0EFB1"
  dark-surface: "#1A120D"
  dark-surface-container-low: "#221A15"
  dark-surface-container: "#271E19"
  dark-surface-container-high: "#322823"
  dark-surface-container-highest: "#3D332D"
  dark-on-surface: "#F0DFD7"
  dark-on-surface-variant: "#D8C2B8"
  dark-outline: "#A08D84"
  dark-outline-variant: "#53443C"
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: 700
    lineHeight: 68px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fraunces
    fontSize: 36px
    fontWeight: 600
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 26px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 72px
  gutter: 16px
  container-max: 1200px
components:
  top-app-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    height: 64px
  hero:
    textColor: "{colors.on-primary}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.xl}"
  card:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-hover:
    backgroundColor: "{colors.surface-container-low}"
  filter-chip:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 0 16px
  filter-chip-selected:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 44px
    padding: 0 24px
  button-tonal:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 44px
    padding: 0 20px
  badge-region:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary-container}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  badge-must:
    backgroundColor: "{colors.accent-sun}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  dialog:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  search-field:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 0 20px
---

# Teranga — sistema de disseny

## Overview

*Teranga* és la paraula wolof per a l'hospitalitat senegalesa, i és el to de la
web: acollidora, càlida i pràctica. La web és una guia que quatre amics
consultaran abans i durant el viatge, sovint des del mòbil i amb mala cobertura.
Per això prioritza fotografies grans i honestes, informació escanejable (durada,
preu, distància des de Dakar) i una navegació simple. L'estètica s'inspira en el
paisatge: laterita vermellosa, sorra, l'Atlàntic i el verd fosc dels baobabs i
dels manglars. La tipografia combina una serif expressiva per als títols amb una
sans-serif molt llegible per al text.

## Colors

La paleta segueix l'estructura de rols de Material 3.

- **Primary (#9A4A1C, terracota):** accions principals, enllaços destacats, el
  color de la terra de pista. Es fa servir amb moderació.
- **Secondary (#00658E, blau Atlàntic):** filtres seleccionats, elements de mapa
  i informació de transport.
- **Tertiary (#3F6837, verd baobab):** etiquetes de regió i natura.
- **Accent-sun (#F2B233):** exclusiu per a la insígnia "Imprescindible".
- **Superfícies sorra (#FFF8F4 → #EFDFD7):** fons càlids en lloc de blanc pur;
  les targetes queden en `surface-container-lowest` per destacar.

**Mode fosc:** els tokens `dark-*` defineixen la variant nocturna (fons cafè
#1A120D, primari préssec #FFB68E). S'activa amb `prefers-color-scheme: dark` i es
pot forçar amb `data-theme`.

## Typography

- **Fraunces** (display i headline): serif amb caràcter, evoca guies de viatge
  impreses. Només per a títols.
- **Inter** (title, body i label): text de lectura, xifres de preus i etiquetes.
- `label-sm` va en majúscules amb espaiat ampli per a metadades (regió,
  categoria).
- En pantalles petites, `display-lg` baixa a 40px i `headline-lg` a 28px.

## Layout

- Graella fluida amb amplada màxima `container-max` (1200px) i marge lateral
  `gutter` (16px) al mòbil.
- Escala d'espaiat basada en 8px (`unit`).
- Catàleg: graella de targetes `repeat(auto-fill, minmax(280px, 1fr))`.
- Seccions separades per `xxl` (72px) a escriptori i `xl` (40px) al mòbil.
- Cap desplaçament horitzontal de pàgina; els filtres fan scroll horitzontal
  dins el seu contenidor al mòbil.

## Elevation & Depth

Elevació baixa i tonal, a l'estil Material 3: la profunditat s'expressa sobretot
amb el canvi de to de superfície. Les targetes tenen una ombra molt suau
(`0 1px 2px` + `0 4px 12px` amb opacitat ≤ 8%) que creix lleugerament en
passar-hi per sobre. El diàleg de detall té ombra més marcada i un vel fosc
(scrim) al 50%.

## Shapes

Formes arrodonides i amables: targetes `lg` (1.5rem), diàleg i hero `xl`
(2rem), botons, xips i camp de cerca totalment arrodonits (`full`). Les imatges
dins de targetes hereten el radi superior de la targeta.

## Components

- **Top app bar:** fixa, translúcida amb desenfocament, logotip a l'esquerra i
  navegació a la dreta; al mòbil la navegació passa a un menú desplegable.
- **Hero:** foto a tota amplada amb degradat terracota → transparent i títol en
  `display-lg`.
- **Card d'activitat:** imatge 16:10, insígnies (regió, imprescindible), títol
  `title-md`, resum, i fila de metadades amb icones Material Symbols (durada,
  preu, hores des de Dakar).
- **Filter chips:** per regió, categoria i tipus; seleccionats en
  `secondary-container`.
- **Dialog:** fitxa completa amb galeria, descripció, consells, mapa petit i
  fonts.
- **Search field:** cerca de text lliure al catàleg.

## Do's and Don'ts

- **Do:** donar crèdit a cada foto (autor i llicència) i enllaçar les fonts.
- **Do:** mostrar sempre durada, preu orientatiu i distància des de Dakar.
- **Do:** mantenir el contrast WCAG AA en tots dos modes.
- **Don't:** fer servir el groc `accent-sun` per a res que no sigui
  "Imprescindible".
- **Don't:** posar text sobre fotos sense degradat o vel.
- **Don't:** usar blanc pur com a fons de pàgina; sempre `surface`.
