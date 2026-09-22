const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const dataDir = path.join(__dirname, '..', '.data')
const dataFile = path.join(dataDir, 'db.json')

const id = () => crypto.randomUUID()

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

function readDb() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(dataDir, { recursive: true })
    fs.writeFileSync(dataFile, JSON.stringify(createSeed(), null, 2))
  }
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'))
}

function writeDb(db) {
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2))
}

module.exports = { id, readDb, writeDb }
