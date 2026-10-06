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

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required in production')
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function ok(res, data) { return res.json({ errno: 0, data }) }
function fail(res, status, msg) { return res.status(status).json({ errno: status, msg }) }
function tokenFor(user) { return jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: '7d' }) }

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
  if (!username || !password) return fail(res, 400, '用户名和密码不能为空')
  if (await findUserByUsername(username)) return fail(res, 409, '用户名已存在')
  const user = { id: id(), username, nickname: nickname || username, passwordHash: bcrypt.hashSync(password, 10), createdAt: new Date().toISOString() }
  try {
    await insertUser(user)
  } catch (error) {
    if (error.code === '23505') return fail(res, 409, '用户名已存在')
    throw error
  }
  return ok(res, { id: user.id, username: user.username, nickname: user.nickname })
})

app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body || {}
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
  if (!answers || typeof answers !== 'object') return fail(res, 400, '答卷内容不能为空')
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

app.use((error, _req, res, _next) => { console.error(error); return fail(res, 500, '服务器内部错误') })
initDb()
  .then(({ provider }) => {
    databaseProvider = provider
    app.listen(port, () => console.log(`Questionnaire API listening on http://localhost:${port} (${provider})`))
  })
  .catch(error => {
    console.error('Database initialization failed', error)
    process.exitCode = 1
  })
