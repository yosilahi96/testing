const assert = require('node:assert/strict');
const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(35_000);

Given('the API base url is configured', function () {
  this.baseUrl = process.env.API_BASE_URL || 'https://fake-json-api.mock.beeceptor.com';
  const url = new URL(this.baseUrl);
  assert.ok(['http:', 'https:'].includes(url.protocol), 'API base URL must use HTTP or HTTPS');
});

When('I send a {string} request to {string}', async function (method, endpoint) {
  assert.ok(this.baseUrl, 'Configure the API base URL before sending a request');
  this.response = await fetch(new URL(endpoint, this.baseUrl), {
    method: method.toUpperCase(),
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  this.responseText = await this.response.text();
});

Then('the response status should be {int}', function (expectedStatus) {
  assert.equal(
    this.response.status,
    expectedStatus,
    `Expected HTTP ${expectedStatus}, received ${this.response.status}: ${this.responseText.slice(0, 500)}`,
  );
});

Then('the response content type should be JSON', function () {
  assert.match(this.response.headers.get('content-type') || '', /^application\/json\b/i);
  this.responseBody = JSON.parse(this.responseText);
});

Then('the response body should be a non-empty array', function () {
  this.responseBody = JSON.parse(this.responseText);
  assert.ok(Array.isArray(this.responseBody), 'Expected the response body to be an array');
  assert.ok(this.responseBody.length > 0, 'Expected at least one user');
});

// JSON values preserve their types: "Yosua", 1, false, and null.
// Dot paths support both objects (user.name) and arrays (0.id).
Then(/^the response body should contain "([^"]+)" with value (.+)$/, function (path, expectedJson) {
  let actual = JSON.parse(this.responseText);
  for (const key of path.split('.')) {
    assert.ok(actual !== null && typeof actual === 'object' && Object.hasOwn(actual, key),
      `Response body is missing path "${path}" at "${key}"`);
    actual = actual[key];
  }
  assert.deepEqual(actual, JSON.parse(expectedJson), `Unexpected value at "${path}"`);
});

Then('each user should contain the following fields', function (table) {
  const users = JSON.parse(this.responseText);
  assert.ok(Array.isArray(users) && users.length > 0, 'Expected a non-empty users array');
  users.forEach((user, index) => {
    assert.ok(user !== null && typeof user === 'object' && !Array.isArray(user), `User ${index} must be an object`);
    for (const { field, type } of table.hashes()) {
      assert.ok(Object.hasOwn(user, field), `User ${index} is missing "${field}"`);
      assert.equal(typeof user[field], type, `User ${index}: "${field}" must be ${type}`);
      if (type === 'string') {
        assert.ok(user[field].trim().length > 0, `User ${index}: "${field}" must not be empty`);
      }
    }
  });
});

Then('each user should have a unique positive integer id', function () {
  const users = JSON.parse(this.responseText);
  assert.ok(Array.isArray(users) && users.length > 0, 'Expected a non-empty users array');
  const ids = users.map((user) => user.id);
  for (const id of ids) {
    assert.ok(Number.isInteger(id) && id > 0, `Expected a positive integer id, received ${id}`);
  }
  assert.equal(new Set(ids).size, ids.length, 'User IDs must be unique');
});
