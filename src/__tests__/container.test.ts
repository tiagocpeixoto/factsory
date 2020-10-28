import faker from "faker";
import { DefaultFactory, Factory } from "@root/factory";
import { Container } from "@root/container";

describe("Container tests", function () {
  describe("register item tests", function () {
    const name = "TestFactory";
    class TestFactory implements Factory {
      create(): string {
        return name;
      }
    }
    const factory = new TestFactory();

    it("test register item", function () {
      expect(Container.self.register(TestFactory)).toEqual(name);
      expect(() => Container.self.register(TestFactory)).toThrow(
        "already registered"
      );

      const createResult = Container.self.get(TestFactory)?.create();
      expect(createResult).toMatch(name);

      expect(Container.self.unregister(TestFactory)).toEqual(name);
      expect(() => Container.self.unregister(TestFactory)).toThrow(
        "not registered"
      );

      expect(Container.self.get(TestFactory)).toBeFalsy();

      expect(() => Container.self.get(TestFactory, true)).toThrow(
        "not registered"
      );
    });

    it("test register named item", function () {
      expect(Container.self.registerNamed(name, () => factory)).toEqual(name);
      expect(() => Container.self.registerNamed(name, () => factory)).toThrow(
        "already registered"
      );

      expect(Container.self.getNamed(name)).toBe(factory);

      expect(Container.self.unregisterNamed(name)).toEqual(name);
      expect(() => Container.self.unregisterNamed(name)).toThrow(
        "not registered"
      );

      expect(Container.self.getNamed(name)).toBeFalsy();

      expect(() => Container.self.getNamed(name, true)).toThrow(
        "not registered"
      );
    });
  });

  describe("Container singleton tests", function () {
    class SingletonFactory implements Factory {
      private readonly value = faker.lorem.word();
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
      expect(factory2).toBe(factory1);

      const value2 = factory2?.create();
      expect(value2).toBe(value1);
    });
  });

  describe("Container non singleton tests", function () {
    class SingletonFactory implements Factory {
      private readonly value = faker.lorem.word();
      create(): string {
        return this.value;
      }
    }

    beforeAll(function () {
      Container.self.register(SingletonFactory, { singleton: false });
    });

    it("test nom singleton creation", function () {
      const factory1 = Container.self.get(SingletonFactory);
      expect(factory1).toBeTruthy();

      const value1 = factory1?.create();
      expect(value1).toBeTruthy();

      const factory2 = Container.self.get(SingletonFactory);
      expect(factory2).toBeTruthy();
      expect(factory2).not.toBe(factory1);

      const value2 = factory2?.create();
      expect(value2).not.toBe(value1);
    });
  });

  describe("Container config tests", function () {
    it("test default config", function () {
      expect(Container.self.getNamed(faker.lorem.word())).toBeFalsy();
    });

    it("test false checkExists", function () {
      Container.self.setConfig({ checkExists: false });
      expect(Container.self.getNamed(faker.lorem.word())).toBeFalsy();
    });

    it("test true checkExists", function () {
      Container.self.setConfig({ checkExists: true });
      expect(() => Container.self.getNamed(faker.lorem.word())).toThrow(
        "not registered"
      );
    });
  });

  describe("readme tests", function () {
    const factoryName = faker.lorem.word();
    class MyFactory extends DefaultFactory {
      instantiate(): unknown {
        return "value";
      }
    }

    it("test register item class", function () {
      Container.self.register(MyFactory);
      expect(Container.self.get(MyFactory)).toBeTruthy();
    });

    it("test register named factory method", function () {
      Container.self.registerNamed(factoryName, () => "value");
      expect(Container.self.getNamed(factoryName)).toBeTruthy();
    });

    it("test claim class item", function () {
      const item = Container.self.get(MyFactory);
      expect(item).toBeTruthy();
    });

    it("test claim a item that is not a class", function () {
      const item = Container.self.getNamed(factoryName);
      expect(item).toBeTruthy();
    });
  });
});
