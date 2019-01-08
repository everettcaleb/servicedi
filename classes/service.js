class Service {
  constructor (factory, { cleanup, persist, preload } = {}) {
    if(!factory || typeof factory !== 'function') {
      throw new Error('Factory function must be provided')
    }
    if(cleanup && typeof cleanup !== 'function') {
      throw new Error('Cleanup option must be a function if provided')
    }
    this._factoryFunction = factory
    this._cleanupFunction = cleanup
    this._persist = persist || preload || cleanup
    this._preload = preload
    this._instance = null
  }

  cleanup () {
    if (this._cleanupFunction && this._instance) {
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
      return this.load(provider)
    }
  }
}

module.exports = Service
