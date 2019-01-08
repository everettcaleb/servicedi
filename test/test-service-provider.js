const assert = require('assert')
const { ServiceProvider } = require('../index')

describe('ServiceProvider', () => {
  describe('constructor', () => {
    it('should work', done => {
      const sp = new ServiceProvider()
      assert.ok(sp.services)
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
      sp.services = null
      sp.cleanupList.push({ cleanup: () => cleanupCalledCount++ })
      sp.cleanupList.push({ cleanup: () => cleanupCalledCount++ })
      sp.cleanup()

      assert.ok(sp.services)
      assert.strictEqual(cleanupCalledCount, 2)
      done()
    })

    it('should work without services', done => {
      let cleanupCalledCount = 0
      const sp = new ServiceProvider()
      sp.services = null
      sp.cleanup()

      assert.ok(sp.services)
      assert.strictEqual(cleanupCalledCount, 0)
      done()
    })
  })

  describe('get', () => {
    it('should call this.getServiceByProxy', done => {
      let getServiceByProxyCall = null
      const sp = new ServiceProvider()
      sp.getServiceByProxy = (...args) => { getServiceByProxyCall = args }
      sp.get('TEST')

      assert.ok(getServiceByProxyCall)
      assert.ok(getServiceByProxyCall[0])
      assert.strictEqual(getServiceByProxyCall[1], 'TEST')
      done()
    })
  })

  describe('getServiceByProxy', () => {
    it('should work if the service exists', done => {
      const sp = new ServiceProvider()
      sp.services['TEST'] = { load: () => 42 }
      const inst = sp.getServiceByProxy(sp.services, 'TEST')

      assert.ok(inst)
      assert.strictEqual(inst, 42)
      done()
    })

    it('should throw an error if the service does not exist', done => {
      let errorThrown = false
      try {
        const sp = new ServiceProvider()
        sp.getServiceByProxy(sp.services, 'TEST')
      }
      catch(err) {
        errorThrown = true
      }

      assert.ok(errorThrown)
      done()
    })
  })

  describe('register', () => {
    it('should work and create a service (no params)', done => {
      const sp = new ServiceProvider()
      const factory = () => 42
      const sp2 = sp.register('TEST', factory)

      assert.strictEqual(sp2, sp)
      assert.ok(sp.services['TEST'])
      assert.strictEqual(sp.services['TEST']._factoryFunction, factory)
      done()
    })

    it('should work and create a service (with params)', done => {
      const sp = new ServiceProvider()
      const factory = () => 42
      const cleanup = () => {}
      const sp2 = sp.register('TEST', factory, { cleanup, persist: 1, preload: 2 })

      assert.strictEqual(sp2, sp)
      const service = sp.services['TEST']
      assert.ok(service)
      assert.strictEqual(service._factoryFunction, factory)
      assert.strictEqual(service._cleanupFunction, cleanup)
      assert.strictEqual(service._persist, 1)
      assert.strictEqual(service._preload, 2)
      assert.strictEqual(service._instance, 42)
      done()
    })
  })

  describe('registerConst', () => {
    it('should call register (no cleanup)', done => {
      const sp = new ServiceProvider()
      const sp2 = sp.registerConst('TEST', 42)

      assert.strictEqual(sp2, sp)
      const service = sp.services['TEST']
      assert.ok(service)
      assert.ok(service._factoryFunction)
      assert.ok(!service._cleanupFunction)
      assert.ok(service._persist)
      assert.ok(service._preload)
      assert.strictEqual(service._instance, 42)
      done()
    })

    it('should call register (cleanup)', done => {
      const sp = new ServiceProvider()
      const cleanup = () => {}
      const sp2 = sp.registerConst('TEST', 42, { cleanup })

      assert.strictEqual(sp2, sp)
      const service = sp.services['TEST']
      assert.ok(service)
      assert.ok(service._factoryFunction)
      assert.strictEqual(service._cleanupFunction, cleanup)
      assert.ok(service._persist)
      assert.ok(service._preload)
      assert.strictEqual(service._instance, 42)
      done()
    })
  })

  describe('registerConstructor', () => {
    it('should call register (no params)', done => {
      class TestClass {}
      const sp = new ServiceProvider()
      const sp2 = sp.registerConstructor(TestClass)

      assert.strictEqual(sp2, sp)
      const service = sp.services['testClass']
      assert.ok(service)
      assert.ok(service._factoryFunction)
      assert.ok(!service._cleanupFunction)
      assert.ok(!service._persist)
      assert.ok(!service._preload)
      assert.ok(!service._instance)

      const inst = service.load(sp)
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
      const service = sp.services['testClass']
      assert.ok(service)
      assert.ok(service._factoryFunction)
      assert.strictEqual(service._cleanupFunction, cleanup)
      assert.ok(service._persist)
      assert.ok(service._preload)
      assert.ok(service._instance)

      const inst = service.load(sp)
      assert.ok(inst)
      assert.ok(inst instanceof TestClass)
      done()
    })

    it('should call register (no params) and inject', done => {
      class TestClass1 {}
      class TestClass2 {
        constructor({ testClass1 }) {
          this.test = testClass1
        }
      }
      const sp = new ServiceProvider()
      const sp2 = sp.registerConstructor(TestClass1)
        .registerConstructor(TestClass2)

      assert.strictEqual(sp2, sp)
      const service = sp.services['testClass2']
      assert.ok(service)
      assert.ok(service._factoryFunction)
      assert.ok(!service._cleanupFunction)
      assert.ok(!service._persist)
      assert.ok(!service._preload)
      assert.ok(!service._instance)

      const inst = service.load(sp)
      assert.ok(inst)
      assert.ok(inst instanceof TestClass2)
      assert.ok(inst.test)
      assert.ok(inst.test instanceof TestClass1)
      done()
    })
  })
})
