export interface Constructor<
  T = unknown,
  D extends Items = Items,
  A = unknown,
> {
  new (params?: CreationParameters<D, A>): T;
}

export interface FactoryFn<T = unknown, D extends Items = Items, A = unknown> {
  (params?: CreationParameters<D, A>): T;
}

export interface CreationParameters<D extends Items = Items, A = unknown> {
  readonly dependencies?: D;
  readonly args?: A;
}

export type CreationDependencies<D extends Items> = Omit<
  CreationParameters<D, never>,
  "args"
>;

export type CreationArguments<A = unknown> = Omit<
  CreationParameters<never, A>,
  "dependencies"
>;

export interface FactoryMethod<
  T = unknown,
  D extends Items = Items,
  A = unknown,
> extends FactoryFn<T, D, A> {
  // (params?: CreationParameters<A>): T;
  readonly isFactoryMethod: true;
}

export type Creator<
  T = unknown,
  D extends Items | never = Items,
  A = unknown | never,
> = Constructor<T, D, A> | FactoryMethod<T, D, A>;

export type Items = Record<SimpleItemId, unknown>;

export type ContainerConfig = ExistsConfig;

export interface ExistsConfig {
  checkExists?: boolean;
}

export type SimpleItemId = string | symbol;

export type ItemId<T = unknown, D extends Items = Items, A = unknown> =
  | SimpleItemId
  | Creator<T, D, A>;

export type ItemMeta<
  T = unknown,
  D extends Items = Items,
  A = unknown,
> = ItemRegister<T, D, A> & {
  instance?: T;
};

export interface ItemRegister<T, D extends Items, A> {
  readonly creator: Creator<T, D, A>;
  // TODO: should be RegistrationOptions<A> ?
  readonly options?: RegistrationOptions<unknown>;
}

export type ItemsRegister = ItemRegister<unknown, never, never>[];

export interface RegistrationOptions<A> {
  name?: SimpleItemId;
  singleton?: boolean;
  dependencies?: ItemId[];
  args?: A;
}

export interface ContainerSpec {
  setConfig(config: ContainerConfig): void;
  registerAll<T extends ItemsRegister>(items: T): void;
  register<T, D extends Items, A>(
    creator: Creator<T, D, A>,
    options?: RegistrationOptions<unknown>,
  ): SimpleItemId;
  unregister<T, D extends Items, A>(id: ItemId<T, D, A>): SimpleItemId;
  getAll(ids: ItemId<unknown, never, never>[], options?: ExistsConfig): Items;
  get<T, D extends Items, A>(
    id: ItemId<T, D, A>,
    options?: ExistsConfig,
  ): T | null;
  clear(): void;
}
