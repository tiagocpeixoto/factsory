import * as faker from "faker";
import { LazyInstance } from "..";

describe("lazy-instance tests", function () {
  it("test default create and get", function () {
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()));

    expect(value).toBeFalsy();
    const getValue1 = lazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = lazyInstance.getI();
    expect(value).toBe(getValue2);
  });

  it("test eager init", function () {
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()), {
      eagerInit: true,
    });

    expect(value).toBeTruthy();
    const getValue1 = lazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = lazyInstance.getI();
    expect(value).toBe(getValue2);
  });

  it("test named create and get", function () {
    const name = faker.lorem.word();
    let value = "";

    const lazyInstance = new LazyInstance(() => (value = faker.lorem.word()), {
      name,
    });
    expect(value).toBeFalsy();

    const getValue1 = lazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = lazyInstance.I;
    expect(value).toBe(getValue2);

    expect(lazyInstance.instanceName).toMatch(name);
  });

  it("test reset", function () {
    let counter = 0;
    const lazyInstance = new LazyInstance(() => ++counter);
    expect(lazyInstance.I).toBe(1);
    expect(lazyInstance.getI()).toBe(1);
    expect(counter).toBe(1);
    // again
    expect(lazyInstance.I).toBe(1);
    expect(lazyInstance.getI()).toBe(1);
    expect(counter).toBe(1);
    // reset
    lazyInstance.reset();
    expect(lazyInstance.I).toBe(2);
    expect(lazyInstance.getI()).toBe(2);
    expect(counter).toBe(2);
  });
});
