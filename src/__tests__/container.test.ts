import faker from "faker";
import chai from "chai";
import chaiThings from "chai-things";
import chaiLike from "chai-like";
import {
  Container,
  ContainerItemCreationArguments,
  ContainerItemCreationDependencies,
  ContainerItemNotFoundError,
  Factory,
  SimpleFactory,
} from "..";

describe("Container tests", function () {
  chai.should();
  chai.use(chaiLike);
  chai.use(chaiThings);

  describe("container error tests", function () {
    it("test item not found", function () {
      const name = faker.lorem.word();
      const error = new ContainerItemNotFoundError(name);
      expect(error.containerItemName).toEqual(name);
    });
  });

  describe("register item without params tests", function () {
    const value = faker.lorem.word();
    class TestFactory implements Factory {
      create(): string {
        return name;
      }
    }
    const name = TestFactory.name;

    it("test register item", function () {
      expect(Container.self.register(TestFactory)).toEqual(name);
      expect(() => Container.self.register(TestFactory)).toThrow(
        "already registered"
      );

      expect(Container.self.get(TestFactory)?.create()).toMatch(name);

      expect(Container.self.unregister(TestFactory)).toEqual(name);
      expect(() => Container.self.unregister(TestFactory)).toThrow(
        "not registered"
      );

      expect(Container.self.get(TestFactory)).toBeFalsy();

      expect(() =>
        Container.self.get(TestFactory, { checkExists: true })
      ).toThrow("not registered");
    });

    it("test register named item", function () {
      expect(Container.self.register(() => value, { name })).toEqual(name);
      expect(() => Container.self.register(() => value, { name })).toThrow(
        "already registered"
      );

      expect(Container.self.get(name)).toBe(value);

      expect(Container.self.unregister(name)).toEqual(name);
      expect(() => Container.self.unregister(name)).toThrow("not registered");

      expect(Container.self.get(name)).toBeFalsy();

      expect(() => Container.self.get(name, { checkExists: true })).toThrow(
        "not registered"
      );
    });

    it("test register all", function () {
      const name = faker.lorem.word();
      Container.self.registerAll([
        { creator: TestFactory },
        { creator: () => value, options: { name } },
      ]);
      expect(Container.self.get(TestFactory)).toBeTruthy();
      expect(Container.self.get(name)).toBeTruthy();
      expect(
        Container.self.get(faker.lorem.word(), { checkExists: false })
      ).toBeFalsy();
    });

    it("test get named all", function () {
      const itemNotFoundName = faker.lorem.word();
      const name = faker.lorem.word();
      Container.self.registerAll([{ creator: TestFactory, options: { name } }]);

      const result = Container.self.getAll([itemNotFoundName, name], {
        checkExists: false,
      });
      expect(result[itemNotFoundName]).toBeInstanceOf(
        ContainerItemNotFoundError
      );
      expect(result[name]).toBeInstanceOf(TestFactory);

      result.should.have
        .property(itemNotFoundName)
        .instanceOf(ContainerItemNotFoundError);
      result.should.have.property(name).instanceOf(TestFactory);
    });
  });

  describe("register item with params tests", function () {
    class TestParamsFactory implements SimpleFactory<string | undefined> {
      private readonly value?: string;

      constructor(params?: ContainerItemCreationArguments<string>) {
        // if (!params || !params.args) {
        //   throw new Error("Invalid arguments");
        // }
        this.value = params?.args;
      }

      create(): string | undefined {
        return this.value;
      }
    }
    const name = TestParamsFactory.name;
    const param = faker.lorem.word();

    it("test register item", function () {
      expect(
        Container.self.register(TestParamsFactory, { args: param })
      ).toEqual(name);
      expect(() => Container.self.register(TestParamsFactory)).toThrow(
        "already registered"
      );

      expect(Container.self.get(TestParamsFactory)?.create()).toMatch(param);

      expect(Container.self.unregister(TestParamsFactory)).toEqual(name);
      expect(() => Container.self.unregister(TestParamsFactory)).toThrow(
        "not registered"
      );

      expect(Container.self.get(TestParamsFactory)).toBeFalsy();

      expect(() =>
        Container.self.get(TestParamsFactory, { checkExists: true })
      ).toThrow("not registered");
    });

    it("test register named item", function () {
      expect(
        Container.self.register(
          (params?: ContainerItemCreationArguments<string>) =>
            params?.args + "!",
          { name, args: param }
        )
      ).toEqual(name);
      expect(() =>
        Container.self.register(() => faker.lorem.word(), { name })
      ).toThrow("already registered");

      expect(Container.self.get(name)).toMatch(param + "!");

      expect(Container.self.unregister(name)).toEqual(name);
      expect(() => Container.self.unregister(name)).toThrow("not registered");

      expect(Container.self.get(name)).toBeFalsy();

      expect(() => Container.self.get(name, { checkExists: true })).toThrow(
        "not registered"
      );
    });

    it("test register all", function () {
      const name = faker.lorem.word();
      Container.self.registerAll([
        { creator: TestParamsFactory, options: { args: param } },
        {
          creator: (params?: ContainerItemCreationArguments<string>) =>
            params?.args + "!",
          options: { name, args: param },
        },
      ]);

      const result = Container.self.getAll([TestParamsFactory, name]);
      expect(
        (result[TestParamsFactory.name] as TestParamsFactory)?.create()
      ).toBe(param);
      expect(result[name]).toMatch(param + "!");

      expect(Container.self.get(TestParamsFactory)?.create()).toBe(param);
      expect(Container.self.get(name)).toMatch(param + "!");
    });
  });

  describe("Container singleton tests", function () {
    class SingletonFactory implements Factory {
      private readonly value: string;

      constructor() {
        this.value = faker.lorem.word();
      }

      create(): string {
        return this.value;
      }
    }

    beforeAll(function () {
      Container.self.register(SingletonFactory);
    });

    it("test singleton creation", function () {
      const factory1 = Container.self.get(SingletonFactory);
      expect(factory1).toBeTruthy();

      const value1 = factory1?.create();
      expect(value1).toBeTruthy();

      const factory2 = Container.self.get(SingletonFactory);
      expect(factory2).toBeTruthy();
      expect(factory2).toEqual(factory1);

      const value2 = factory2?.create();
      expect(value2).toEqual(value1);
    });
  });

  describe("Container non singleton tests", function () {
    class NonSingletonFactory implements Factory {
      private readonly value: string;

      constructor() {
        this.value = faker.lorem.word();
      }

      create(): string {
        return this.value;
      }
    }

    beforeAll(function () {
      Container.self.register(NonSingletonFactory, { singleton: false });
    });

    it("test nom singleton creation", function () {
      const factory1 = Container.self.get(NonSingletonFactory);
      expect(factory1).toBeTruthy();

      const value1 = factory1?.create();
      expect(value1).toBeTruthy();

      const factory2 = Container.self.get(NonSingletonFactory);
      expect(factory2).toBeTruthy();
      expect(factory2).not.toEqual(factory1);

      const value2 = factory2?.create();
      expect(value2).not.toEqual(value1);
    });
  });

  describe("Container config tests", function () {
    it("test default config", function () {
      expect(Container.self.get(faker.lorem.word())).toBeFalsy();
    });

    it("test false checkExists", function () {
      Container.self.setConfig({ checkExists: false });
      expect(Container.self.get(faker.lorem.word())).toBeFalsy();
    });

    it("test true checkExists", function () {
      Container.self.setConfig({ checkExists: true });
      expect(() => Container.self.get(faker.lorem.word())).toThrow(
        "not registered"
      );
    });
  });

  describe("Container with dependencies tests", function () {
    const myFactoryDependencyValue = faker.lorem.word();
    const myFactoryDependantValue = faker.lorem.word();

    class MyFactoryDependency implements Factory<string> {
      create(): string {
        return myFactoryDependencyValue;
      }
    }

    class MyFactoryDependant implements Factory<string> {
      protected readonly myFactoryDependency: MyFactoryDependency;

      constructor(
        params?: ContainerItemCreationDependencies<{
          MyFactoryDependency: MyFactoryDependency;
        }>
      ) {
        if (params?.dependencies) {
          this.myFactoryDependency = params.dependencies.MyFactoryDependency;
        } else {
          throw new Error("Invalid dependencies");
        }

        if (!this.myFactoryDependency) {
          throw new Error("Invalid MyFactoryDependency dependency");
        }
      }

      create(): string {
        return myFactoryDependantValue;
      }

      get dep(): MyFactoryDependency {
        return this.myFactoryDependency;
      }
    }

    beforeAll(function () {
      Container.self.register(MyFactoryDependency);
      Container.self.register(MyFactoryDependant, {
        dependencies: [MyFactoryDependency],
      });
    });

    it("test register item class", function () {
      expect(Container.self.get(MyFactoryDependency)).toBeTruthy();
      expect(Container.self.get(MyFactoryDependant)).toBeTruthy();
      expect(Container.self.get(MyFactoryDependant)?.dep).toBe(
        Container.self.get(MyFactoryDependency)
      );
    });

    it("test dependencies values", function () {
      expect(Container.self.get(MyFactoryDependency)?.create()).toBe(
        myFactoryDependencyValue
      );
      expect(Container.self.get(MyFactoryDependant)?.create()).toBe(
        myFactoryDependantValue
      );
    });
  });

  describe("Container with named dependencies tests", function () {
    const myFactoryNamedDependencyValue = faker.lorem.word();
    const myFactoryNamedDependantValue = faker.lorem.word();

    class MyFactoryNamedDependency implements Factory<string> {
      create(): string {
        return myFactoryNamedDependencyValue;
      }
    }

    class MyFactoryNamedDependant implements Factory<string> {
      protected readonly dependency: MyFactoryNamedDependency;

      constructor(
        params?: ContainerItemCreationDependencies<{
          MyFactoryNamedDependency: MyFactoryNamedDependency;
        }>
      ) {
        if (params?.dependencies) {
          this.dependency = params.dependencies.MyFactoryNamedDependency;
        } else {
          throw new Error("Invalid dependencies");
        }

        if (!this.dependency) {
          throw new Error("Invalid MyFactoryNamedDependency dependency");
        }
      }

      create(): string {
        return myFactoryNamedDependantValue;
      }

      get dep(): MyFactoryNamedDependency {
        return this.dependency;
      }
    }

    beforeAll(function () {
      Container.self.register(MyFactoryNamedDependency);
      Container.self.register(MyFactoryNamedDependant, {
        dependencies: ["MyFactoryNamedDependency"],
      });
    });

    it("test register item class", function () {
      expect(Container.self.get(MyFactoryNamedDependency)).toBeTruthy();
      expect(Container.self.get(MyFactoryNamedDependant)).toBeTruthy();
      expect(Container.self.get(MyFactoryNamedDependant)?.dep).toBe(
        Container.self.get(MyFactoryNamedDependency)
      );
    });

    it("test items values", function () {
      expect(Container.self.get(MyFactoryNamedDependency)?.create()).toBe(
        myFactoryNamedDependencyValue
      );
      expect(Container.self.get(MyFactoryNamedDependant)?.create()).toBe(
        myFactoryNamedDependantValue
      );
    });
  });
});
