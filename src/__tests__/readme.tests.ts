import { DefaultFactory, Factory } from "../factory";
import { Container, ContainerItemCreationDependencies } from "../container";
import { LazyInstance } from "../lazy-instance";

describe("readme tests", function () {
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

    beforeAll(function () {
      Container.self.register(MyFactory);
      Container.self.register(MyFactoryWithDependencies, {
        dependencies: [MyFactory],
      });

      console.log(Container.self.get(MyFactoryWithDependencies)?.dep.create());
    });

    it("test register item class", function () {
      expect(Container.self.get(MyFactory)).toBeTruthy();
      expect(Container.self.get(MyFactoryWithDependencies)).toBeTruthy();
      expect(Container.self.get(MyFactoryWithDependencies)?.dep).toBe(
        Container.self.get(MyFactory)
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
      class MyFactory implements Factory {
        create(): string {
          return "value";
        }
      }

      expect(new MyFactory().create()).toBe("value");
    });
  });

  describe("lazy-instance tests", function () {
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
