# factsory <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[badge.fury.io]: <> "[![npm version](https://badge.fury.io/js/factsory.svg)](https://badge.fury.io/js/factsory)"
[badge.fury.io]: <> "[![GitHub version](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory.svg)](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory)"
[GitHub badge]: <> "![validate](https://github.com/tiagocpeixoto/factsory/workflows/validate/badge.svg)"
![npm version](https://img.shields.io/npm/v/factsory)
![GitHub package.json version](https://img.shields.io/github/package-json/v/tiagocpeixoto/factsory)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tiagocpeixoto/factsory/validate)
![dependencies](https://img.shields.io/librariesio/github/tiagocpeixoto/factsory)
![minzipped](https://img.shields.io/bundlephobia/minzip/factsory)
![license](https://img.shields.io/github/license/tiagocpeixoto/factsory)

A kind of factory and DI patterns library targeted to Typescript (w/o decorators).


## Topics

[Installation](#installation)  
[How to use](#how-to-use)  
[License](#license)  


## Installation

To install **Factsory**, type the following:

- with NPM:

``` bash
npm install factsory
```

- with YARN:

``` bash
yarn add factsory
```


## How to use

  
### Factory definition

- It's possible to define a factory in two ways:

1. extending the `DefaultFactory` class:

    ``` ts
      class MyFactory extends DefaultFactory<string> {
        instantiate(): string {
          return "value";
        }
      }
    ```

1. implementing the `Factory` interface:

   ``` ts
      class MyFactory implements Factory<string> {
        create(): string {
          return "value";
        }
      }
   ```


### Container instance

- To access the Container instance, just call the `Container.I` static method

- It's possible to define a customized Container implementation, useful for testing. You just need to implement 
  the `ContainerSpec` interface as in the following example (based on [jest-mock-extended](https://www.npmjs.com/package/jest-mock-extended)):

   ``` ts
   // using jest-mock-extended package
   const mockedSpec = mock<ContainerSpec>();
   Container.impl = mockedSpec;
  
   // To reset to the default implementation, just call reset()
   Container.reset();
   ```


### Container registration

- A class or almost any other object can be registered in the Container, which can be done in two ways:

1. registering a class (e.g. a factory class - see [Factory definition](#factory-definition) section):

   ``` ts
   // id = "MyFactory"
   Container.I.register(MyFactory);
   
   // or
   Container.I.register(MyFactory, { id: "MyFactoryCustomId" });
   ```

1. registering a creation function (factory method) using the ```createFactoryMethod```:

   ``` ts
   // id will be set to ""
   Container.I.register(createFactoryMethod(() => "value"));
   
   // or
   Container.I.register(createFactoryMethod(() => "value"), { id: "MyFactoryWithValue" });
   
   // or
   Container.I.register(createFactoryMethod((params?: CreationParameters) => params?.args), { id: "MyFactoryWithArgs", args: "value" });
   ```
   
- It's also possible to define dependencies, which will be injected during the object creation:
 
   ``` ts
    // the dependency
    class MyFactory extends DefaultFactory<string> {
      instantiate(): string {
        return "aValue";
      }
    }
  
    // the target of the dependency injection
    class MyFactoryWithDependencies extends DefaultFactory<string> {
      protected readonly myFactory: MyFactory;

      constructor(
        params?: ContainerItemCreationDependencies<{
          MyFactory: MyFactory;
        }>
      ) {
        super();
        if (params?.dependencies) {
          this.myFactory = params.dependencies.MyFactory;
        } else {
          throw new Error("Invalid dependencies");
        }

        if (!this.myFactory) {
          throw new Error("Invalid MyFactory dependency");
        }
      }
  
      get dep(): MyFactory {
        return this.myFactory;
      }

      instantiate(): string {
        return "MyuFactoryWithDependencies";
      }
    }  
  
    // registering objects
    Container.I.register(MyFactory);
    Container.I.register(MyFactoryWithDependencies, {
      dependencies: [MyFactory],
    });
  
    // will print 'aValue'
    console.log(Container.I.get(MyFactoryWithDependencies)?.dep.create());
   ```


### Object claim from Container

- After registering a class or a creation function (factory method), it can also be claimed in two ways: 

1. If it is a class, it can be claimed by the `Container.I.get` method using the class name as a parameter:

   ``` ts
   Container.I.get(MyFactory);
   ```

1. If it is a creation function, it can be claimed by the `Container.I.get` method using the registered name as a parameter:

   ``` ts
   Container.I.get("MyFactory");
   ```


### Lazy instance 

- It's possible to use the `LazyInstance` class to lazy initialize an object:

    ``` ts
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = "initialized"));

    console.log(value);          // prints ""
    console.log(lazyInstance.I); // prints "initialized"
    // or 
    console.log(lazyInstance.getI()); // prints "initialized"
    console.log(value);               // prints "initialized"
    ```


### Async Lazy instance

- It's possible to use the `AsyncLazyInstance` class to lazy initialize an object:

    ``` ts
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(async () => (value = "initialized"));

    console.log(value);                     // prints ""
    console.log(await asyncLazyInstance.I); // prints "initialized"
    // or 
    console.log(await asyncLazyInstance.getI()); // prints "initialized"
    console.log(value);                          // prints "initialized"
    ```

- It's also possible to use the `AsyncLazyInstance` class to lazy initialize an object with concurrency lock (mutex-like) control:

    ``` ts
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = "initialized"),
      /** 
       * Using async-mutex lib as an example 
       * @see https://www.npmjs.com/package/async-mutex
       */
      { lock: new Mutex() }
    );

    console.log(value);                     // prints ""
    console.log(await asyncLazyInstance.I); // prints "initialized"
    // or 
    console.log(await asyncLazyInstance.getI()); // prints "initialized"
    console.log(value);                          // prints "initialized"

## License

Copyright (c) 2022 Tiago da Costa Peixoto <tiagocpeixoto@gmail.com>

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

[package-url]: https://npmjs.org/package/factsory
[npm-version-svg]: https://versionbadg.es/tiagocpeixoto/factsory.svg