const { camelCase } = require('lodash')
const Service = require('./service')

class ServiceProvider {
  constructor () {
    this.cleanupList = []
    this.injector = {}
  }

  cleanup () {
    let service = this.cleanupList.pop()
    while (service) {
      service.cleanup()
      service = this.cleanupList.pop()
    }
    this.injector = {}
  }

  get (name) {
    return this.injector[name]
  }

  register (name, factory, { cleanup, persist, preload } = {}) {
    const service = new Service(factory, { cleanup, persist, preload })
    service.preload(this)
    Object.defineProperty(this.injector, name, {
      get: () => service.load(this)
    })
    return this
  }

  registerConst (name, val, { cleanup } = {}) {
    return this.register(name, () => val, { cleanup, persist: true, preload: true })
  }

  registerConstructor (Class, { cleanup, persist, preload } = {}) {
    return this.register(camelCase(Class.name), injector => new Class(injector), { cleanup, persist, preload })
  }
}

module.exports = ServiceProvider
