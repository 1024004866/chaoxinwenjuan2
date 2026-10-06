const fs = require('fs')
const os = require('os')
const path = require('path')
const { TextDecoder, TextEncoder } = require('util')

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

const request = require('supertest')

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'questionnaire-api-'))
process.env.QUESTIONNAIRE_DATA_FILE = path.join(testDir, 'db.json')
process.env.DATABASE_URL = ''
process.env.JWT_SECRET = 'automated-test-secret'

const { app, initializeApp } = require('../server/index')
const { closeDb } = require('../server/db')

let ownerToken
let otherToken

async function registerAndLogin(username) {
  await request(app)
    .post('/api/user/register')
    .send({ username, password: 'test-password', nickname: username })
    .expect(200)

  const response = await request(app)
    .post('/api/user/login')
    .send({ username, password: 'test-password' })
    .expect(200)

  return response.body.data.token
}

beforeAll(async () => {
  await initializeApp()
  ownerToken = await registerAndLogin('api_test_owner')
  otherToken = await registerAndLogin('api_test_other')
})

afterAll(async () => {
  await closeDb()
  fs.rmSync(testDir, { recursive: true, force: true })
})

test('protects private API routes with JWT authentication', async () => {
  await request(app).get('/api/user/info').expect(401)

  const response = await request(app)
    .get('/api/user/info')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200)

  expect(response.body.data.username).toBe('api_test_owner')
})

test('rejects malformed credentials and answer payloads', async () => {
  await request(app)
    .post('/api/user/register')
    .send({ username: 'ab', password: '123' })
    .expect(400)

  await request(app)
    .post('/api/answer/not-a-published-question')
    .send({ answers: ['invalid'] })
    .expect(400)
})

test('keeps draft questionnaires private to their owner', async () => {
  const created = await request(app)
    .post('/api/question')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200)
  const questionId = created.body.data.id

  await request(app).get(`/api/question/${questionId}`).expect(404)
  await request(app)
    .patch(`/api/question/${questionId}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ title: 'unauthorized update' })
    .expect(404)

  const updated = await request(app)
    .patch(`/api/question/${questionId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ title: 'API test questionnaire' })
    .expect(200)

  expect(updated.body.data.title).toBe('API test questionnaire')
  expect(updated.body.data.componentList).toHaveLength(7)
})

test('accepts answers only after publishing and exposes owner statistics', async () => {
  const created = await request(app)
    .post('/api/question')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200)
  const questionId = created.body.data.id
  const answers = { satisfaction: 'good' }

  await request(app).post(`/api/answer/${questionId}`).send({ answers }).expect(404)

  await request(app)
    .patch(`/api/question/${questionId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ isPublished: true })
    .expect(200)

  await request(app).post(`/api/answer/${questionId}`).send({ answers }).expect(200)

  const statistics = await request(app)
    .get(`/api/stat/${questionId}`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200)

  expect(statistics.body.data.total).toBe(1)
  expect(statistics.body.data.list[0].satisfaction).toBe('good')

  await request(app)
    .get(`/api/stat/${questionId}`)
    .set('Authorization', `Bearer ${otherToken}`)
    .expect(404)
})
