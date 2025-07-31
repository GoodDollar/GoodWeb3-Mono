# Social Share Widget

This implementation provides a React component for social sharing functionality, designed to match the Figma mockup.

## Features

- ✅ Support for Facebook, X (Twitter), LinkedIn, WhatsApp, Telegram, and Instagram
- ✅ Design matches Figma mockup with colored circular buttons
- ✅ "More" button for additional platforms (as shown in mockup)
- ✅ Configurable share message and URL

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



## API Reference

### SocialShareBar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | The message to share |
| `url` | `string` | - | The URL to share |
| `className` | `string` | - | Custom CSS class |

### ClaimSuccessModal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether modal is open |
| `onClose` | `() => void` | `noop` | Close handler |
| `isFirstTimeClaimer` | `boolean` | `false` | Show social share for first-time claimers |
| `socialShareMessage` | `string` | `"I just did my first claim(s) of G$ this week!"` | Custom share message |
| `socialShareUrl` | `string` | `"https://gooddollar.org"` | Custom share URL |



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

1. **Facebook**: Opens Facebook share dialog (Blue circular button with Facebook icon)
2. **X (Twitter)**: Opens Twitter share dialog (Black circular button with X icon)
3. **LinkedIn**: Opens LinkedIn share dialog (Blue circular button with LinkedIn icon)
4. **Instagram**: Copies message to clipboard (Pink circular button with Instagram icon, accessed via More button)

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
- `config.ts` - Shared configuration
- `README.md` - This documentation

## TODO

- [ ] Add success/error notifications
- [ ] Add analytics tracking
- [ ] Implement dropdown for "More" button
- [ ] Add unit tests
- [ ] Add Storybook stories 