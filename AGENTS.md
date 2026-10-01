# Repository Guidance

- VS Code Explorer may compact a single-child folder chain into one label, such as `src/game/scenes`. These are still separate nested directories; preserve and use their actual paths when editing files.
- The web app is a Vite + TypeScript project. `index.html` loads `src/main.ts`; global styles are in `src/style.css`.
- Capacitor wraps the web app for Android. Its configuration is in `capacitor.config.ts`, and Android native code is under `android/`. Keep web behavior in `src/` unless a change specifically requires native Android code.
- Phaser is a dependency, but `src/game/scenes/BootScene.ts` and `src/game/scenes/MenuScene.ts` are currently empty. Do not assume a Phaser game is wired into the app yet.
- Run `npm run build` to type-check and build. `npm run dev` starts Vite and `npm run preview` serves the built app. There are no npm test or lint scripts currently.
- Follow the existing TypeScript style: single quotes and no semicolons. The compiler rejects unused locals and parameters; keep imports and declarations in use.
