import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../app/page'
 
test('App', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: 'Queens Solver' })).toBeDefined()
})