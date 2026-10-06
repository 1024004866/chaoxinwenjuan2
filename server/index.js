require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const {
  id,
  initDb,
  createDefaultComponentList,
  findUserByUsername,
  findUserById,
  insertUser,
  listQuestions,
  insertQuestion,
  findQuestionById,
  findOwnedQuestionById,
  updateQuestion,
  deleteQuestions,
  insertAnswer,
  listAnswers,
  listAllAnswers,
} = require('./db')

const app = express()
const port = Number(process.env.PORT || 8000)
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'questionnaire-demo-secret')
let databaseProvider = 'initializing'
const loginAttempts = new Map()

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required in production')
}

app.use(cors())
app.use((req, res, next) => {
  const requestId = id()
  const startedAt = process.hrtime.bigint()
  req.requestId = requestId
  res.set('X-Request-Id', requestId)
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    console.log(JSON.stringify({
      event: 'http_request',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    }))
  })
  next()
})
app.use(express.json({ limit: '1mb' }))

function ok(res, data) { return res.json({ errno: 0, data }) }
function fail(res, status, msg) { return res.status(status).json({ errno: status, msg }) }
function tokenFor(user) { return jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: '7d' }) }

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function textField(value, name, { min = 1, max = 200 } = {}) {
  if (typeof value !== 'string') return `${name}格式不正确`
  const text = value.trim()
  if (text.length < min) return `${name}不能为空`
  if (text.length > max) return `${name}不能超过${max}个字符`
  return null
}

function loginRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const current = loginAttempts.get(key) || { count: 0, resetAt: now + 60_000 }
  if (now >= current.resetAt) {
    current.count = 0
    current.resetAt = now + 60_000
  }
  current.count += 1
  loginAttempts.set(key, current)
  if (current.count > 10) {
    res.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)))
    return fail(res, 429, '登录尝试过于频繁，请稍后再试')
  }
  next()
}

function optionalAuth(req, _res, next) {
  const value = req.headers.authorization || ''
  if (value.startsWith('Bearer ')) {
    try { req.user = jwt.verify(value.slice(7), jwtSecret) } catch (_) { /* public request */ }
  }
  next()
}

function authRequired(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return fail(res, 401, '请先登录')
    next()
  })
}

function publicQuestion(question) {
  const { userId, isStar, isDeleted, answerCount, ...data } = question
  return { ...data, answerCount }
}

app.post('/api/user/register', async (req, res) => {
  const { username, password, nickname } = req.body || {}
  if (!isPlainObject(req.body)) return fail(res, 400, '请求参数格式不正确')
  const usernameError = textField(username, '用户名', { min: 3, max: 32 })
  const passwordError = textField(password, '密码', { min: 6, max: 128 })
  const nicknameError = nickname === undefined ? null : textField(nickname, '昵称', { min: 1, max: 32 })
  if (usernameError || passwordError || nicknameError) return fail(res, 400, usernameError || passwordError || nicknameError)
  if (await findUserByUsername(username.trim())) return fail(res, 409, '用户名已存在')
  const user = { id: id(), username: username.trim(), nickname: (nickname || username).trim(), passwordHash: bcrypt.hashSync(password, 10), createdAt: new Date().toISOString() }
  try {
    await insertUser(user)
  } catch (error) {
    if (error.code === '23505') return fail(res, 409, '用户名已存在')
    throw error
  }
  return ok(res, { id: user.id, username: user.username, nickname: user.nickname })
})

app.post('/api/user/login', loginRateLimit, async (req, res) => {
  const { username, password } = req.body || {}
  if (!isPlainObject(req.body) || textField(username, '用户名', { min: 1, max: 32 }) || textField(password, '密码', { min: 1, max: 128 })) return fail(res, 400, '用户名或密码格式不正确')
  const user = await findUserByUsername(username)
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) return fail(res, 401, '用户名或密码错误')
  return ok(res, { token: tokenFor(user) })
})

app.get('/api/user/info', authRequired, async (req, res) => {
  const user = await findUserById(req.user.sub)
  if (!user) return fail(res, 401, '用户不存在')
  return ok(res, { username: user.username, nickname: user.nickname })
})

app.get('/api/question', authRequired, async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 10, 1), 50)
  const keyword = String(req.query.keyword || '').toLowerCase()
  const isStar = req.query.isStar === 'true'
  const isDeleted = req.query.isDeleted === 'true'
  const result = await listQuestions({ userId: req.user.sub, isDeleted, isStar, keyword, page, pageSize })
  return ok(res, { list: result.list.map(question => ({ ...question, _id: question.id })), total: result.total })
})

app.post('/api/question', authRequired, async (req, res) => {
  const now = new Date().toISOString()
  const question = { id: id(), userId: req.user.sub, title: '未命名问卷', desc: '', js: '', css: '', isStar: false, isDeleted: false, isPublished: false, answerCount: 0, createdAt: now, updatedAt: now, componentList: createDefaultComponentList() }
  await insertQuestion(question)
  return ok(res, { id: question.id })
})

