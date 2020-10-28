# factsory

[![npm version](https://badge.fury.io/js/factsory.svg)](https://badge.fury.io/js/factsory)
[![GitHub version](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory.svg)](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory)
![validate](https://github.com/tiagocpeixoto/factsory/workflows/validate/badge.svg)

A kind of factory pattern library targeted to Typescript.


## Installation

To install **Factsory**, type the following:

- with NPM:

```
npm install factsory
```

- with YARN:

```
npm add factsory
```


## How to use

  
### Factory definition

- It's possible to define a factory in two ways:

1. extending the `DefaultFactory` class:

    ```
      class MyFactory extends DefaultFactory {
        instantiate(): unknown {
          return "value";
        }
      }
    ```

1. implementing the `Factory` interface:

   ```
      class MyFactory implements Factory {
        create(): string {
          return "value";
        }
      }
   ```


### Container registering

- A factory can be registered after its creation, which can be done in two ways:

1. registering a factory class that extends `DefaultFactory` class or implements `Factory` interface (see "Factory definition" section):

   ```
   Container.self.register(MyFactory);
   ```

1. registering a named factory method:

   ```
   Container.self.registerNamed("MyFactory", () => "value");
   ```


### Factory claim

- After registering the factory, it can also be claimed in two ways: 

1. If it is a class, it can be claimed by the `Container.self.get` method:

   ```
   Container.self.get(MyFactory);
   ```

1. If it isn't a class, it can be claimer be the `Container.self.getNamed` method:

   ```
   Container.self.getNamed("MyFactory");
   ```


### Lazy instance 

- It's possible to use the `LazyInstance` class to lazy initialize an object:

    ```
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = "initialized"));

    console.log(value);            // prints ""
    console.log(lazyInstance.get); // prints "initialized"
    console.log(value);            // prints "initialized"
    ```


## License

Copyright (c) 2020 Tiago da Costa Peixoto <tiagocpeixoto@gmail.com>

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


