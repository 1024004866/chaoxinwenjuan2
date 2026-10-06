import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuestionCard from './QuestionCard'

function renderCard(isPublished: boolean) {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QuestionCard
        _id="question-1"
        title="测试问卷"
        isStar={false}
        isPublished={isPublished}
        answerCount={0}
      />
    </MemoryRouter>
  )
}

test('published questionnaire exposes its public form actions', () => {
  renderCard(true)

  const previewLink = screen.getByRole('link', { name: /预览填写端/ })
  expect(previewLink).toHaveAttribute('href', `${window.location.origin}/question/question-1`)
  expect(screen.getByRole('button', { name: /复制填写链接/ })).toBeEnabled()
})

test('unpublished questionnaire keeps public form actions disabled', () => {
  renderCard(false)

  expect(screen.getByRole('button', { name: /预览填写端/ })).toBeDisabled()
  expect(screen.getByRole('button', { name: /复制填写链接/ })).toBeDisabled()
})
