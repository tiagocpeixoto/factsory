import { LazyInstance } from "@root/lazy-instance";
import * as faker from "faker";

describe("lazy-instance tests", function () {
  it("test create and get from lazy-instance", function () {
    const name = faker.lorem.word();
    let value = "";

    const lazyInstance = new LazyInstance(() => value = faker.lorem.word(), {name});
    expect(value).toBeFalsy();

    const getValue = lazyInstance.get;
    expect(value).toBe(getValue);
  });
});
