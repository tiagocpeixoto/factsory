export interface Factory<T = unknown, O = unknown> {
  create(params?: O): T;
}

export type FactoryType<T = unknown, O = unknown> = Factory<T, O>;

export abstract class DefaultFactory<T = unknown, O = unknown>
  implements Factory<T, O> {
  protected dependencies?: string[];
  protected options?: O;

  create({
    dependencies,
    options,
  }: { dependencies?: string[]; options?: O } = {}): T {
    this.dependencies = dependencies;
    this.options = options;
    return this.instantiate();
  }

  abstract instantiate(): T;
}
