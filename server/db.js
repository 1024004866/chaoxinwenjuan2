const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const dataFile = process.env.QUESTIONNAIRE_DATA_FILE || path.join(__dirname, '..', '.data', 'db.json')
const dataDir = path.dirname(dataFile)
const databaseUrl = process.env.DATABASE_URL
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    })
  : null

const QUESTION_COLUMNS = 'id, user_id, title, description, js, css, is_star, is_deleted, is_published, answer_count, created_at, updated_at, component_list'
let memoryDb
const id = () => crypto.randomUUID()

function createDefaultComponentList() {
  return [
    { fe_id: id(), type: 'questionTitle', title: '标题', props: { text: '一份新的问卷', level: 1, isCenter: true } },
    { fe_id: id(), type: 'questionParagraph', title: '段落', props: { text: '感谢你的参与，请根据实际情况填写以下内容。', isCenter: false } },
    { fe_id: id(), type: 'questionInfo', title: '问卷信息', props: { title: '问卷标题', desc: '问卷描述' } },
    { fe_id: id(), type: 'questionInput', title: '输入框', props: { title: '输入框标题', placeholder: '请输入...' } },
    { fe_id: id(), type: 'questionTextarea', title: '多行输入', props: { title: '多行输入标题', placeholder: '请输入...' } },
    { fe_id: id(), type: 'questionRadio', title: '单选', props: { title: '单选标题', isVertical: true, options: [{ text: '选项1', value: 'option1' }, { text: '选项2', value: 'option2' }] } },
    { fe_id: id(), type: 'questionCheckbox', title: '多选', props: { title: '多选标题', isVertical: true, list: [{ text: '选项1', value: 'option1', checked: false }, { text: '选项2', value: 'option2', checked: false }] } },
  ]
}

function createSeed() {
  const now = new Date().toISOString()
  const userId = id()
  return {
    users: [{
      id: userId,
      username: 'demo_user',
      nickname: '演示用户',
      passwordHash: bcrypt.hashSync('demo123', 10),
      createdAt: now,
    }],
    questions: [{
      id: id(),
      userId,
      title: '产品体验调研',
      desc: '帮助我们了解你对产品的真实感受。',
      js: '',
      css: '',
      isStar: true,
      isDeleted: false,
      isPublished: true,
      answerCount: 0,
      createdAt: now,
      updatedAt: now,
      componentList: [
        { fe_id: id(), type: 'questionInfo', title: '问卷信息', props: { title: '产品体验调研', desc: '感谢你的反馈。' } },
        { fe_id: id(), type: 'questionRadio', title: '单选题', props: { title: '你对产品的整体满意度？', isVertical: true, options: [{ text: '非常满意', value: 'very-good' }, { text: '满意', value: 'good' }, { text: '一般', value: 'normal' }, { text: '不满意', value: 'bad' }] } },
        { fe_id: id(), type: 'questionCheckbox', title: '多选题', props: { title: '你最常使用哪些功能？', isVertical: true, list: [{ text: '问卷编辑', value: 'editor' }, { text: '数据统计', value: 'stats' }, { text: '团队协作', value: 'team' }] } },
        { fe_id: id(), type: 'questionTextarea', title: '文本题', props: { title: '还有什么建议？', placeholder: '请输入你的建议' } },
      ],
    }],
    answers: [],
  }
}

function readJsonDb() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(dataDir, { recursive: true })
    fs.writeFileSync(dataFile, JSON.stringify(createSeed(), null, 2))
  }
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'))
}

function writeJsonDb() {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(memoryDb, null, 2))
}

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

function mapQuestion(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    desc: row.description,
    js: row.js,
    css: row.css,
    isStar: row.is_star,
    isDeleted: row.is_deleted,
    isPublished: row.is_published,
    answerCount: row.answer_count,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    componentList: row.component_list,
  }
}

