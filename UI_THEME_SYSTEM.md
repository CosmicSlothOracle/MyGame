# UI Theme System Documentation

## Overview

The UI theme system provides a centralized way to customize the visual appearance of menus and selection screens. The MonoGlass theme is currently active by default.

## Available Themes

### 1. `monoGlass` (Default)
- **Style**: Clean, minimal, modern glass-effect design
- **Colors**:
  - Background: `#0E1116`
  - Accent: `#5BC0BE` (Teal)
  - P1 Frame: `#5BC0BE`
  - P2 Frame: `#F25F5C` (Coral)
  - Text: `#EAEAEA`
- **Font**: Inter (sans-serif)
- **Feel**: Professional, calm, focused

### 2. `neonCore`
- **Style**: Futuristic cyberpunk aesthetic
- **Colors**:
  - Background: `#0A0C10`
  - Accent: `#00D1FF` (Bright Cyan)
  - P1 Frame: `#00D1FF`
  - P2 Frame: `#FF2E88` (Hot Pink)
  - Text: `#FFFFFF`
- **Font**: System default
- **Feel**: High-tech, vibrant, energetic

### 3. `festivalPop`
- **Style**: Bright, playful, festival vibes
- **Colors**:
  - Background: `#FFD6A5` (Peach)
  - Accent: `#FF006E` (Magenta)
  - P1 Frame: `#FF006E`
  - P2 Frame: `#3A86FF` (Blue)
  - Text: `#000000`
- **Font**: System default
- **Feel**: Fun, colorful, energetic

## Usage

### Switching Themes

```javascript
// In your initialization code or console
UIComponents.setTheme('monoGlass');   // Activate MonoGlass theme
UIComponents.setTheme('neonCore');    // Activate NeonCore theme
UIComponents.setTheme('festivalPop'); // Activate FestivalPop theme
```

### Getting Current Theme

```javascript
const currentTheme = UIComponents.getTheme();
console.log(currentTheme.accent);  // Get accent color
console.log(currentTheme.text);    // Get text color
```

### Theme Object Structure

Each theme object contains:
- `bg`: Main background color
- `bgGlass`: Glass overlay color (rgba)
- `accent`: Primary accent color
- `secondary`: Secondary color
- `text`: Main text color
- `textSubtle`: Muted text color (rgba)
- `p1Frame`: Player 1 selection frame color
- `p2Frame`: Player 2 selection frame color
- `glow`: Glow effect color (rgba)

## Customization

To add a new theme, edit `ui-components.js` and add to the `uiThemes` object:

```javascript
const uiThemes = {
  // ... existing themes ...

  myCustomTheme: {
    bg: "#YOUR_COLOR",
    bgGlass: "rgba(R,G,B,ALPHA)",
    accent: "#YOUR_ACCENT",
    secondary: "#YOUR_SECONDARY",
    text: "#YOUR_TEXT",
    textSubtle: "rgba(R,G,B,ALPHA)",
    p1Frame: "#YOUR_P1",
    p2Frame: "#YOUR_P2",
    glow: "rgba(R,G,B,ALPHA)",
  }
};
```

Then activate with:
```javascript
UIComponents.setTheme('myCustomTheme');
```

## Affected UI Elements

The theme system affects:
- Character selection screen background and borders
- Stage selection screen tiles and highlights
- Controller legend symbols and text
- Lock status indicators
- Loading placeholders
- All button symbols

## Notes

- The MonoGlass theme uses the Inter font from Google Fonts
- Glass effects are achieved through radial gradients and shadow blur
- Frame glow effects use `ctx.shadowBlur` for modern depth
- All colors should follow accessibility guidelines for contrast

