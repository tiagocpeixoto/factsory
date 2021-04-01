import { createFactoryMethod, DefaultFactory, Factory } from "..";

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
        readonly name = this.constructor.name;
        create = createFactoryMethod(() => "value");
      }

      expect(new MyFactory().create()).toBe("value");
    });
  });
});
