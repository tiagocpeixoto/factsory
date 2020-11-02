import faker from "faker";
import chai from "chai";
import chaiThings from "chai-things";
import chaiLike from "chai-like";
import { mock } from "jest-mock-extended";
import {
  Container,
  ContainerItemCreationArguments,
  ContainerItemCreationDependencies,
  ContainerItemNotFoundError,
  ContainerSpec,
  Factory,
  SimpleFactory,
} from "..";

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
    class TestFactory implements Factory {
      create(): string {
        return name;
      }
    }
    const name = TestFactory.name;

    it("test register item", function () {
      expect(Container.I.register(TestFactory)).toEqual(name);

      expect(() => Container.I.register(TestFactory)).toThrow(
        "already registered"
      );

      expect(Container.I.get(TestFactory)?.create()).toMatch(name);

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
      const anonymousRegister = Container.I.register(() => value);
      expect(anonymousRegister).toEqual("");

      expect(() => Container.I.register(() => value)).toThrow(
        "already registered"
      );
    });

    it("test register named item", function () {
      expect(Container.I.register(() => value, { name })).toEqual(name);
      expect(() => Container.I.register(() => value, { name })).toThrow(
        "already registered"
      );

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
        { creator: () => value, options: { name } },
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
          (params?: ContainerItemCreationArguments<string>) =>
            params?.args + "!",
          { name, args: param }
        )
      ).toEqual(name);
      expect(() =>
        Container.I.register(() => faker.lorem.word(), { name })
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
          creator: (params?: ContainerItemCreationArguments<string>) =>
            params?.args + "!",
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
      Container.I.register(NonSingletonFactory, { singleton: false });
    });

    it("test nom singleton creation", function () {
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