app.get('/api/question/:questionId', optionalAuth, async (req, res) => {
  const question = await findQuestionById(req.params.questionId)
  if (!question || question.isDeleted || (!question.isPublished && (!req.user || question.userId !== req.user.sub))) return fail(res, 404, '问卷不存在')
  return ok(res, publicQuestion(question))
})

app.patch('/api/question/:questionId', authRequired, async (req, res) => {
  const allowed = ['title', 'desc', 'js', 'css', 'isStar', 'isDeleted', 'isPublished', 'componentList']
  const updates = {}
  allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key] })
  if (!isPlainObject(req.body) || Object.keys(updates).length === 0) return fail(res, 400, '没有可更新的内容')
  for (const key of ['title', 'desc', 'js', 'css']) {
    if (updates[key] !== undefined && typeof updates[key] !== 'string') return fail(res, 400, `${key}格式不正确`)
  }
  for (const key of ['isStar', 'isDeleted', 'isPublished']) {
    if (updates[key] !== undefined && typeof updates[key] !== 'boolean') return fail(res, 400, `${key}格式不正确`)
  }
  if (updates.componentList !== undefined && (!Array.isArray(updates.componentList) || updates.componentList.length > 100)) return fail(res, 400, '组件列表格式不正确')
  const question = await updateQuestion(req.params.questionId, req.user.sub, updates)
  if (!question) return fail(res, 404, '问卷不存在')
  return ok(res, { ...question, _id: question.id })
})

app.post('/api/question/duplicate/:questionId', authRequired, async (req, res) => {
  const source = await findOwnedQuestionById(req.params.questionId, req.user.sub)
  if (!source) return fail(res, 404, '问卷不存在')
  const copy = { ...source, id: id(), title: `${source.title} - 副本`, isPublished: false, isDeleted: false, answerCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), componentList: JSON.parse(JSON.stringify(source.componentList)).map(item => ({ ...item, fe_id: id() })) }
  await insertQuestion(copy)
  return ok(res, { id: copy.id })
})

app.delete('/api/question', authRequired, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  await deleteQuestions(ids, req.user.sub)
  return ok(res, {})
})

app.post('/api/answer/:questionId', async (req, res) => {
  const answers = req.body?.answers
  if (!isPlainObject(answers) || Object.keys(answers).length > 100) return fail(res, 400, '答卷内容格式不正确')
  const answerSize = Buffer.byteLength(JSON.stringify(answers), 'utf8')
  if (answerSize > 100_000) return fail(res, 400, '答卷内容不能超过100KB')
  const answer = await insertAnswer(req.params.questionId, answers)
  if (!answer) return fail(res, 404, '问卷不存在或尚未发布')
  return ok(res, { id: answer.id })
})

app.get('/api/stat/:questionId', authRequired, async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1); const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 10, 1), 50)
  const result = await listAnswers(req.params.questionId, req.user.sub, page, pageSize)
  if (!result) return fail(res, 404, '问卷不存在')
  const list = result.answers.map(item => ({ _id: item.id, ...item.answers }))
  return ok(res, { list, total: result.total })
})

app.get('/api/stat/component/:questionId/:componentId', authRequired, async (req, res) => {
  const answers = await listAllAnswers(req.params.questionId, req.user.sub)
  if (!answers) return fail(res, 404, '问卷不存在')
  const counts = new Map(); answers.forEach(answer => {
    const value = answer.answers[req.params.componentId]
    const values = Array.isArray(value) ? value : [value]
    values.filter(Boolean).forEach(item => counts.set(item, (counts.get(item) || 0) + 1))
  })
  return ok(res, { stat: [...counts.entries()].map(([name, count]) => ({ name, count })) })
})

app.get('/api/health', (_req, res) => ok(res, { status: 'ok', service: 'questionnaire-api', database: databaseProvider, persistence: 'incremental' }))

// In production Render serves the compiled React app from the same process.
const buildDir = path.join(__dirname, '..', 'build')
app.use(express.static(buildDir))
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'))
})

app.use((error, _req, res, _next) => {
  const requestId = _req.requestId
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') return fail(res, 400, '请求 JSON 格式不正确')
  console.error(JSON.stringify({ event: 'http_error', requestId, name: error.name, message: error.message }))
  return fail(res, 500, '服务器内部错误')
})
async function initializeApp() {
  const { provider } = await initDb()
  databaseProvider = provider
  return app
}

async function startServer() {
  try {
    await initializeApp()
    app.listen(port, () => console.log(`Questionnaire API listening on http://localhost:${port} (${databaseProvider})`))
  } catch (error) {
    console.error('Database initialization failed', error)
    process.exitCode = 1
  }
}

if (require.main === module) startServer()

module.exports = { app, initializeApp }
