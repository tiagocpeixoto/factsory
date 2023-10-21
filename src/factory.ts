import {
  Items,
  CreationParameters,
  FactoryFn,
  FactoryMethod,
} from "./container-spec";

export interface Factory<T = unknown, D extends Items = Items, A = unknown> {
  readonly id: string;
  create: FactoryMethod<T, D, A>;
}

export interface SimpleFactory<T> extends Factory<T, never, never> {
  create: FactoryMethod<T, never, never>;
}

export abstract class DefaultFactory<
  T = unknown,
  D extends Items = Items,
  A = unknown,
> implements Factory<T, D, A>
{
  readonly id = this.constructor.name;
  protected dependencies?: Items;
  protected args?: A;

  // constructor(params?: CreationParameters<D, A>) {
  //   this.dependencies = params?.dependencies;
  //   this.args = params?.args;
  // }

  create: FactoryMethod<T, D, A> = Object.assign(
    ({ dependencies, args }: CreationParameters<D, A> = {}): T => {
      this.dependencies = dependencies;
      this.args = args;
      return this.instantiate();
    },
    { isFactoryMethod: <const>true },
  );

  abstract instantiate(): T;
}

export function createFactoryMethod<T, D extends Items, A>(
  creator: FactoryFn<T, D, A>,
  // options?: {
  //   id?: string;
  // }
): FactoryMethod<T, D, A> {
  return Object.assign(creator, {
    // id: options?.id ?? creator.id,
    isFactoryMethod: <const>true,
  });
}
