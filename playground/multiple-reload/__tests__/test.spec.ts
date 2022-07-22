import { describe, expect, it } from 'vitest'
// @ts-ignore
import stable from 'sort-deep-object-arrays'

import {
  resetReceivedLog,
  sleepForEdit,
  sleepForServerReady,
  diagnostics,
  isServe,
  expectStderrContains,
  stripedLog,
  isBuild,
  editFile,
  resetDiagnostics,
} from '../../testUtils'
import stringify from 'fast-json-stable-stringify'

describe('multiple-reload', () => {
  describe.runIf(isServe)('serve', () => {
    it('get initial error and subsequent error', async () => {
      await sleepForServerReady()
      expect(stringify(stable(diagnostics))).toMatchSnapshot()
      expect(stripedLog).toMatchSnapshot()

      console.log('-- edit with error --')
      resetReceivedLog()
      editFile('src/main.ts', (code) => code.replace(`'Hello1'`, `'Hello1~'`))
      await sleepForEdit()
      expect(stringify(stable(diagnostics))).toMatchSnapshot()
      expect(stripedLog).toMatchSnapshot()

      console.log('-- edit on non-error file --')
      resetDiagnostics()
      resetReceivedLog()
      editFile('src/text.ts', (code) => code.replace(`Multiple`, `multiple`))
      await sleepForEdit()
      expect(stringify(stable(diagnostics))).toMatchSnapshot()
      expect(stripedLog).toMatchSnapshot()
    })
  })

  describe.runIf(isBuild)('build', () => {
    const expectedMsg = [
      '3:1  error  Unexpected var, use let or const instead  no-var',
      '4:1  error  Unexpected var, use let or const instead  no-var',
      `src/main.ts(3,5): error TS2322: Type 'string' is not assignable to type 'number'.`,
      `src/main.ts(4,5): error TS2322: Type 'string' is not assignable to type 'boolean'.`,
    ]

    it('enableBuild: true', async () => {
      it('enableBuild: true', async () => {
        expectStderrContains(stripedLog, expectedMsg)
      })
    })
  })
})
