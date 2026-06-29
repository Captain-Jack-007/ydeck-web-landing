# YDeck Landing Page

Self-contained transfer folder for the YDeck landing page.

## Files

- `src/YDeckPage.tsx` - the main page composition and hero layout.
- `src/index.ts` - simple export for the page component.
- `src/components/` - shared visual and motion components.
- `src/sections/` - landing page sections.
- `src/data/` - template preview image metadata.
- `src/i18n/` - English, Russian, and Uzbek landing page copy.
- `src/utils/` - locale detection and formatter helpers.
- `src/constants.ts` - shared animation and language constants.
- `src/types.ts` - shared TypeScript types.
- `styles/ydeck.css` - YDeck-specific global CSS, fonts, utility classes, and keyframes.
- `tailwind.ydeck.extend.ts` - Tailwind token snippet required by the page.
- `public/ydeck-template-previews/` - real template preview slide images.
- `public/ydeck-web3-pitch-deck-previews/` - hero command-center slide images.

## Required Packages

Install these in the target project if they are not already present:

```bash
npm install framer-motion lucide-react
```

The page assumes React and Tailwind CSS are already configured.

## Integration

1. Copy `src/YDeckPage.tsx` into your app, for example:

```text
src/pages/ydeck/YDeckPage.tsx
```

If you want to keep the refactored structure, copy the full `src/` folder instead of only `YDeckPage.tsx`.

2. Copy both folders from `public/` into the target project public root:

```text
public/ydeck-template-previews/
public/ydeck-web3-pitch-deck-previews/
```

The component uses absolute asset paths such as `/ydeck-template-previews/...`, so these folders need to live at the public root unless you change the paths in `YDeckPage.tsx`.

3. Import the CSS once in your app global CSS or app entry:

```ts
import "./styles/ydeck.css";
```

Adjust the relative import path based on where you place the `styles/` folder.

4. Merge the contents of `tailwind.ydeck.extend.ts` into your Tailwind config under `theme.extend`.

Example:

```ts
theme: {
  extend: {
    fontFamily: {
      sora: ["Sora", "sans-serif"],
      serif: ['"Instrument Serif"', "serif"],
    },
    colors: {
      ydeck: {
        black: "#03050A",
        dark: "#070A12",
        panel: "#0D111C",
        card: "#111827",
        border: "rgba(255,255,255,0.10)",
        text: "#EEF4FF",
        muted: "#94A3B8",
        blue: "#3B82F6",
        cyan: "#22D3EE",
        violet: "#8B5CF6",
        green: "#22C55E",
        amber: "#F59E0B",
      },
    },
  },
}
```

Make sure Tailwind's `content` array includes the folder where `YDeckPage.tsx` lives, otherwise the page classes will not be generated.

5. Render the page from your router:

```tsx
import { YDeckPage } from "./pages/ydeck/YDeckPage";

export function App() {
  return <YDeckPage />;
}
```

## Language Support

The page supports English, Russian, and Uzbek. It also accepts direct links:

```text
/ydeck?lang=en
/ydeck?lang=ru
/ydeck?lang=uz
```

Selected language is persisted in `localStorage` as `ydeck-locale`.
