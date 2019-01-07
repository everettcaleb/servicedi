# Service DI
Node.js service dependency injection made easy.

[![Build Status](https://travis-ci.com/everettcaleb/servicedi.svg?branch=master)](https://travis-ci.com/everettcaleb/servicedi)
[![Coverage Status](https://coveralls.io/repos/github/everettcaleb/servicedi/badge.svg?branch=master)](https://coveralls.io/github/everettcaleb/servicedi?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/1ce452810a2b04aa2832/maintainability)](https://codeclimate.com/github/everettcaleb/servicedi/maintainability)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Installation
Just run the following command:

    npm install servicedi --save

# How It Works
Basically, an application can create a `ServiceProvider` instance which acts as an [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control) container. You can register constants, factory functions, or constructors with it and it provides an "injector" that resolves dependencies when a getter is called or it is destructured. See below for documentation and usage examples.

# Classes
## ServiceProvider class

- `constructor()`: The constructor, nothing special
- `cleanup()`: Runs all registered `cleanup` functions (finalizers) in reverse registration order and clears registered services
- `get(name)`: Gets a registered service instance by name, throws an Error if it cannot find a registered service with that name
- `injector`: `Proxy` object that allows you to get services using destructuring or direct getters
- `register(name, factory, options)`: Registers a service, see below for registration options
- `registerConst(name, val, options)`: Registers a constant value as a service (by name), see below for registration options
- `registerConstructor(Class, options)`: Registers a constructor as a service (converts the name to camelCase, ex: `MyService` is registered as `myService`), see below for registration options

### Registration Options

- `cleanup`: Function, acts as a finalizer to run when `ServiceProvider.prototype.cleanup()` is called
- `persist`: Boolean value (default: false), whether to store the constructed instance of a service after it's been constructed (not applicable for constants)
- `preload`: Boolean value (default: false), whether to immediately construct a service instance (implies `persist: true`, not applicable for constants)

# Usage
Here's a quick example that demonstrates the main idea:

    const { ServiceProvider } = require('servicedi')
    const sp = new ServiceProvider()

Then you register a factory and constant:

    sp.register('myService', () => ({ hello: () => console.log('Hello, world!') }))
    sp.registerConst('myConstant', 50)

We can resolve them using destructuring:

    const { myService, myConstant } = sp.injector

Or we can resolve them using a "getter":

    const myService2 = sp.injector.myService

And every call to a factory constructs a new instance so this will print `NOT EQUAL!`:

    if (myService !== myService2) {
      console.log('NOT EQUAL!')
    }

But we can make a persistent (singleton) service as well by passing `{ persist: true }` as an option:

    sp.register('myPersistentService', () => ({ hello: () => console.log('Persistent hello') }), { persist: true })

We can also make it preload the service (run the factory immediately) by passing `{ preload: true }` as an option. This implies `{ persist: true }` though, so keep that in mind.

    sp.register('myPreloadedService', () => ({ hello: () => console.log('Preloaded hello') }), { preload: true/*, persist: true*/ })

There's also syntactic sugar for registering a service constructor:

    sp.registerConstructor(MyClassService)

When you're done, if you're using finalizers, you can clean up all the services and clear the `ServiceProvider` using:

    sp.cleanup()

Here's a full example:

    // Include the library and create a service provider
    const { ServiceProvider } = require('servicedi')
    const sp = new ServiceProvider()

    // Let's define a service that needs a "barService"
    class FooService {
      constructor({ barService }) {
        console.log('FooService ctor')
        this.barService = barService
      }

      doFoo() {
        console.log('FOO')
        this.barService.doBar()
      }
    }

    // Let's define another service
    class BarService {
      constructor() {
        console.log('BarService ctor')
      }

      doBar() {
        console.log('BAR')
      }
    }

    // Let's define a controller (that would probably be used by routing) that needs
    // a "fooService", "barService", and "LIFE"
    class MyController {
      constructor({ fooService, barService, LIFE }) {
        console.log('MyController ctor')
        this.life = LIFE
        this.fooService = fooService
        this.barService = barService
      }

      doFooBar() {
        console.log('FOOBARBAR')
        console.log(this.life)
        this.fooService.doFoo()
        this.barService.doBar()
      }
    }

    // TEST CODE
    // Let's register the services (and constant for LIFE) using all 3 ways
    sp.registerConst('LIFE', 42)
    sp.registerConstructor(BarService, { persist: true, cleanup: () => console.log('CLEAN BAR') })
    sp.register('fooService', injector => new FooService(injector), { cleanup: () => console.log('CLEAN FOO')})

    // Let's load controller and run the logic
    const ctrl = new MyController(sp.injector)
    ctrl.doFooBar()

    // And cleanup after (to see if our cleanup functions get called)
    sp.cleanup()

# Pull Requests, Issues, etc.
Feel free to submit any feature requests, pull requests, or issues and I may get to them when I can.

# License
MIT License

Copyright &copy; 2019 Caleb Everett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
