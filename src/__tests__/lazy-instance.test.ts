import { LazyInstance } from "..";
import * as faker from "faker";

describe("lazy-instance tests", function () {
  it("test default create and get lazy-instance", function () {
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()));

    const getValue = lazyInstance.get;
    expect(value).toBe(getValue);
  });

  it("test named create and get from lazy-instance", function () {
    const name = faker.lorem.word();
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()), {
      name,
    });
    expect(value).toBeFalsy();

    const getValue = lazyInstance.get;
    expect(value).toBe(getValue);

    expect(lazyInstance.instanceName).toMatch(name);
  });

  describe("readme tests", function () {
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
