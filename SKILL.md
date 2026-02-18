---
name: hatch
description: AI-powered test locator healing for Playwright
allowed-tools:
  - Bash(hatch:*)
---

# Hatch Skill

This skill provides knowledge for healing broken Playwright test locators.

## Locator Priority

When healing locators, always prefer in this order:

1. `getByRole` - Use ARIA roles for buttons, links, inputs
2. `getByLabel` - For form fields with labels
3. `getByTestId` - For elements with data-testid
4. `getByPlaceholder` - For input placeholders
5. `getByText` - For visible text content
6. `locator` - CSS fallback only

## Commands

```bash
# Heal a locator
hatch heal ".old-selector" --snapshots '[...]'

# Generate test code
hatch generate "Navigate to url" "Click button" -l java
```

## Best Practices

- Always prefer semantic locators over CSS/XPath
- Use regex with `name:` option for flexible matching
- Avoid brittle selectors (class, id without testid)
- Keep confidence above 0.7 for reliable tests
