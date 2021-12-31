import chai from "chai";
import chaiLike from "chai-like";
import chaiThings from "chai-things";
import faker from "faker";
import { mock } from "jest-mock-extended";
import { Container, ContainerItemNotFoundError } from "../container";
import {
  ContainerSpec,
  CreationArguments,
  CreationDependencies,
} from "../container-spec";
import { createFactoryMethod, Factory, SimpleFactory } from "../factory";

describe("Container tests", function () {
  chai.should();
  chai.use(chaiLike);
  chai.use(chaiThings);

  describe("container spec implementation tests", function () {
    // const mockedSpec = jest.fn<ContainerSpec, never>(() => ({
    //   setConfig: jest
    //     .fn<void, [ContainerConfig]>()
    //     .mockImplementation((): void => {
    //       return;
    //     }),
    //
    //   registerAll: jest
    //     .fn<void, [Record<string, unknown>[]]>()
    //     .mockReturnThis(),
    //
    //   register: jest
    //     .fn<
    //       string,
    //       [
    //         ContainerItemCreator<never, never, never>,
    //         ContainerItemRegistrationOptions<never, never, never>
    //       ]
    //     >()
    //     .mockReturnThis(),
    //
    //   unregister: jest
    //     .fn<string, [ContainerItemId<never, never, never>]>()
    //     .mockReturnThis(),
    //
    //   getAll: jest
    //     .fn<
    //       ContainerItemsType,
    //       [ContainerItemId<never, never, never>[], ExistsConfig]
    //     >()
    //     .mockReturnThis(),
    //
    //   get: jest
    //     .fn<
    //       never | null,
    //       [ContainerItemId<never, never, never>, ExistsConfig]
    //     >()
    //     .mockReturnThis(),
    // }));
    const mockedSpec = mock<ContainerSpec>();

    it("test mocked spec", function () {
      Container.impl = mockedSpec;
      expect(Container.I).toBe(mockedSpec);
      expect(() => (Container.impl = mockedSpec)).toThrow(
        "The Container is already initialized"
      );
    });

    it("test reset", function () {
      Container.reset();
      expect(Container.I).not.toBe(mockedSpec);
    });
  });

  describe("container error tests", function () {
    it("test item not found", function () {
      const name = faker.lorem.word();
      const error = new ContainerItemNotFoundError(name);
      expect(error.containerItemName).toEqual(name);
    });
  });

  describe("register item without params tests", function () {
    const value = faker.lorem.word();
    class TestFactory implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      create = createFactoryMethod(() => name);
    }
    const name = TestFactory.name;

    it("test register item", function () {
      expect(Container.I.register(TestFactory)).toEqual(name);

      expect(() => Container.I.register(TestFactory)).toThrow(
        "already registered"
      );

      expect(Container.I.get(TestFactory)?.name).toMatch(name);

      expect(Container.I.unregister(TestFactory)).toEqual(name);
      expect(() => Container.I.unregister(TestFactory)).toThrow(
        "not registered"
      );

      expect(Container.I.get(TestFactory)).toBeFalsy();

      expect(() => Container.I.get(TestFactory, { checkExists: true })).toThrow(
        "not registered"
      );
    });

    it("test register empty name item", function () {
      const anonymousRegister = Container.I.register(
        createFactoryMethod(() => value)
      );
      expect(anonymousRegister).toBe("");

      expect(() =>
        Container.I.register(createFactoryMethod(() => value))
      ).toThrow("already registered");
    });

    it("test register named item", function () {
      expect(
        Container.I.register(
          createFactoryMethod(() => value),
          { name }
        )
      ).toEqual(name);
      expect(() =>
        Container.I.register(
          createFactoryMethod(() => value),
          { name }
        )
      ).toThrow("already registered");

      expect(Container.I.get(name)).toBe(value);

      expect(Container.I.unregister(name)).toEqual(name);
      expect(() => Container.I.unregister(name)).toThrow("not registered");

      expect(Container.I.get(name)).toBeFalsy();

      expect(() => Container.I.get(name, { checkExists: true })).toThrow(
        "not registered"
      );
    });

    it("test register all", function () {
      const name = faker.lorem.word();
      Container.I.registerAll([
        { creator: TestFactory },
        { creator: createFactoryMethod(() => value), options: { name } },
      ]);
      expect(Container.I.get(TestFactory)).toBeTruthy();
      expect(Container.I.get(name)).toBeTruthy();
      expect(
        Container.I.get(faker.lorem.word(), { checkExists: false })
      ).toBeFalsy();
    });

    it("test get named all", function () {
      const itemNotFoundName = faker.lorem.word();
      const name = faker.lorem.word();
      Container.I.registerAll([{ creator: TestFactory, options: { name } }]);

      const result = Container.I.getAll([itemNotFoundName, name], {
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
      readonly isFactory = true;
      readonly name = this.constructor.name;
      readonly #value?: string;

      constructor(params?: CreationArguments<string | undefined>) {
        this.#value = params?.args;
      }

      create = createFactoryMethod(() => this.#value);
    }
    const name = TestParamsFactory.name;
    const param = faker.lorem.word();

    it("test register item", function () {
      expect(Container.I.register(TestParamsFactory, { args: param })).toEqual(
        name
      );
      expect(() => Container.I.register(TestParamsFactory)).toThrow(
        "already registered"
      );

      expect(Container.I.get(TestParamsFactory)?.create()).toMatch(param);

      expect(Container.I.unregister(TestParamsFactory)).toEqual(name);
      expect(() => Container.I.unregister(TestParamsFactory)).toThrow(
        "not registered"
      );

      expect(Container.I.get(TestParamsFactory)).toBeFalsy();

      expect(() =>
        Container.I.get(TestParamsFactory, { checkExists: true })
      ).toThrow("not registered");
    });

    it("test register named item", function () {
      expect(
        Container.I.register(
          createFactoryMethod(
            (params?: CreationArguments<string>) => params?.args + "!"
          ),
          { name, args: param }
        )
      ).toEqual(name);
      expect(() =>
        Container.I.register(
          createFactoryMethod(() => faker.lorem.word()),
          { name }
        )
      ).toThrow("already registered");

      expect(Container.I.get(name)).toMatch(param + "!");

      expect(Container.I.unregister(name)).toEqual(name);
      expect(() => Container.I.unregister(name)).toThrow("not registered");

      expect(Container.I.get(name)).toBeFalsy();

      expect(() => Container.I.get(name, { checkExists: true })).toThrow(
        "not registered"
      );
    });

    it("test register all", function () {
      const name = faker.lorem.word();
      Container.I.registerAll([
        { creator: TestParamsFactory, options: { args: param } },
        {
          creator: createFactoryMethod(
            (params?: CreationArguments<string>) => params?.args + "!"
          ),
          options: { name, args: param },
        },
      ]);

      const result = Container.I.getAll([TestParamsFactory, name]);
      expect(
        (result[TestParamsFactory.name] as TestParamsFactory)?.create()
      ).toBe(param);
      expect(result[name]).toMatch(param + "!");

      expect(Container.I.get(TestParamsFactory)?.create()).toBe(param);
      expect(Container.I.get(name)).toMatch(param + "!");
    });
  });

  describe("Container singleton tests", function () {
    class SingletonFactory implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      readonly #value: string;

      constructor() {
        this.#value = faker.lorem.word();
      }

      create = createFactoryMethod((): string => this.#value);
    }

    beforeAll(function () {
      Container.I.register(SingletonFactory);
    });

    it("test singleton creation", function () {
      const factory1 = Container.I.get(SingletonFactory);
      expect(factory1).toBeTruthy();

      const value1 = factory1?.create();
      expect(value1).toBeTruthy();

      const factory2 = Container.I.get(SingletonFactory);
      expect(factory2).toBeTruthy();
      expect(factory2).toEqual(factory1);
      expect(factory2).toBe(factory1);

      const value2 = factory2?.create();
      expect(value2).toEqual(value1);
    });
  });

  describe("creation and get tests", function () {
    const factoryValue = faker.lorem.word();
    const constructorValue = faker.lorem.word();
    const factoryMethodValue = faker.lorem.word();

    class FactoryCreator implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      readonly value: string;

      constructor() {
        this.value = factoryValue;
      }
      create = createFactoryMethod((): string => this.value);
    }

    class ConstructorCreator {
      readonly value: string | undefined;

      constructor(params?: CreationArguments<string>) {
        this.value = params?.args;
      }
    }

    const factoryMethod = createFactoryMethod((): string => factoryMethodValue);
    const nullValueFactoryMethod = createFactoryMethod((): unknown => null);
    const failedFactoryMethod = createFactoryMethod((): string => {
      throw new Error("Failed");
    });

    beforeAll(function () {
      Container.I.register(FactoryCreator);
      Container.I.register(ConstructorCreator, {
        args: constructorValue,
      });
      Container.I.register(factoryMethod, { name: "factoryMethod" });
      Container.I.register(nullValueFactoryMethod, {
        name: "nullValueFactoryMethod",
      });
      Container.I.register(failedFactoryMethod, {
        name: "failedFactoryMethod",
      });
    });

    it("test successfully creation using factory", function () {
      expect(Container.I.get(FactoryCreator)?.create()).toEqual(factoryValue);
    });

    it("test successfully get using factory", function () {
      expect(Container.I.get(FactoryCreator)?.create()).toEqual(factoryValue);
    });

    it("test successfully creation using constructor", function () {
      expect(Container.I.get(ConstructorCreator)).toEqual({
        value: constructorValue,
      });
    });

    it("test successfully get using constructor", function () {
      expect(Container.I.get(ConstructorCreator)).toEqual({
        value: constructorValue,
      });
    });

    it("test successfully creation using factory method", function () {
      expect(Container.I.get("factoryMethod")).toEqual(factoryMethodValue);
    });

    it("test successfully get using factory method", function () {
      expect(Container.I.get("factoryMethod")).toEqual(factoryMethodValue);
    });

    it("test failed creation with null value", function () {
      expect(() => Container.I.get("nullValueFactoryMethod")).toThrow(
        "Could not create the instance"
      );
    });

    it("test failed creation with exception", function () {
      expect(() => Container.I.get("failedFactoryMethod")).toThrow("Failed");
    });
  });

  describe("Container non singleton tests", function () {
    class NonSingletonFactory implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      readonly #value: string;

      constructor() {
        this.#value = faker.lorem.word();
      }

      create = createFactoryMethod((): string => this.#value);
    }

    beforeAll(function () {
      Container.I.register(NonSingletonFactory, { singleton: false });
    });

    it("test non singleton creation", function () {
      const factory1 = Container.I.get(NonSingletonFactory);
      expect(factory1).toBeTruthy();

      const value1 = factory1?.create();
      expect(value1).toBeTruthy();

      const factory2 = Container.I.get(NonSingletonFactory);
      expect(factory2).toBeTruthy();
      expect(factory2).not.toEqual(factory1);

      const value2 = factory2?.create();
      expect(value2).not.toEqual(value1);
    });
  });

  describe("Container config tests", function () {
    it("test default config", function () {
      expect(Container.I.get(faker.lorem.word())).toBeFalsy();
    });

    it("test false checkExists", function () {
      Container.I.setConfig({ checkExists: false });
      expect(Container.I.get(faker.lorem.word())).toBeFalsy();
    });

    it("test true checkExists", function () {
      Container.I.setConfig({ checkExists: true });
      expect(() => Container.I.get(faker.lorem.word())).toThrow(
        "not registered"
      );
    });
  });

  describe("Container with dependencies tests", function () {
    const myFactoryDependencyValue = faker.lorem.word();
    const myFactoryDependantValue = faker.lorem.word();

    class MyFactoryDependency implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      create = createFactoryMethod((): string => myFactoryDependencyValue);
    }

    class MyFactoryDependant implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      protected readonly myFactoryDependency: MyFactoryDependency;

      constructor(
        params?: CreationDependencies<{
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

      create = createFactoryMethod((): string => myFactoryDependantValue);

      get dep(): MyFactoryDependency {
        return this.myFactoryDependency;
      }
    }

    beforeAll(function () {
      Container.I.register(MyFactoryDependency);
      Container.I.register(MyFactoryDependant, {
        dependencies: [MyFactoryDependency],
      });
    });

    it("test register item class", function () {
      expect(Container.I.get(MyFactoryDependency)).toBeTruthy();
      expect(Container.I.get(MyFactoryDependant)).toBeTruthy();
      expect(Container.I.get(MyFactoryDependant)?.dep).toBe(
        Container.I.get(MyFactoryDependency)
      );
    });

    it("test dependencies values", function () {
      expect(Container.I.get(MyFactoryDependency)?.create()).toBe(
        myFactoryDependencyValue
      );
      expect(Container.I.get(MyFactoryDependant)?.create()).toBe(
        myFactoryDependantValue
      );
    });
  });

  describe("Container with named dependencies tests", function () {
    const myFactoryNamedDependencyValue = faker.lorem.word();
    const myFactoryNamedDependantValue = faker.lorem.word();

    class MyFactoryNamedDependency implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      create = createFactoryMethod((): string => myFactoryNamedDependencyValue);
    }

    class MyFactoryNamedDependant implements Factory<string> {
      readonly isFactory = true;
      readonly name = this.constructor.name;
      protected readonly dependency: MyFactoryNamedDependency;

      constructor(
        params?: CreationDependencies<{
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

      create = createFactoryMethod((): string => myFactoryNamedDependantValue);

      get dep(): MyFactoryNamedDependency {
        return this.dependency;
      }
    }

    beforeAll(function () {
      Container.I.register(MyFactoryNamedDependency);
      Container.I.register(MyFactoryNamedDependant, {
        dependencies: ["MyFactoryNamedDependency"],
      });
    });

    it("test register item class", function () {
      expect(Container.I.get(MyFactoryNamedDependency)).toBeTruthy();
      expect(Container.I.get(MyFactoryNamedDependant)).toBeTruthy();
      expect(Container.I.get(MyFactoryNamedDependant)?.dep).toBe(
        Container.I.get(MyFactoryNamedDependency)
      );
    });

    it("test items values", function () {
      expect(Container.I.get(MyFactoryNamedDependency)?.create()).toBe(
        myFactoryNamedDependencyValue
      );
      expect(Container.I.get(MyFactoryNamedDependant)?.create()).toBe(
        myFactoryNamedDependantValue
      );
    });
  });
});
