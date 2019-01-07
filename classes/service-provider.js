const Service = require('./service')
const { camelCase } = require('lodash')

class ServiceProvider {
  constructor () {
    this.services = {}
    this.cleanupList = []
    this.injector = new Proxy(this.services, { get: (...x) => this.getServiceByProxy(...x) })
  }

  cleanup () {
    let service = this.cleanupList.pop()
    while (service) {
      service.cleanup()
      service = this.cleanupList.pop()
    }
    this.services = {}
  }

  get (name) {
    return this.getServiceByProxy(this.services, name)
  }

  getServiceByProxy (services, name) {
    const service = services[name]
    if (!service) {
      throw new Error('Failed to inject', name)
    }

    return service.load(this)
  }

  register (name, factory, { cleanup, persist, preload } = {}) {
    const service = new Service(factory, { cleanup, persist, preload })
    service.preload(this)
    this.services[name] = service
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
