import * as faker from "faker";
import { LazyInstance } from "..";

describe("lazy-instance tests", function () {
  it("test default create and get", function () {
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()));

    expect(value).toBeFalsy();
    const getValue = lazyInstance.get;
    expect(value).toBe(getValue);
  });

  it("test eager init", function () {
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()), {
      eagerInit: true,
    });

    expect(value).toBeTruthy();
    const getValue = lazyInstance.get;
    expect(value).toBe(getValue);
  });

  it("test named create and get", function () {
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

  it("test reset", function () {
    let counter = 0;
    const lazyInstance = new LazyInstance(() => ++counter);
    expect(lazyInstance.get).toBe(1);
    expect(counter).toBe(1);
    // again
    expect(lazyInstance.get).toBe(1);
    expect(counter).toBe(1);
    // reset
    lazyInstance.reset();
    expect(lazyInstance.get).toBe(2);
    expect(counter).toBe(2);
  });
});
