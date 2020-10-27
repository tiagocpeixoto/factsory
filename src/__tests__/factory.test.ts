import { Factories, Factory } from "@root/factory";

describe("factory tests", function () {
  const name = "factory";
  class TestFactory implements Factory {
    get get(): TestFactory {
      return this;
    }

    get name() {
      return "test-" + name;
    }
  }
  const factory = new TestFactory();

  it("test register factory", function () {
    expect(Factories.self.register(TestFactory)).toEqual("TestFactory");
    expect(() => Factories.self.register(TestFactory)).toThrow(
      "already registered"
    );

    expect(Factories.self.get(TestFactory)?.name).toMatch(name);

    expect(Factories.self.unregister(TestFactory)).toEqual("TestFactory");
    expect(() => Factories.self.unregister(TestFactory)).toThrow(
      "not registered"
    );

    expect(Factories.self.get(TestFactory)).toBeFalsy();

    expect(() => Factories.self.get(TestFactory, true)).toThrow(
      "not registered"
    );
  });

  it("test register named factory", function () {
    expect(Factories.self.registerNamed(name, () => factory)).toEqual(name);
    expect(() => Factories.self.registerNamed(name, () => factory)).toThrow(
      "already registered"
    );

    expect(Factories.self.getNamed(name)).toBe(factory);

    expect(Factories.self.unregisterNamed(name)).toEqual(name);
    expect(() => Factories.self.unregisterNamed(name)).toThrow(
      "not registered"
    );

    expect(Factories.self.getNamed(name)).toBeFalsy();

    expect(() => Factories.self.getNamed(name, true)).toThrow("not registered");
  });
});