function mapAnswer(row) {
  return {
    id: row.id,
    questionId: row.question_id,
    answers: row.answers,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      nickname TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      js TEXT NOT NULL DEFAULT '',
      css TEXT NOT NULL DEFAULT '',
      is_star BOOLEAN NOT NULL DEFAULT false,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      is_published BOOLEAN NOT NULL DEFAULT false,
      answer_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      component_list JSONB NOT NULL DEFAULT '[]'::jsonb
    );
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS questions_user_id_idx ON questions(user_id);
    CREATE INDEX IF NOT EXISTS answers_question_id_idx ON answers(question_id);
  `)
}

async function seedPostgresDb() {
  const seed = createSeed()
  const user = seed.users[0]
  const question = seed.questions[0]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const userResult = await client.query(
      'INSERT INTO users (id, username, nickname, password_hash, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING RETURNING id',
      [user.id, user.username, user.nickname, user.passwordHash, user.createdAt]
    )
    if (userResult.rowCount === 0) {
      await client.query('COMMIT')
      return
    }
    await client.query(
      'INSERT INTO questions (id, user_id, title, description, js, css, is_star, is_deleted, is_published, answer_count, created_at, updated_at, component_list) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [question.id, question.userId, question.title, question.desc, question.js, question.css, question.isStar, question.isDeleted, question.isPublished, question.answerCount, question.createdAt, question.updatedAt, JSON.stringify(question.componentList)]
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function initDb() {
  if (!pool) {
    memoryDb = readJsonDb()
    return { provider: 'json' }
  }
  await createSchema()
  const result = await pool.query('SELECT EXISTS (SELECT 1 FROM users) AS has_users')
  if (!result.rows[0].has_users) await seedPostgresDb()
  return { provider: 'postgres' }
}

async function findUserByUsername(username) {
  if (!pool) return memoryDb.users.find(user => user.username === username) || null
  const result = await pool.query('SELECT id, username, nickname, password_hash, created_at FROM users WHERE username = $1', [username])
  return mapUser(result.rows[0])
}

async function findUserById(userId) {
  if (!pool) return memoryDb.users.find(user => user.id === userId) || null
  const result = await pool.query('SELECT id, username, nickname, password_hash, created_at FROM users WHERE id = $1', [userId])
  return mapUser(result.rows[0])
}

async function insertUser(user) {
  if (!pool) {
    if (memoryDb.users.some(item => item.username === user.username)) {
      const error = new Error('Username already exists')
      error.code = '23505'
      throw error
    }
    memoryDb.users.push(user)
    writeJsonDb()
    return user
  }
  await pool.query(
    'INSERT INTO users (id, username, nickname, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
    [user.id, user.username, user.nickname, user.passwordHash, user.createdAt]
  )
  return user
}

async function listQuestions({ userId, isDeleted, isStar, keyword, page, pageSize }) {
  if (!pool) {
    const filtered = memoryDb.questions
      .filter(question => question.userId === userId && question.isDeleted === isDeleted && (!isStar || question.isStar) && (!keyword || question.title.toLowerCase().includes(keyword.toLowerCase())))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { list: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length }
  }

  const conditions = ['user_id = $1', 'is_deleted = $2']
  const values = [userId, isDeleted]
  if (isStar) {
    values.push(true)
    conditions.push(`is_star = $${values.length}`)
  }
  if (keyword) {
    values.push(`%${keyword}%`)
    conditions.push(`title ILIKE $${values.length}`)
  }
  const where = conditions.join(' AND ')
  const listValues = [...values, pageSize, (page - 1) * pageSize]
  const [listResult, countResult] = await Promise.all([
    pool.query(`SELECT ${QUESTION_COLUMNS} FROM questions WHERE ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, listValues),
    pool.query(`SELECT COUNT(*)::int AS total FROM questions WHERE ${where}`, values),
  ])
  return { list: listResult.rows.map(mapQuestion), total: countResult.rows[0].total }
}

async function insertQuestion(question) {
  if (!pool) {
    memoryDb.questions.unshift(question)
    writeJsonDb()
    return question
  }
  await pool.query(
    'INSERT INTO questions (id, user_id, title, description, js, css, is_star, is_deleted, is_published, answer_count, created_at, updated_at, component_list) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
    [question.id, question.userId, question.title, question.desc, question.js, question.css, question.isStar, question.isDeleted, question.isPublished, question.answerCount, question.createdAt, question.updatedAt, JSON.stringify(question.componentList)]
  )
  return question
}

async function findQuestionById(questionId) {
  if (!pool) return memoryDb.questions.find(question => question.id === questionId) || null
  const result = await pool.query(`SELECT ${QUESTION_COLUMNS} FROM questions WHERE id = $1`, [questionId])
  return mapQuestion(result.rows[0])
}

