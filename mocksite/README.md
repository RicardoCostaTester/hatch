# Mock Trading Terminal

Local mock website for testing Hatch locator healing.

## Usage

### Open in Browser

Simply open `index.html` in a browser, or serve via:

```bash
npx serve mocksite
```

### Test with Hatch

```bash
# Start local server
npx serve mocksite

# In another terminal, test healing
hatch heal ".btn-primary" --snapshots '[{"ref":"e1","tag":"button","role":"button","label":"Submit Order","attributes":{}}]'
```

## Known Broken Locators

| Original | Issue | Suggested Fix |
|----------|-------|---------------|
| `.btn-primary` | CSS class | `getByRole('button', { name: 'Submit Order' })` |
| `#symbol-input` | ID | `getByLabel('Symbol')` |
| `.form-group input` | CSS | `getByPlaceholder('100')` |
| `.price` | Dynamic class | `getByText('$', { exact: false })` |

## Elements for Snapshot Testing

```json
[
  {"ref": "e1", "tag": "button", "role": "button", "label": "Submit Order", "attributes": {}},
  {"ref": "e2", "tag": "input", "label": "Symbol", "placeholder": "AAPL", "attributes": {"data-testid": "symbol-field"}},
  {"ref": "e3", "tag": "input", "placeholder": "100", "attributes": {"id": "quantity-input"}},
  {"ref": "e4", "tag": "span", "role": "status", "text": "Filled", "attributes": {}},
  {"ref": "e5", "tag": "a", "role": "link", "text": "Orders", "attributes": {}}
]
```
