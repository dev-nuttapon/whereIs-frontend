import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveApiBaseUrl } from '../../src/lib/api-base-url';

test('allows same-origin paths in production', () => {
  assert.equal(resolveApiBaseUrl('/api/v1', 'production', 'https://app.example.com'), '/api/v1');
});

test('allows HTTPS API URLs in production', () => {
  assert.equal(resolveApiBaseUrl('https://api.example.com/api/v1', 'production', 'https://app.example.com'), 'https://api.example.com/api/v1');
});

test('rejects insecure external API URLs in production', () => {
  assert.throws(() => resolveApiBaseUrl('http://api.example.com/api/v1', 'production', 'https://app.example.com'), /HTTPS/);
  assert.throws(() => resolveApiBaseUrl('//api.example.com/api/v1', 'production', 'https://app.example.com'), /HTTPS/);
});

test('allows localhost HTTP only outside production', () => {
  assert.equal(resolveApiBaseUrl('http://localhost:5112/api/v1', 'development', 'http://localhost:5173'), 'http://localhost:5112/api/v1');
  assert.throws(() => resolveApiBaseUrl('http://api.example.com/api/v1', 'development', 'http://localhost:5173'), /localhost/);
});
