const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const dataDir = path.join(__dirname, '..', '.data')
const dataFile = path.join(dataDir, 'db.json')
const databaseUrl = process.env.DATABASE_URL
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    })
  : null

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
  const questionId = id()
  return {
    users: [{
      id: userId,
      username: 'demo_user',
      nickname: '演示用户',
      passwordHash: bcrypt.hashSync('demo123', 10),
      createdAt: now,
    }],
    questions: [{
      id: questionId,
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

function writeJsonDb(db) {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2))
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

async function writePostgresDb(db) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM answers')
    await client.query('DELETE FROM questions')
    await client.query('DELETE FROM users')
    for (const user of db.users) {
      await client.query('INSERT INTO users (id, username, nickname, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)', [user.id, user.username, user.nickname, user.passwordHash, user.createdAt])
    }
    for (const question of db.questions) {
      await client.query('INSERT INTO questions (id, user_id, title, description, js, css, is_star, is_deleted, is_published, answer_count, created_at, updated_at, component_list) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [question.id, question.userId, question.title, question.desc || '', question.js || '', question.css || '', question.isStar, question.isDeleted, question.isPublished, question.answerCount || 0, question.createdAt, question.updatedAt, JSON.stringify(question.componentList || [])])
    }
    for (const answer of db.answers) {
      await client.query('INSERT INTO answers (id, question_id, answers, created_at) VALUES ($1, $2, $3, $4)', [answer.id, answer.questionId, JSON.stringify(answer.answers), answer.createdAt])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function readPostgresDb() {
  const [users, questions, answers] = await Promise.all([
    pool.query('SELECT id, username, nickname, password_hash, created_at FROM users ORDER BY created_at'),
    pool.query('SELECT id, user_id, title, description, js, css, is_star, is_deleted, is_published, answer_count, created_at, updated_at, component_list FROM questions ORDER BY created_at DESC'),
    pool.query('SELECT id, question_id, answers, created_at FROM answers ORDER BY created_at'),
  ])
  return {
    users: users.rows.map(row => ({ id: row.id, username: row.username, nickname: row.nickname, passwordHash: row.password_hash, createdAt: row.created_at.toISOString() })),
    questions: questions.rows.map(row => ({ id: row.id, userId: row.user_id, title: row.title, desc: row.description, js: row.js, css: row.css, isStar: row.is_star, isDeleted: row.is_deleted, isPublished: row.is_published, answerCount: row.answer_count, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), componentList: row.component_list })),
    answers: answers.rows.map(row => ({ id: row.id, questionId: row.question_id, answers: row.answers, createdAt: row.created_at.toISOString() })),
  }
}

async function initDb() {
  if (!pool) {
    memoryDb = readJsonDb()
    return { provider: 'json' }
  }
  await createSchema()
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM users')
  if (count.rows[0].count === 0) await writePostgresDb(createSeed())
  memoryDb = await readPostgresDb()
  return { provider: 'postgres' }
}

function readDb() {
  if (!memoryDb) throw new Error('Database has not been initialized')
  return memoryDb
}

async function writeDb(db) {
  memoryDb = db
  if (pool) await writePostgresDb(db)
  else writeJsonDb(db)
}

module.exports = { id, initDb, readDb, writeDb, createDefaultComponentList }
