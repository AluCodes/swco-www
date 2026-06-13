# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build the production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 14 application for a will generation platform with the following key architectural components:

### Core Form System
- **Multi-step form flow**: 7 steps (personal, assets, executor, guardian, contact, beneficiaries, review)
- **Validation**: Zod schemas in `lib/validationSchemas.ts` with step-specific validation
- **State management**: React Hook Form with FormProvider for cross-step data persistence
- **Progress tracking**: Completed steps array with navigation controls

### Form Steps Structure
Each step is a separate component in `components/steps/`:
- PersonalInfoStep - Basic identity information with Singapore-specific ID types
- AssetsStep - Property and financial assets
- ExecutorTrusteeStep - Executor and trustee appointments with payment options
- GuardianStep - Guardian appointments for minor children
- ContactInfoStep - Address and contact details
- BeneficiariesStep - Beneficiary management with percentage allocation
- ReviewStep - Final review and submission

### Data Flow
- Form data follows the `WillFormData` type structure
- Step validation uses `getStepSchema()` function for dynamic schema resolution
- Data submission flows through `/api/will/submit-will.js` to external webhook
- PDF generation available via `/api/generate-pdf.js`

### Theme System
- Context-based theme management in `lib/ThemeContext.tsx`
- Multiple theme support with localStorage persistence
- Theme switching via `ThemeSwitcher` component
- Tailwind CSS classes use `classic-*` prefixes for theming

### Key Technical Patterns
- **Step navigation**: Controlled by `currentStep` state with validation gates
- **Form persistence**: Uses React Hook Form's `defaultValues` and `FormProvider`
- **Animation**: Framer Motion for step transitions and UI feedback
- **Icons**: Lucide React icons throughout the interface
- **Responsive design**: Mobile-first approach with Tailwind CSS

### External Integration
- Webhook submission to `https://workflow.pixelcollab.co/webhook/kaeso-webhook-submission`
- PDF generation endpoint for document creation
- Form data structure designed for legal document processing

## Development Notes

### Adding New Form Steps
1. Create component in `components/steps/`
2. Add validation schema in `lib/validationSchemas.ts`
3. Update `steps` array in `pages/create-will/index.tsx`
4. Add to `getStepSchema()` function

### Form Validation Patterns
- Use Zod for all form validation
- Implement conditional validation with `superRefine()`
- Step-specific schemas combined into `willFormDataSchema`
- Form errors handled via React Hook Form's error system

### Theme Development
- Themes defined in `lib/theme.ts`
- CSS variables approach for theme switching
- `classic-*` Tailwind classes for themeable components

### Tooltip Implementation
When implementing tooltips, use the following pattern for responsive positioning that works across all device sizes:

```jsx
// State for tooltip visibility
const [showTooltip, setShowTooltip] = React.useState({});

// Tooltip JSX with proper positioning
{showTooltip[`tooltip-key-${idx}`] && (
  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 max-w-[calc(100vw-2rem)] p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50">
    <p>Tooltip content here</p>
  </div>
)}

// Icon with hover handlers
<Info
  size={16}
  className="text-gray-400 cursor-help"
  onMouseEnter={() => setShowTooltip({...showTooltip, [`tooltip-key-${idx}`]: true})}
  onMouseLeave={() => setShowTooltip({...showTooltip, [`tooltip-key-${idx}`]: false})}
/>
```

**Key positioning classes:**
- `top-full left-1/2 transform -translate-x-1/2` - Centers tooltip below the trigger
- `max-w-[calc(100vw-2rem)]` - Prevents tooltip from exceeding viewport width
- `z-50` - Ensures tooltip appears above other elements

### Error Display Requirements
**CRITICAL**: All form validation errors must be displayed to users in the UI, not just logged to the console.

When implementing form validation:
1. **Always display validation errors in the UI** using appropriate error styling
2. **Check error paths carefully** - React Hook Form errors can have different structures
3. **Test error display** - Ensure errors are visible when validation fails
4. **Use consistent patterns** for error messaging across components

**Standard error display pattern:**
```jsx
{errors.fieldName?.message && (
  <p className="text-sm text-red-600 mt-1">
    {errors.fieldName.message}
  </p>
)}

// For nested fields/arrays:
{errors.parentField?.childField?.message && (
  <p className="text-sm text-red-600 mt-1">
    {errors.parentField.childField.message}
  </p>
)}
```

**Never leave validation errors only in console** - users must see validation feedback in the interface.