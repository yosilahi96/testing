# Users API tests

Cucumber.js scenarios for `GET https://fake-json-api.mock.beeceptor.com/users`, using Node.js built-in `fetch` and assertions.

## Structure

```text
feature/
  users.feature       # Gherkin scenario
steps/
  api.steps.js        # Step definitions
cucumber.cjs          # Feature and step discovery
package.json
```

## Run

Install Node.js 22 or newer, then run:

```sh
npm ci
npm test
```

Validate Gherkin and step matching without calling the endpoint:

```sh
npm run test:dry-run
```

Override the base URL in PowerShell if needed:

```powershell
$env:API_BASE_URL = 'https://fake-json-api.mock.beeceptor.com'
npm test
```

The scenario makes one live GET request and checks HTTP 200, JSON content type, a non-empty array, the first user's ID, required fields and types, and unique positive integer IDs. It requires internet access; service outages and rate limits can fail the test.

GET does not need a request body. Generated profile values can change, so names and emails are checked by type rather than exact value. The exact-value step accepts JSON strings, numbers, booleans, and null, using dot paths such as `"0.id"` or `"user.name"`.

The custom folder discovery follows the [Cucumber.js configuration documentation](https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md).
