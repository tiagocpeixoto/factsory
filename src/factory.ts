import { LazyInstance } from ".";

export interface Factory {
  get: Factory;
}

export class Factories {
  protected static instance: LazyInstance<Factories> = new LazyInstance(
    () => new Factories(),
    {
      name: "Factories",
    }
  );

  readonly factories: { [p: string]: unknown } = {};

  protected constructor() {
    // protected constructor because it is a singleton
  }

  static get self(): Factories {
    return this.instance.get;
  }

  registerAll<F extends Factory>(
    factories: {
      new (...params: unknown[]): F;
    }[]
  ): void {
    for (const factory of factories) {
      this.register(factory);
    }
  }

  register<F extends Factory>(factory: {
    new (...params: unknown[]): F;
  }): string {
    return this.registerNamed(factory.name, () => new factory());
  }

  unregister<F extends Factory>(factory: {
    new (...params: unknown[]): F;
  }): string {
    return this.unregisterNamed(factory.name);
  }

  get<F extends Factory>(
    factory: { new (...params: unknown[]): F },
    validate?: boolean
  ): F | null {
    return this.getNamed(factory.name, validate);
  }

  registerNamed<F extends Factory>(name: string, factory: () => F): string {
    if (this.factories[name])
      throw new Error(`Factory ${name} already registered`);

    this.factories[name] = factory();
    return name;
  }

  unregisterNamed(name: string): string {
    if (this.factories[name]) {
      this.factories[name] = undefined;
      return name;
    }
    throw new Error(`Factory ${name} not registered`);
  }

  getNamed<F extends Factory>(name: string, validate = false): F | null {
    if (this.factories[name]) {
      return this.factories[name] as F;
    }

    if (validate) throw new Error(`Factory ${name} not registered`);

    return null;
  }
}
