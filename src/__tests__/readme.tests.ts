import {
  Container,
  createFactoryMethod,
  CreationDependencies,
  DefaultFactory,
  Factory,
  LazyInstance,
} from "..";

describe("readme tests", function () {
  describe("container registration tests", function () {
    it("test register creation functions", function () {
      Container.I.register(
        createFactoryMethod(() => "value"),
        { name: "MyFactoryWithValue" }
      );
      expect(Container.I.get("MyFactoryWithValue")).toBe("value");

      Container.I.register(
        createFactoryMethod((params) => params?.args),
        { name: "MyFactoryWithArgs", args: "value" }
      );
      expect(Container.I.get("MyFactoryWithArgs")).toBe("value");
    });
  });

  describe("container tests", function () {
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
        params?: CreationDependencies<{
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

    beforeAll(function () {
      Container.I.register(MyFactory);
      Container.I.register(MyFactoryWithDependencies, {
        dependencies: [MyFactory],
      });

      console.log(Container.I.get(MyFactoryWithDependencies)?.dep.create());
    });

    it("test register item class", function () {
      expect(Container.I.get(MyFactory)).toBeTruthy();
      expect(Container.I.get(MyFactoryWithDependencies)).toBeTruthy();
      expect(Container.I.get(MyFactoryWithDependencies)?.dep).toBe(
        Container.I.get(MyFactory)
      );
    });
  });

  describe("factory tests", function () {
    it("test extending DefaultFactory", function () {
      class MyFactory extends DefaultFactory {
        instantiate(): unknown {
          return "value";
        }
      }

      expect(new MyFactory().create()).toBe("value");
    });

    it("test implementing Factory", function () {
      class MyFactory implements Factory<string> {
        readonly name = this.constructor.name;
        create = createFactoryMethod(() => "value");
      }

      expect(new MyFactory().create()).toBe("value");
    });
  });

  describe("lazy-I tests", function () {
    it("test readme", function () {
      let value = "";

      const lazyInstance = new LazyInstance(() => (value = "initialized"));

      // console.log(value); // prints ""
      // console.log(lazyInstance.get); // prints "initialized"
      // console.log(value); // prints "initialized"

      expect(value).toBe("");
      expect(lazyInstance.get).toBe("initialized");
      expect(value).toBe("initialized");
    });
  });
});
