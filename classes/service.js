class Service {
  constructor (factory, { cleanup, persist, preload } = {}) {
    this._factoryFunction = factory
    this._cleanupFunction = cleanup
    this._persist = persist || preload || cleanup
    this._preload = preload
    this._instance = null
  }

  cleanup () {
    if (this._persist && this._cleanupFunction && this._instance) {
      this._cleanupFunction(this._instance)
    }
  }

  load (provider) {
    const inst = this._instance || this._factoryFunction(provider.injector)
    if (!this._instance && this._cleanupFunction) {
      provider.cleanupList.push(this)
    }
    if (this._persist) {
      this._instance = inst
    }
    return inst
  }

  preload (provider) {
    if (this._preload) {
      this.load(provider)
    }
  }
}

module.exports = Service