async function findOwnedQuestionById(questionId, userId) {
  if (!pool) return memoryDb.questions.find(question => question.id === questionId && question.userId === userId) || null
  const result = await pool.query(`SELECT ${QUESTION_COLUMNS} FROM questions WHERE id = $1 AND user_id = $2`, [questionId, userId])
  return mapQuestion(result.rows[0])
}

async function updateQuestion(questionId, userId, updates) {
  const updatedAt = new Date().toISOString()
  if (!pool) {
    const question = memoryDb.questions.find(item => item.id === questionId && item.userId === userId)
    if (!question) return null
    Object.assign(question, updates, { updatedAt })
    writeJsonDb()
    return question
  }

  const columnMap = {
    title: 'title',
    desc: 'description',
    js: 'js',
    css: 'css',
    isStar: 'is_star',
    isDeleted: 'is_deleted',
    isPublished: 'is_published',
    componentList: 'component_list',
  }
  const values = []
  const assignments = []
  Object.entries(updates).forEach(([key, value]) => {
    const column = columnMap[key]
    if (!column) return
    values.push(key === 'componentList' ? JSON.stringify(value) : value)
    assignments.push(`${column} = $${values.length}`)
  })
  values.push(updatedAt)
  assignments.push(`updated_at = $${values.length}`)
  values.push(questionId, userId)
  const result = await pool.query(
    `UPDATE questions SET ${assignments.join(', ')} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING ${QUESTION_COLUMNS}`,
    values
  )
  return mapQuestion(result.rows[0])
}

async function deleteQuestions(questionIds, userId) {
  if (questionIds.length === 0) return
  if (!pool) {
    memoryDb.questions = memoryDb.questions.filter(question => !(questionIds.includes(question.id) && question.userId === userId))
    memoryDb.answers = memoryDb.answers.filter(answer => memoryDb.questions.some(question => question.id === answer.questionId))
    writeJsonDb()
    return
  }
  await pool.query('DELETE FROM questions WHERE user_id = $1 AND id = ANY($2::text[])', [userId, questionIds])
}

async function insertAnswer(questionId, answers) {
  const answer = { id: id(), questionId, answers, createdAt: new Date().toISOString() }
  if (!pool) {
    const question = memoryDb.questions.find(item => item.id === questionId && item.isPublished && !item.isDeleted)
    if (!question) return null
    memoryDb.answers.push(answer)
    question.answerCount = memoryDb.answers.filter(item => item.questionId === questionId).length
    writeJsonDb()
    return answer
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const questionResult = await client.query('SELECT id FROM questions WHERE id = $1 AND is_published = true AND is_deleted = false FOR UPDATE', [questionId])
    if (questionResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return null
    }
    await client.query('INSERT INTO answers (id, question_id, answers, created_at) VALUES ($1, $2, $3, $4)', [answer.id, questionId, JSON.stringify(answers), answer.createdAt])
    await client.query('UPDATE questions SET answer_count = (SELECT COUNT(*) FROM answers WHERE question_id = $1) WHERE id = $1', [questionId])
    await client.query('COMMIT')
    return answer
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function listAnswers(questionId, userId, page, pageSize) {
  const question = await findOwnedQuestionById(questionId, userId)
  if (!question) return null
  if (!pool) {
    const answers = memoryDb.answers.filter(item => item.questionId === questionId)
    return { answers: answers.slice((page - 1) * pageSize, page * pageSize), total: answers.length }
  }
  const [answersResult, countResult] = await Promise.all([
    pool.query('SELECT id, question_id, answers, created_at FROM answers WHERE question_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [questionId, pageSize, (page - 1) * pageSize]),
    pool.query('SELECT COUNT(*)::int AS total FROM answers WHERE question_id = $1', [questionId]),
  ])
  return { answers: answersResult.rows.map(mapAnswer), total: countResult.rows[0].total }
}

async function listAllAnswers(questionId, userId) {
  const question = await findOwnedQuestionById(questionId, userId)
  if (!question) return null
  if (!pool) return memoryDb.answers.filter(item => item.questionId === questionId)
  const result = await pool.query('SELECT id, question_id, answers, created_at FROM answers WHERE question_id = $1', [questionId])
  return result.rows.map(mapAnswer)
}

async function closeDb() {
  if (pool) await pool.end()
}

module.exports = {
  id,
  initDb,
  closeDb,
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
}
