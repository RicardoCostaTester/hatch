# Hatch

AI-powered test locator healing for Playwright.

## Install

```bash
npm install -g hatch
```

## Commands

### heal

Heal a broken locator using semantic strategies:

```bash
hatch heal ".submit-btn" --snapshots '[{"ref":"e1","tag":"button","role":"button","label":"Submit","attributes":{}}]'
```

### generate

Generate test code from steps:

```bash
hatch generate "Navigate to https://example.com" "Click login button" -l java
```

## Locator Priority

1. `getByRole` (95%)
2. `getByLabel` (90%)
3. `getByTestId` (85%)
4. `getByPlaceholder` (80%)
5. `getByText` (60%)
6. `locator` (30%)

## License

MIT
