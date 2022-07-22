import stringify from 'fast-json-stable-stringify'
import { describe, expect, it } from 'vitest'

import {
  expectStderrContains,
  sleepForServerReady,
  diagnostics,
  isBuild,
  isServe,
  log,
  stripedLog,
  resetReceivedLog,
  sleepForEdit,
  editFile,
} from '../../testUtils'

describe('typescript-react', () => {
  describe.runIf(isServe)('serve', () => {
    it('get initial error and subsequent error', async () => {
      await sleepForServerReady()
      expect(stringify(diagnostics)).toMatchSnapshot()
      expect(stripedLog).toMatchSnapshot()

      console.log('-- edit file --')
      resetReceivedLog()
      editFile('src/App.tsx', (code) => code.replace('useState<string>(1)', 'useState<string>(2)'))
      await sleepForEdit()
      expect(stringify(diagnostics)).toMatchSnapshot()
      expect(stripedLog).toMatchSnapshot()
    })
  })

  describe.runIf(isBuild)('build', () => {
    it('enableBuild: true', async () => {
      expectStderrContains(log, 'error TS2345')
    })
  })
})
