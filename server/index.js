const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const { id, readDb, writeDb } = require('./db')

const app = express()
const port = Number(process.env.PORT || 8000)
const jwtSecret = process.env.JWT_SECRET || 'questionnaire-demo-secret'

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

app.post('/api/user/register', (req, res) => {
  const { username, password, nickname } = req.body || {}
  if (!username || !password) return fail(res, 400, '用户名和密码不能为空')
  const db = readDb()
  if (db.users.some(item => item.username === username)) return fail(res, 409, '用户名已存在')
  const user = { id: id(), username, nickname: nickname || username, passwordHash: bcrypt.hashSync(password, 10), createdAt: new Date().toISOString() }
  db.users.push(user)
  writeDb(db)
  return ok(res, { id: user.id, username: user.username, nickname: user.nickname })
})

app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body || {}
  const db = readDb()
  const user = db.users.find(item => item.username === username)
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) return fail(res, 401, '用户名或密码错误')
  return ok(res, { token: tokenFor(user) })
})

app.get('/api/user/info', authRequired, (req, res) => {
  const db = readDb()
  const user = db.users.find(item => item.id === req.user.sub)
  if (!user) return fail(res, 401, '用户不存在')
  return ok(res, { username: user.username, nickname: user.nickname })
})

app.get('/api/question', authRequired, (req, res) => {
  const db = readDb()
  const page = Math.max(Number(req.query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 10, 1), 50)
  const keyword = String(req.query.keyword || '').toLowerCase()
  const isStar = req.query.isStar === 'true'
  const isDeleted = req.query.isDeleted === 'true'
  const filtered = db.questions.filter(q => q.userId === req.user.sub && q.isDeleted === isDeleted && (!isStar || q.isStar) && (!keyword || q.title.toLowerCase().includes(keyword)))
  const list = filtered.slice((page - 1) * pageSize, page * pageSize).map(q => ({ ...q, _id: q.id }))
  return ok(res, { list, total: filtered.length })
})

app.post('/api/question', authRequired, (req, res) => {
  const now = new Date().toISOString()
  const question = { id: id(), userId: req.user.sub, title: '未命名问卷', desc: '', js: '', css: '', isStar: false, isDeleted: false, isPublished: false, answerCount: 0, createdAt: now, updatedAt: now, componentList: [] }
  const db = readDb(); db.questions.unshift(question); writeDb(db)
  return ok(res, { id: question.id })
})

app.get('/api/question/:questionId', optionalAuth, (req, res) => {
  const db = readDb(); const question = db.questions.find(q => q.id === req.params.questionId)
  if (!question || question.isDeleted || (!question.isPublished && (!req.user || question.userId !== req.user.sub))) return fail(res, 404, '问卷不存在')
  return ok(res, publicQuestion(question))
})

app.patch('/api/question/:questionId', authRequired, (req, res) => {
  const db = readDb(); const question = db.questions.find(q => q.id === req.params.questionId && q.userId === req.user.sub)
  if (!question) return fail(res, 404, '问卷不存在')
  const allowed = ['title', 'desc', 'js', 'css', 'isStar', 'isDeleted', 'isPublished', 'componentList']
  allowed.forEach(key => { if (req.body[key] !== undefined) question[key] = req.body[key] })
  question.updatedAt = new Date().toISOString(); writeDb(db)
  return ok(res, { ...question, _id: question.id })
})

app.post('/api/question/duplicate/:questionId', authRequired, (req, res) => {
  const db = readDb(); const source = db.questions.find(q => q.id === req.params.questionId && q.userId === req.user.sub)
  if (!source) return fail(res, 404, '问卷不存在')
  const copy = { ...source, id: id(), title: `${source.title} - 副本`, isPublished: false, isDeleted: false, answerCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), componentList: JSON.parse(JSON.stringify(source.componentList)).map(item => ({ ...item, fe_id: id() })) }
  db.questions.unshift(copy); writeDb(db); return ok(res, { id: copy.id })
})

app.delete('/api/question', authRequired, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  const db = readDb(); db.questions = db.questions.filter(q => !(ids.includes(q.id) && q.userId === req.user.sub))
  writeDb(db); return ok(res, {})
})

app.post('/api/answer/:questionId', (req, res) => {
  const db = readDb(); const question = db.questions.find(q => q.id === req.params.questionId && q.isPublished && !q.isDeleted)
  if (!question) return fail(res, 404, '问卷不存在或尚未发布')
  const answers = req.body?.answers
  if (!answers || typeof answers !== 'object') return fail(res, 400, '答卷内容不能为空')
  db.answers.push({ id: id(), questionId: question.id, answers, createdAt: new Date().toISOString() })
  question.answerCount = db.answers.filter(item => item.questionId === question.id).length
  writeDb(db); return ok(res, { id: db.answers[db.answers.length - 1].id })
})

app.get('/api/stat/:questionId', authRequired, (req, res) => {
  const db = readDb(); const question = db.questions.find(q => q.id === req.params.questionId && q.userId === req.user.sub)
  if (!question) return fail(res, 404, '问卷不存在')
  const page = Math.max(Number(req.query.page) || 1, 1); const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 10, 1), 50)
  const answers = db.answers.filter(item => item.questionId === question.id)
  const list = answers.slice((page - 1) * pageSize, page * pageSize).map(item => ({ _id: item.id, ...item.answers }))
  return ok(res, { list, total: answers.length })
})

app.get('/api/stat/component/:questionId/:componentId', authRequired, (req, res) => {
  const db = readDb(); const question = db.questions.find(q => q.id === req.params.questionId && q.userId === req.user.sub)
  if (!question) return fail(res, 404, '问卷不存在')
  const counts = new Map(); db.answers.filter(a => a.questionId === question.id).forEach(answer => {
    const value = answer.answers[req.params.componentId]
    const values = Array.isArray(value) ? value : [value]
    values.filter(Boolean).forEach(item => counts.set(item, (counts.get(item) || 0) + 1))
  })
  return ok(res, { stat: [...counts.entries()].map(([name, count]) => ({ name, count })) })
})

app.get('/api/health', (_req, res) => ok(res, { status: 'ok', service: 'questionnaire-api' }))

// In production Render serves the compiled React app from the same process.
const buildDir = path.join(__dirname, '..', 'build')
app.use(express.static(buildDir))
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'))
})

app.use((error, _req, res, _next) => { console.error(error); return fail(res, 500, '服务器内部错误') })
app.listen(port, () => console.log(`Questionnaire API listening on http://localhost:${port}`))
