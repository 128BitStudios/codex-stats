const assert = require('node:assert/strict')
const test = require('node:test')

const { createProgressBar } = require('../out/ui/progress-bar')
const { formatResetTime } = require('../out/utils/time-formatter')

test('formats reset times', () => {
  assert.equal(formatResetTime(60), '1 minute')
  assert.equal(formatResetTime(300), '5 minutes')
  assert.equal(formatResetTime(3600), '1 hour')
  assert.equal(formatResetTime(5400), '1h 30m')
  assert.equal(formatResetTime(90000), '1d 1h')
})

test('renders progress percentages', () => {
  assert.match(createProgressBar(42), /\*\*42%\*\*$/)
  assert.match(createProgressBar(100), /\*\*100%\*\*$/)
})
