# Setup Instructions

## Installation

Run the following command to install all dependencies:

```bash
pnpm install
```

## Environment Variables

**Important:** You must configure environment variables before running the application.

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions on setting up required environment variables including:
- Stripe API keys
- Internal API security keys

Create a `.env.local` file in the root directory with the required variables before proceeding.

## What's Installed

### Tailwind CSS v4.1.14 (Latest)
- Modern, performant CSS framework
- Uses `@import "tailwindcss"` syntax
- PostCSS plugin: `@tailwindcss/postcss`

### shadcn/ui Dependencies
- `@radix-ui/react-slot` - Primitive for composition
- `class-variance-authority` - CVA for component variants
- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes
- `tailwindcss-animate` - Animation utilities
- `lucide-react` - Icon library

## Configuration Files

- `components.json` - shadcn/ui configuration
- `lib/utils.ts` - Utility functions (cn helper)
- `components/ui/button.tsx` - Example Button component
- `styles/globals.css` - Tailwind v4 with CSS variables for theming
- `tailwind.config.js` - Minimal Tailwind v4 config
- `postcss.config.js` - PostCSS with @tailwindcss/postcss plugin
- `tsconfig.json` - Updated with path aliases (@/*)

## Adding More shadcn/ui Components

Use the shadcn/ui CLI to add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc...
```

Or manually create components in `components/ui/`

## Usage Example

```tsx
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}
```

## CSS Variables (Design Tokens)

All shadcn/ui components use CSS variables defined in `styles/globals.css`:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--destructive`, `--accent`
- `--border`, `--input`, `--ring`
- And more...

You can customize these to match your brand.

## Dark Mode

Dark mode is enabled via the `class` strategy. Add/remove the `dark` class to the `<html>` element:

```tsx
<html className="dark">
```

## Next Steps

1. Run `pnpm install`
2. Run `pnpm dev`
3. Start building with Tailwind v4 + shadcn/ui!

