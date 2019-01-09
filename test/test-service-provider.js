/* global describe it */
const assert = require('assert')
const { ServiceProvider } = require('../index')

describe('ServiceProvider', () => {
  describe('constructor', () => {
    it('should work', done => {
      const sp = new ServiceProvider()
      assert.ok(sp.cleanupList)
      assert.ok(sp.cleanupList instanceof Array)
      assert.ok(sp.injector)
      done()
    })
  })

  describe('cleanup', () => {
    it('should work with services', done => {
      let cleanupCalledCount = 0
      const sp = new ServiceProvider()
      sp.injector = null
      sp.cleanupList.push({ cleanup: () => cleanupCalledCount++ })
      sp.cleanupList.push({ cleanup: () => cleanupCalledCount++ })
      sp.cleanup()

      assert.ok(sp.injector)
      assert.strictEqual(cleanupCalledCount, 2)
      done()
    })

    it('should work without services', done => {
      let cleanupCalledCount = 0
      const sp = new ServiceProvider()
      sp.injector = null
      sp.cleanup()

      assert.ok(sp.injector)
      assert.strictEqual(cleanupCalledCount, 0)
      done()
    })
  })

  describe('get', () => {
    it('should work', done => {
      const sp = new ServiceProvider()
      sp.injector.TEST = 'TEST'

      const v = sp.get('TEST')
      assert.strictEqual(v, 'TEST')
      done()
    })
  })

  describe('register', () => {
    it('should work and create a service (no params)', done => {
      const sp = new ServiceProvider()
      const factory = () => 42
      const sp2 = sp.register('TEST', factory)

      assert.strictEqual(sp2, sp)
      assert.ok(sp.injector['TEST'])
      done()
    })

    it('should work and create a service (with params)', done => {
      const sp = new ServiceProvider()
      const factory = () => 42
      const cleanup = () => {}
      const sp2 = sp.register('TEST', factory, { cleanup, persist: 1, preload: 2 })

      assert.strictEqual(sp2, sp)
      const service = sp.injector['TEST']
      assert.ok(service)
      done()
    })
  })

  describe('registerConst', () => {
    it('should call register (no cleanup)', done => {
      const sp = new ServiceProvider()
      const sp2 = sp.registerConst('TEST', 42)

      assert.strictEqual(sp2, sp)
      const service = sp.injector['TEST']
      assert.ok(service)
      done()
    })

    it('should call register (cleanup)', done => {
      const sp = new ServiceProvider()
      const cleanup = () => {}
      const sp2 = sp.registerConst('TEST', 42, { cleanup })

      assert.strictEqual(sp2, sp)
      const service = sp.injector['TEST']
      assert.ok(service)
      done()
    })
  })

  describe('registerConstructor', () => {
    it('should call register (no params)', done => {
      class TestClass {}
      const sp = new ServiceProvider()
      const sp2 = sp.registerConstructor(TestClass)

      assert.strictEqual(sp2, sp)
      const inst = sp.injector['testClass']
      assert.ok(inst)
      assert.ok(inst instanceof TestClass)
      done()
    })

    it('should call register (with params)', done => {
      class TestClass {}
      const sp = new ServiceProvider()
      const cleanup = () => {}
      const sp2 = sp.registerConstructor(TestClass, { persist: true, preload: true, cleanup })

      assert.strictEqual(sp2, sp)
      const inst = sp.injector['testClass']
      assert.ok(inst)
      assert.ok(inst instanceof TestClass)
      done()
    })

    it('should call register (no params) and inject', done => {
      class TestClass1 {}
      class TestClass2 {
        constructor ({ testClass1 }) {
          this.test = testClass1
        }
      }
      const sp = new ServiceProvider()
      const sp2 = sp
        .registerConstructor(TestClass1)
        .registerConstructor(TestClass2)

      assert.strictEqual(sp2, sp)
      const inst = sp.injector['testClass2']
      assert.ok(inst)
      assert.ok(inst instanceof TestClass2)
      assert.ok(inst.test)
      assert.ok(inst.test instanceof TestClass1)
      done()
    })
  })
})
