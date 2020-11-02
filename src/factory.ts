export interface Factory<T = unknown, P = unknown> {
  create(params?: P): T;
}

export interface SimpleFactory<T = unknown> extends Factory<T, never> {
  create(): T;
}

export type FactoryType<T = unknown, P = unknown> = Factory<T, P>;

export abstract class DefaultFactory<T = unknown, P = unknown>
  implements Factory<T, P> {
  protected dependencies?: string[];
  protected options?: P;

  create({
    dependencies,
    options,
  }: { dependencies?: string[]; options?: P } = {}): T {
    this.dependencies = dependencies;
    this.options = options;
    return this.instantiate();
  }

  abstract instantiate(): T;
}
