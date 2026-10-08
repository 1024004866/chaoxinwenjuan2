import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RadioPropComponent from './QuestionRadio/PropComponent'
import CheckboxPropComponent from './QuestionCheckbox/PropComponent'

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    }),
  })
})

describe.each([
  {
    name: '单选题',
    renderComponent: (onChange: jest.Mock) => (
      <RadioPropComponent
        title="单选标题"
        options={[
          { text: '选项1', value: 'option1' },
          { text: '选项2', value: 'option2' },
          { text: '选项3', value: 'option3' },
        ]}
        onChange={onChange}
      />
    ),
  },
  {
    name: '多选题',
    renderComponent: (onChange: jest.Mock) => (
      <CheckboxPropComponent
        title="多选标题"
        list={[
          { text: '选项1', value: 'option1' },
          { text: '选项2', value: 'option2' },
          { text: '选项3', value: 'option3' },
        ]}
        onChange={onChange}
      />
    ),
  },
])('$name选项删除', ({ renderComponent }) => {
  test('超过两个选项时可删除任意项，最少保留两个', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(renderComponent(onChange))

    const deleteButtons = screen.getAllByRole('button', { name: /删除选项/ })
    expect(deleteButtons).toHaveLength(3)

    await user.click(deleteButtons[0])

    await waitFor(() => expect(screen.queryByDisplayValue('选项1')).not.toBeInTheDocument())
    expect(screen.getByDisplayValue('选项2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('选项3')).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: /删除选项/ })).toHaveLength(0)
    expect(onChange).toHaveBeenCalled()
  })
})
