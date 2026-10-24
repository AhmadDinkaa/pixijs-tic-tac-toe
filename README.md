# Tic-Tac-Toe

## Overview

A local two-player Tic-Tac-Toe game built as a frontend portfolio project. This MVP v1.0 uses PixiJS to render the board and interface, with GSAP animations and sound effects for moves and wins. The implementation stays in a single `main.js` for straightforward exploration.

## Features

- Two players take turns on the same device.
- Win and draw detection with a status display.
- Separate counters for X wins, O wins, and draws, retained between rounds during the current page session.
- Animated X and O drawing, winning cell outlines, and a winning line.
- Animated score feedback, button interaction, and an introductory animation.
- Move and victory sounds.
- A **NEW ROUND** button to clear the board and start again with X.

## Tech Stack

- JavaScript (ES modules)
- PixiJS 7.4.3 (version recorded in `package-lock.json`; dependency range: `^7.4.3`)
- GSAP
- Vite
- HTML and CSS

## Installation

Install Node.js compatible with the Vite version in `package-lock.json`, including npm. From the project directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite in your browser.

## Build

```bash
npm run build
```

The production files are generated in `dist/`.

## How to Play

1. X starts each round.
2. Click or tap an empty cell to place the current player's symbol.
3. Alternate turns to complete a row, column, or diagonal of three matching symbols.
4. A full board without a winner ends in a draw.
5. Select **NEW ROUND** at any time to clear the board. The score counters remain until the page is reloaded.

## Responsive Design

The layout responds to window size and orientation. Portrait mode stacks the interface and board vertically; landscape mode places the interface on the left and the board on the right. Resizing redraws the existing moves and restores winning highlights without replaying their animations or sounds.

## Project Structure

```text
.
├── index.html          # HTML entry point
├── main.js             # Game state, PixiJS interface, GSAP animations, and layout
├── style.css           # Page reset and canvas presentation
├── public/
│   └── sounds/
│       ├── x.mp3       # X stroke sound
│       ├── o.mp3       # O move sound
│       └── win.mp3     # Victory sound
├── package.json        # npm scripts and dependency ranges
├── package-lock.json   # Locked dependency versions
└── .gitignore          # Excludes dependencies, build output, and local files
```

The game loads the bundled MP3 files through the browser's `Audio` API from `/sounds/`. The X animation triggers its sound for each stroke; O and victories use their corresponding effects. Playback failures are silently ignored. The remaining visuals are drawn with PixiJS graphics and text.

Asset URLs currently assume deployment at the website root; hosting under a subdirectory may require path adjustments.

## Future Improvements

- Integrate a playable ad call to action (CTA).
- Add a sound toggle.
- Add keyboard controls and improve accessibility.
- Add automated checks for game outcomes and round resets.
