# factsory

[![npm version](https://badge.fury.io/js/factsory.svg)](https://badge.fury.io/js/factsory)
[![GitHub version](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory.svg)](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory)
![validate](https://github.com/tiagocpeixoto/factsory/workflows/validate/badge.svg)
![dependencies](https://david-dm.org/tiagocpeixoto/factsory.svg)
![devDependencies](https://david-dm.org/tiagocpeixoto/factsory/dev-status.svg)

A kind of factory and DI patterns library targeted to Typescript.


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
        instantiate(): unknown {
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


### Container registration

- A class or almost any other object can be registered on the Container, which can be done in two ways:

1. registering a class (e.g. a factory class - see [Factory definition](#factory-definition) section):

   ``` ts
   Container.self.register(MyFactory);
   ```

1. registering a named creation function:

   ``` ts
   Container.self.registerNamed("MyFactory", () => "value");
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
    Container.self.register(MyFactory);
    Container.self.register(MyFactoryWithDependencies, {
      dependencies: [MyFactory],
    });
  
    // will print 'aValue'
    console.log(Container.self.get(MyFactoryWithDependencies)?.dep.create());
   ```

### Object claim from Container

- After registering a class or a named creation function, it can also be claimed in two ways: 

1. If it is a class, it can be claimed by the `Container.self.get` method:

   ``` ts
   Container.self.get(MyFactory);
   ```

1. If it's a named creation function, it can be claimed by the `Container.self.getNamed` method:

   ``` ts
   Container.self.getNamed("MyFactory");
   ```


### Lazy instance 

- It's possible to use the `LazyInstance` class to lazy initialize an object:

    ``` ts
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


