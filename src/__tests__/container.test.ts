import { faker } from "@faker-js/faker";
import chai from "chai";
import chaiLike from "chai-like";
import chaiThings from "chai-things";
import { mock } from "jest-mock-extended";
import { Container } from "../container";
import {
  ContainerSpec,
  CreationArguments,
  CreationDependencies,
} from "../container-spec";
import { ContainerItemNotFoundError } from "../errors/container-item-not-found-error";
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
        "The Container is already initialized",
      );
    });

    it("test reset", function () {
      Container.reset();
      expect(Container.I).not.toBe(mockedSpec);
    });
  });

  describe("container error tests", function () {
    it("test item not found", function () {
      const id = faker.lorem.word();
      const error = new ContainerItemNotFoundError(id);
      expect(error.containerItemId).toEqual(id);
    });
  });

  describe("register item without params tests", function () {
    const value = faker.lorem.word();
    class TestFactory implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      create = createFactoryMethod(() => id);
    }
    const id = TestFactory.name;

    it("test register item", function () {
      expect(Container.I.register(TestFactory)).toEqual(id);

      expect(() => Container.I.register(TestFactory)).toThrow(
        "already registered",
      );

      expect(Container.I.get(TestFactory)?.id).toMatch(id);

      expect(Container.I.unregister(TestFactory)).toEqual(id);
      expect(() => Container.I.unregister(TestFactory)).toThrow(
        "not registered",
      );

      expect(Container.I.get(TestFactory)).toBeFalsy();

      expect(() => Container.I.get(TestFactory, { checkExists: true })).toThrow(
        "not registered",
      );
    });

    it("test register without item id", function () {
      const anonymousRegister = Container.I.register(
        createFactoryMethod(() => value),
      );
      expect(anonymousRegister).toBe("");

      expect(() =>
        Container.I.register(createFactoryMethod(() => value)),
      ).toThrow("already registered");
    });

    it("test register with item id", function () {
      expect(
        Container.I.register(
          createFactoryMethod(() => value),
          { id },
        ),
      ).toEqual(id);
      expect(() =>
        Container.I.register(
          createFactoryMethod(() => value),
          { id },
        ),
      ).toThrow("already registered");

      expect(Container.I.get(id)).toBe(value);

      expect(Container.I.unregister(id)).toEqual(id);
      expect(() => Container.I.unregister(id)).toThrow("not registered");

      expect(Container.I.get(id)).toBeFalsy();

      expect(() => Container.I.get(id, { checkExists: true })).toThrow(
        "not registered",
      );
    });

    it("test register with symbol item id", function () {
      const id = Symbol.for("id");

      expect(
        Container.I.register(
          createFactoryMethod(() => value),
          { id },
        ),
      ).toEqual(id);
      expect(() =>
        Container.I.register(
          createFactoryMethod(() => value),
          { id },
        ),
      ).toThrow("already registered");

      expect(Container.I.get(id)).toBe(value);

      expect(Container.I.unregister(id)).toEqual(id);
      expect(() => Container.I.unregister(id)).toThrow("not registered");

      expect(Container.I.get(id)).toBeFalsy();

      expect(() => Container.I.get(id, { checkExists: true })).toThrow(
        "not registered",
      );
    });

    it("test register all", function () {
      const id = faker.lorem.word();
      Container.I.registerAll([
        { creator: TestFactory },
        { creator: createFactoryMethod(() => value), options: { id } },
      ]);
      expect(Container.I.get(TestFactory)).toBeTruthy();
      expect(Container.I.get(id)).toBeTruthy();
      expect(
        Container.I.get(faker.lorem.word(), { checkExists: false }),
      ).toBeFalsy();
    });

    it("test get all", function () {
      const itemNotFoundId = faker.lorem.word();
      const id = faker.lorem.word();
      Container.I.registerAll([{ creator: TestFactory, options: { id } }]);

      const result = Container.I.getAll([itemNotFoundId, id], {
        checkExists: false,
      });
      expect(result[itemNotFoundId]).toBeInstanceOf(ContainerItemNotFoundError);
      expect(result[id]).toBeInstanceOf(TestFactory);

      result.should.have
        .property(itemNotFoundId)
        .instanceOf(ContainerItemNotFoundError);
      result.should.have.property(id).instanceOf(TestFactory);
    });

    it("test clear", function () {
      const itemNotFoundId = faker.lorem.word();
      const id = faker.lorem.word();
      Container.I.registerAll([{ creator: TestFactory, options: { id } }]);

      const result = Container.I.getAll([itemNotFoundId, id], {
        checkExists: false,
      });
      expect(result[itemNotFoundId]).toBeInstanceOf(ContainerItemNotFoundError);
      expect(result[id]).toBeInstanceOf(TestFactory);

      result.should.have
        .property(itemNotFoundId)
        .instanceOf(ContainerItemNotFoundError);
      result.should.have.property(id).instanceOf(TestFactory);

      Container.I.clear();
      const emptyResult = Container.I.getAll([itemNotFoundId, id], {
        checkExists: false,
      });
      expect(emptyResult[itemNotFoundId]).toBeInstanceOf(
        ContainerItemNotFoundError,
      );
      expect(emptyResult[id]).toBeInstanceOf(ContainerItemNotFoundError);

      emptyResult.should.have
        .property(itemNotFoundId)
        .instanceOf(ContainerItemNotFoundError);
      emptyResult.should.have
        .property(id)
        .instanceOf(ContainerItemNotFoundError);
    });
  });

  describe("register item with params tests", function () {
    class TestParamsFactory implements SimpleFactory<string | undefined> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      readonly #value?: string;

      constructor(params?: CreationArguments<string | undefined>) {
        this.#value = params?.args;
      }

      create = createFactoryMethod(() => this.#value);
    }
    const id = TestParamsFactory.name;
    const param = faker.lorem.word();

    it("test register item", function () {
      expect(Container.I.register(TestParamsFactory, { args: param })).toEqual(
        id,
      );
      expect(() => Container.I.register(TestParamsFactory)).toThrow(
        "already registered",
      );

      expect(Container.I.get(TestParamsFactory)?.create()).toMatch(param);

      expect(Container.I.unregister(TestParamsFactory)).toEqual(id);
      expect(() => Container.I.unregister(TestParamsFactory)).toThrow(
        "not registered",
      );

      expect(Container.I.get(TestParamsFactory)).toBeFalsy();

      expect(() =>
        Container.I.get(TestParamsFactory, { checkExists: true }),
      ).toThrow("not registered");
    });

    it("test register with item id", function () {
      expect(
        Container.I.register(
          createFactoryMethod(
            (params?: CreationArguments<string>) => params?.args + "!",
          ),
          { id, args: param },
        ),
      ).toEqual(id);
      expect(() =>
        Container.I.register(
          createFactoryMethod(() => faker.lorem.word()),
          { id },
        ),
      ).toThrow("already registered");

      expect(Container.I.get(id)).toMatch(param + "!");

      expect(Container.I.unregister(id)).toEqual(id);
      expect(() => Container.I.unregister(id)).toThrow("not registered");

      expect(Container.I.get(id)).toBeFalsy();

      expect(() => Container.I.get(id, { checkExists: true })).toThrow(
        "not registered",
      );
    });

    it("test register all", function () {
      const id = faker.lorem.word();
      Container.I.registerAll([
        { creator: TestParamsFactory, options: { args: param } },
        {
          creator: createFactoryMethod(
            (params?: CreationArguments<string>) => params?.args + "!",
          ),
          options: { id, args: param },
        },
      ]);

      const result = Container.I.getAll([TestParamsFactory, id]);
      expect(
        (result[TestParamsFactory.name] as TestParamsFactory)?.create(),
      ).toBe(param);
      expect(result[id]).toMatch(param + "!");

      expect(Container.I.get(TestParamsFactory)?.create()).toBe(param);
      expect(Container.I.get(id)).toMatch(param + "!");
    });
  });

  describe("Container singleton tests", function () {
    class SingletonFactory implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
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
      readonly id = this.constructor.name;
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
      Container.I.register(factoryMethod, { id: "factoryMethod" });
      Container.I.register(nullValueFactoryMethod, {
        id: "nullValueFactoryMethod",
      });
      Container.I.register(failedFactoryMethod, {
        id: "failedFactoryMethod",
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
        "Could not create the instance",
      );
    });

    it("test failed creation with exception", function () {
      expect(() => Container.I.get("failedFactoryMethod")).toThrow("Failed");
    });
  });

  describe("Container non singleton tests", function () {
    class NonSingletonFactory implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
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
    beforeAll(function () {
      Container.I.clear();
    });

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
        "not registered",
      );
    });
  });

  describe("Container with dependencies tests", function () {
    const myFactoryDependencyValue = faker.lorem.word();
    const myFactoryDependantValue = faker.lorem.word();

    class MyFactoryDependency implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      create = createFactoryMethod((): string => myFactoryDependencyValue);
    }

    class MyFactoryDependant implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      protected readonly myFactoryDependency: MyFactoryDependency;

      constructor(
        params?: CreationDependencies<{
          MyFactoryDependency: MyFactoryDependency;
        }>,
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
        Container.I.get(MyFactoryDependency),
      );
    });

    it("test dependencies values", function () {
      expect(Container.I.get(MyFactoryDependency)?.create()).toBe(
        myFactoryDependencyValue,
      );
      expect(Container.I.get(MyFactoryDependant)?.create()).toBe(
        myFactoryDependantValue,
      );
    });
  });

  describe("Container with identifiable dependencies tests", function () {
    const myFactoryIdentifiableDependencyValue = faker.lorem.word();
    const myFactoryIdentifiableDependantValue = faker.lorem.word();

    class MyFactoryIdentifiableDependency implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      create = createFactoryMethod(
        (): string => myFactoryIdentifiableDependencyValue,
      );
    }

    class MyFactoryIdentifiableDependant implements Factory<string> {
      readonly isFactory = true;
      readonly id = this.constructor.name;
      protected readonly dependency: MyFactoryIdentifiableDependency;

      constructor(
        params?: CreationDependencies<{
          MyFactoryIdentifiableDependency: MyFactoryIdentifiableDependency;
        }>,
      ) {
        if (params?.dependencies) {
          this.dependency = params.dependencies.MyFactoryIdentifiableDependency;
        } else {
          throw new Error("Invalid dependencies");
        }

        if (!this.dependency) {
          throw new Error("Invalid MyFactoryIdentifiableDependency dependency");
        }
      }

      create = createFactoryMethod(
        (): string => myFactoryIdentifiableDependantValue,
      );

      get dep(): MyFactoryIdentifiableDependency {
        return this.dependency;
      }
    }

    beforeAll(function () {
      Container.I.register(MyFactoryIdentifiableDependency);
      Container.I.register(MyFactoryIdentifiableDependant, {
        dependencies: ["MyFactoryIdentifiableDependency"],
      });
    });

    it("test register item class", function () {
      expect(Container.I.get(MyFactoryIdentifiableDependency)).toBeTruthy();
      expect(Container.I.get(MyFactoryIdentifiableDependant)).toBeTruthy();
      expect(Container.I.get(MyFactoryIdentifiableDependant)?.dep).toBe(
        Container.I.get(MyFactoryIdentifiableDependency),
      );
    });

    it("test items values", function () {
      expect(Container.I.get(MyFactoryIdentifiableDependency)?.create()).toBe(
        myFactoryIdentifiableDependencyValue,
      );
      expect(Container.I.get(MyFactoryIdentifiableDependant)?.create()).toBe(
        myFactoryIdentifiableDependantValue,
      );
    });
  });
});
