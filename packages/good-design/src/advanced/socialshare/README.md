# Social Share Widget

This implementation provides both a React component and a framework-agnostic vanilla JavaScript widget for social sharing functionality, designed to match the Figma mockup.

## Features

- ✅ Support for Facebook, X (Twitter), LinkedIn, WhatsApp, Telegram, and Instagram
- ✅ Design matches Figma mockup with colored circular buttons
- ✅ "More" button for additional platforms (as shown in mockup)
- ✅ Configurable share message and URL
- ✅ Framework-agnostic vanilla JS version
- ✅ React component with NativeBase integration
- ✅ First-time claimer logic integration
- ✅ Easy to use and implement
- ✅ Copy-to-clipboard functionality for Instagram

## React Component Usage

### Basic Usage

```tsx
import { SocialShareBar } from '@gooddollar/good-design';

<SocialShareBar
  message="I just did my first claim(s) of G$ this week!"
  url="https://gooddollar.org"
  platforms={["Facebook", "X", "LinkedIn", "WhatsApp", "Telegram", "Instagram"]}
/>
```

### In ClaimSuccessModal

```tsx
import { ClaimSuccessModal } from '@gooddollar/good-design';

<ClaimSuccessModal
  open={isClaimSuccess}
  onClose={handleClose}
  isFirstTimeClaimer={true}
  socialShareMessage="I just did my first claim(s) of G$ this week!"
  socialShareUrl="https://gooddollar.org"
/>
```

## Framework-Agnostic Usage

### Method 1: Data Attributes (Auto-initialization)

```html
<div 
  data-social-share
  data-message="I just did my first claim(s) of G$ this week!"
  data-url="https://gooddollar.org"
  data-platforms="Facebook,X,LinkedIn,WhatsApp,Telegram,Instagram">
</div>
```

### Method 2: Programmatic Initialization

```javascript
import { createSocialShareWidget } from '@gooddollar/good-design';

const widget = createSocialShareWidget({
  message: "I just did my first claim(s) of G$ this week!",
  url: "https://gooddollar.org",
  platforms: ["Facebook", "X", "LinkedIn", "WhatsApp", "Telegram", "Instagram"],
  containerId: "my-widget-container"
});

widget.render();
```

### Method 3: Custom Configuration

```javascript
const widget = new SocialShareWidget({
  message: "Check out GoodDollar!",
  url: "https://gooddollar.org",
  platforms: ["Facebook", "X", "WhatsApp"],
  containerId: "custom-widget",
  className: "my-custom-class",
  iconSize: 40
});

widget.render(document.getElementById('container'));
```

## API Reference

### SocialShareBar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | The message to share |
| `url` | `string` | - | The URL to share |
| `platforms` | `string[]` | `["Facebook", "X", "LinkedIn", "WhatsApp", "Telegram", "Instagram"]` | Platforms to show |
| `className` | `string` | - | Custom CSS class |
| `showMoreButton` | `boolean` | `true` | Show "More" button for additional platforms |

### ClaimSuccessModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether modal is open |
| `onClose` | `() => void` | `noop` | Close handler |
| `isFirstTimeClaimer` | `boolean` | `false` | Show social share for first-time claimers |
| `socialShareMessage` | `string` | `"I just did my first claim(s) of G$ this week!"` | Custom share message |
| `socialShareUrl` | `string` | `"https://gooddollar.org"` | Custom share URL |

### SocialShareWidget Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | `string` | - | The message to share |
| `url` | `string` | - | The URL to share |
| `platforms` | `string[]` | `["Facebook", "X", "LinkedIn", "WhatsApp", "Telegram", "Instagram"]` | Platforms to show |
| `containerId` | `string` | `"social-share-widget"` | Container element ID |
| `className` | `string` | `"social-share-bar"` | CSS class name |
| `iconSize` | `number` | `40` | Icon size in pixels |
| `showMoreButton` | `boolean` | `true` | Show "More" button for additional platforms |

## Implementation Details

### First-Time Claimer Logic

The `ClaimSuccessModal` now supports first-time claimer detection:

- When `isFirstTimeClaimer={true}`, the modal shows:
  - Title: "Congrats! \n You claimed your \n first G$s today"
  - Social share widget with configurable message
- When `isFirstTimeClaimer={false}`, the modal shows:
  - Title: "Congrats! \n You claimed \n G$ today"
  - No social share widget

### Social Platforms

1. **Facebook**: Opens Facebook share dialog (Blue circular button with "f")
2. **X (Twitter)**: Opens Twitter share dialog (Black circular button with "X")
3. **LinkedIn**: Opens LinkedIn share dialog (Blue circular button with "in")
4. **WhatsApp**: Opens WhatsApp share dialog (Green circular button with "W")
5. **Telegram**: Opens Telegram share dialog (Blue circular button with "T")
6. **Instagram**: Copies message to clipboard (Pink circular button with "I")

### Design Features

- **Circular Buttons**: Each platform has a colored circular button matching the Figma mockup
- **More Button**: Light blue button with "More ↓" for additional platforms
- **Responsive Layout**: Horizontal layout with proper spacing
- **Hover Effects**: Subtle opacity changes on hover
- **Platform Colors**: Each platform uses its official brand color

### Styling

The React component uses NativeBase components for consistent styling with the design system. The vanilla JS version includes built-in CSS that matches the Figma design.

## Files

- `SocialShareBar.tsx` - React component
- `SocialShareWidget.ts` - Framework-agnostic widget
- `example.html` - Usage examples
- `README.md` - This documentation

## TODO

- [ ] Add proper social media icons (currently using text)
- [ ] Add success/error notifications
- [ ] Add analytics tracking
- [ ] Implement dropdown for "More" button
- [ ] Add unit tests
- [ ] Add Storybook stories 