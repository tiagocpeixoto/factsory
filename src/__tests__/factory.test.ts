import { DefaultFactory, Factory } from "@root/factory";

describe("factory tests", function () {
  describe("readme tests", function () {
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
});
