import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { getUserFromCookie } from './auth.js'

test('returns payload for valid token', () => {
  process.env.JWT_SECRET = 'secret'
  const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
  const cookieStore = { get: () => ({ value: token }) }
  const payload = getUserFromCookie(cookieStore)
  assert.strictEqual(payload.userId, 1)
})

test('returns null for invalid token', () => {
  process.env.JWT_SECRET = 'secret'
  const token = jwt.sign({ userId: 1 }, 'othersecret')
  const cookieStore = { get: () => ({ value: token }) }
  const payload = getUserFromCookie(cookieStore)
  assert.strictEqual(payload, null)
})

test('returns null when token missing', () => {
  const cookieStore = { get: () => undefined }
  const payload = getUserFromCookie(cookieStore)
  assert.strictEqual(payload, null)
})
