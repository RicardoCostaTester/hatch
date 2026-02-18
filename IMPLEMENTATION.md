# Hatch - Implementation Plan

**Version:** 1.0.0-MVP  
**Status:** Planned  
**Last Updated:** 2026-02-18

---

## Overview

Hatch is an AI-powered test locator healing tool for Playwright. It automatically fixes broken selectors using semantic strategies.

## MVP Scope (v1.0.0)

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Playwright CLI Integration | Token-efficient browser control | Must |
| Locator Healer | Semantic priority: role → label → testId → placeholder → css | Must |
| Test Generator (Java) | Natural language → Java Playwright code | Must |
| Test Generator (TS/JS) | Natural language → TS/JS Playwright code | Should |
| CLI Commands | `hatch heal`, `hatch generate`, `hatch snapshot` | Must |

### Supported Locators (Priority Order)

1. `getByRole` - ARIA roles (highest confidence: 0.95)
2. `getByLabel` - Form labels (confidence: 0.90)
3. `getByTestId` - Test IDs (confidence: 0.85)
4. `getByPlaceholder` - Placeholder text (confidence: 0.80)
5. `getByText` - Visible text (confidence: 0.60)
6. `locator` - CSS fallback (confidence: 0.30)

---

## Architecture

```
hatch/
├── src/
│   ├── cli/              # CLI commands
│   ├── core/             # Playwright CLI wrapper
│   ├── healer/           # Locator healing engine
│   ├── generator/        # Test code generators
│   └── types/            # TypeScript definitions
├── tests/                # JUnit tests
├── package.json
├── tsconfig.json
└── IMPLEMENTATION.md
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0-MVP | 2026-02-18 | Initial MVP plan |

---

## Future Versions

### v1.1.0 - TypeScript/JS Support
- Add TS/JS test generator
- Jest integration

### v2.0.0 - Selenium Support
- WebDriver wrapper
- Java Selenium tests

### v2.1.0 - Domain Skills
- Fintech prompts
- E-commerce prompts
- HR prompts
- Casino/Gambling prompts
