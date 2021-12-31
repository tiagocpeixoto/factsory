import { Mutex } from "async-mutex";
import * as faker from "faker";
import { AsyncLazyInstance, Lock } from "../async-lazy-instance";

describe("async-lazy-instance tests", function () {
  it("test default create and get", async function () {
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word())
    );

    expect(value).toBeFalsy();
    const getValue1 = await asyncLazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = await asyncLazyInstance.getI();
    expect(value).toBe(getValue2);
  });

  it("test eager init", async function () {
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        eagerInit: true,
      }
    );

    expect(value).toBeTruthy();
    const getValue1 = await asyncLazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = await asyncLazyInstance.getI();
    expect(value).toBe(getValue2);
  });

  it("test with a mocked lock", async function () {
    const release = jest.fn();
    const lock: Lock = {
      acquire: jest.fn().mockReturnValue(release),
    };

    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        lock,
      }
    );

    const getValue1 = await asyncLazyInstance.I;
    const getValue2 = await asyncLazyInstance.getI();

    expect(value).toBeTruthy();
    expect(value).toBe(getValue1);
    expect(value).toBe(getValue2);
    expect(lock.acquire).toHaveBeenCalledTimes(2);
    expect(release).toHaveBeenCalledTimes(2);
  });

  it("test eager init with a mocked lock", async function () {
    const release = jest.fn();
    const lock: Lock = {
      acquire: jest.fn().mockReturnValue(release),
    };

    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        eagerInit: true,
        lock,
      }
    );

    const getValue1 = await asyncLazyInstance.I;
    const getValue2 = await asyncLazyInstance.getI();

    expect(value).toBeTruthy();
    expect(value).toBe(getValue1);
    expect(value).toBe(getValue2);
    expect(lock.acquire).toHaveBeenCalledTimes(2);
    expect(release).toHaveBeenCalledTimes(2);
  });

  it("test with a real lock", async function () {
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        lock: new Mutex(),
      }
    );

    const getValue1 = await asyncLazyInstance.I;
    const getValue2 = await asyncLazyInstance.getI();

    expect(value).toBeTruthy();
    expect(value).toBe(getValue1);
    expect(value).toBe(getValue2);
  });

  it("test eager init with a real lock", async function () {
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        eagerInit: true,
        lock: new Mutex(),
      }
    );

    const getValue1 = await asyncLazyInstance.I;
    const getValue2 = await asyncLazyInstance.getI();

    expect(value).toBeTruthy();
    expect(value).toBe(getValue1);
    expect(value).toBe(getValue2);
  });

  it("test named create and get", async function () {
    const name = faker.lorem.word();
    let value = "";

    const asyncLazyInstance = new AsyncLazyInstance(
      async () => (value = faker.lorem.word()),
      {
        name,
      }
    );
    expect(value).toBeFalsy();

    const getValue1 = await asyncLazyInstance.I;
    expect(value).toBe(getValue1);
    const getValue2 = await asyncLazyInstance.getI();
    expect(value).toBe(getValue2);

    expect(asyncLazyInstance.instanceName).toMatch(name);
  });

  it("test reset", async function () {
    let counter = 0;
    const asyncLazyInstance = new AsyncLazyInstance(async () => ++counter);
    expect(await asyncLazyInstance.I).toBe(1);
    expect(counter).toBe(1);
    // again
    expect(await asyncLazyInstance.I).toBe(1);
    expect(await asyncLazyInstance.getI()).toBe(1);
    expect(counter).toBe(1);
    // reset
    asyncLazyInstance.reset();
    expect(await asyncLazyInstance.I).toBe(2);
    expect(await asyncLazyInstance.getI()).toBe(2);
    expect(counter).toBe(2);
  });
});
