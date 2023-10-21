import {
  createAsyncLazyInstanceFactoryMethod,
  createFactoryMethod,
  createLazyInstanceFactoryMethod,
  DefaultFactory,
  Factory,
} from "..";
import { faker } from "@faker-js/faker";

describe("factory tests", function () {
  describe("extending/implementing tests", function () {
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
        readonly id = this.constructor.name;
        create = createFactoryMethod(() => "value");
      }

      expect(new MyFactory().create()).toBe("value");
    });
  });

  describe("create lazy instance tests", function () {
    it("test create lazy instance", function () {
      const value = faker.lorem.word();
      let lazyValue = "";
      const lazyInstance = createLazyInstanceFactoryMethod(() => {
        lazyValue = value;
        return lazyValue;
      })();

      expect(lazyValue).toEqual("");
      // actually created
      expect(lazyInstance.I).toEqual(value);
      expect(lazyValue).toEqual(value);
    });

    it("test create async lazy instance", async function () {
      const value = faker.lorem.word();
      let lazyValue = "";
      const asyncLazyInstance = createAsyncLazyInstanceFactoryMethod(
        async () => {
          lazyValue = value;
          return lazyValue;
        },
      )();

      expect(lazyValue).toEqual("");
      // actually created
      expect(await asyncLazyInstance.I).toEqual(value);
      expect(lazyValue).toEqual(value);
    });
  });
});
