const assert = require('assert')
const { Service } = require('../index')

describe('Service', () => {
  describe('constructor', () => {
    it('should work with no options', done => {
      const factory = () => 42
      const service = new Service(factory)
      assert.ok(service)
      assert.strictEqual(service._factoryFunction, factory)
      assert.ok(!service._cleanupFunction)
      assert.ok(!service._persist)
      assert.ok(!service._preload)
      assert.ok(!service._instance)
      done()
    })

    it('should work with persist option', done => {
      const factory = () => 42
      const service = new Service(factory, { persist: true })
      assert.ok(service)
      assert.strictEqual(service._factoryFunction, factory)
      assert.ok(!service._cleanupFunction)
      assert.ok(service._persist)
      assert.ok(!service._preload)
      assert.ok(!service._instance)
      done()
    })

    it('should imply persist with cleanup', done => {
      const factory = () => 42
      const service = new Service(factory, { cleanup: () => {} })
      assert.ok(service)
      assert.strictEqual(service._factoryFunction, factory)
      assert.ok(service._cleanupFunction)
      assert.ok(service._persist)
      assert.ok(!service._preload)
      assert.ok(!service._instance)
      done()
    })

    it('should imply persist with preload', done => {
      const factory = () => 42
      const service = new Service(factory, { preload: true })
      assert.ok(service)
      assert.strictEqual(service._factoryFunction, factory)
      assert.ok(!service._cleanupFunction)
      assert.ok(service._persist)
      assert.ok(service._preload)
      assert.ok(!service._instance)
      done()
    })

    it('should throw Error if factory is falsy', done => {
      let thrown = false
      try {
        const service = new Service(null)
      }
      catch(err) {
        thrown = true
      }
      assert.ok(thrown)
      done()
    })

    it('should throw Error if factory is not a function', done => {
      let thrown = false
      try {
        const service = new Service(42)
      }
      catch(err) {
        thrown = true
      }
      assert.ok(thrown)
      done()
    })

    it('should throw Error if cleanup is provided and is not a function', done => {
      let thrown = false
      try {
        const factory = () => 42
        const service = new Service(factory, { cleanup: true })
      }
      catch(err) {
        thrown = true
      }
      assert.ok(thrown)
      done()
    })
  })

  describe('cleanup', () => {
    it('should cleanup the instance if it\'s persisted, created, and has a cleanup function', done => {
      let cleanupCalled = false
      const cleanup = () => { cleanupCalled = true }
      const factory = () => 42
      const service = new Service(factory, { cleanup, persist: true })

      service._instance = 42
      service.cleanup()
      assert.ok(cleanupCalled)

      done()
    })

    it('should do nothing if cleanup function is not specified', done => {
      const factory = () => 42
      const service = new Service(factory, { persist: true })

      service._instance = 42
      service.cleanup()

      done()
    })

    it('should do nothing if it has no instance', done => {
      let cleanupCalled = false
      const cleanup = () => { cleanupCalled = true }
      const factory = () => 42
      const service = new Service(factory, { cleanup, persist: true })

      service.cleanup()
      assert.ok(!cleanupCalled)

      done()
    })
  })

  describe('load', () => {
    it('should work properly', done => {
      const provider = { injector: 42 }
      const factory = inj => inj
      const service = new Service(factory)
      const inst = service.load(provider)

      assert.strictEqual(inst, 42)
      done()
    })

    it('should push to cleanup list if cleanup function is provided', done => {
      const provider = { injector: 42, cleanupList: [] }
      const cleanup = () => {}
      const factory = inj => inj
      const service = new Service(factory, { cleanup })
      const inst = service.load(provider)

      assert.strictEqual(inst, 42)
      assert.strictEqual(provider.cleanupList.length, 1)
      assert.strictEqual(provider.cleanupList[0], service)
      done()
    })

    it('should store the instance if persisted', done => {
      const provider = { injector: 42 }
      const factory = inj => inj
      const service = new Service(factory, { persist: true })
      const inst = service.load(provider)

      assert.strictEqual(inst, 42)
      assert.strictEqual(service._instance, inst)
      done()
    })
  })

  describe('preload', () => {
    it('should do nothing if not configured for preload', done => {
      const provider = { injector: 42 }
      const factory = inj => inj
      const service = new Service(factory, { preload: false })
      const inst = service.preload(provider)

      assert.ok(!inst)
      done()
    })

    it('should call load if configured for preload', done => {
      const provider = { injector: 42 }
      const factory = inj => inj
      const service = new Service(factory, { preload: true })
      const inst = service.preload(provider)

      assert.strictEqual(inst, 42)
      done()
    })
  })
})
