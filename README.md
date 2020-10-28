# factsory

[![npm version](https://badge.fury.io/js/factsory.svg)](https://badge.fury.io/js/factsory)
[![GitHub version](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory.svg)](https://badge.fury.io/gh/tiagocpeixoto%2Ffactsory)
![validate](https://github.com/tiagocpeixoto/factsory/workflows/validate/badge.svg)

A kind of factory pattern library targeted to Typescript.

  
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
