import { LazyInstance } from ".";

export class ContainerItemNotFoundError extends Error {
  constructor(public readonly containerItemName: string, message?: string) {
    super(message);
    // see: www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = ContainerItemNotFoundError.name; // stack traces display correctly now
  }
}

export type InferredContainerItems<D> = D extends Record<string, infer ID>
  ? Record<string, ID>
  : never;
export type ContainerItemsType = InferredContainerItems<
  Record<string, unknown>
>;

export type ContainerItemType = unknown;
export type InferredDependenciesType<D> = InferredContainerItems<D>;
export type DependenciesType = ContainerItemsType;
export type InferredArgumentsType<A> = A extends infer IA ? IA : never;
export type ArgumentsType = InferredArgumentsType<unknown>;

export type ContainerItemCreationParameters<D, A> = {
  dependencies?: InferredDependenciesType<D>;
  args?: InferredArgumentsType<A>;
};

export type ContainerItemCreationDependencies<
  D extends DependenciesType
> = ContainerItemCreationParameters<D, never>;

export type ContainerItemCreationArguments<A> = ContainerItemCreationParameters<
  never,
  A
>;

export type ContainerItemCreationFunction<T extends ContainerItemType, D, A> = (
  params?: ContainerItemCreationParameters<D, A>
) => T;

export type ContainerItemConstructor<T extends ContainerItemType, D, A> = new (
  params?: ContainerItemCreationParameters<D, A>
) => T;

export type ContainerItemCreator<T extends ContainerItemType, D, A> =
  | ContainerItemConstructor<T, D, A>
  | ContainerItemCreationFunction<T, D, A>;

export type ContainerItemId<T extends ContainerItemType, D, A> =
  | string
  | ContainerItemConstructor<T, D, A>;

export type ContainerItemRegistrationOptions<
  T extends ContainerItemType,
  D,
  A
> = {
  name?: string;
  singleton?: boolean;
  dependencies?: ContainerItemId<T, D, A>[];
  args?: A;
};

export const defaultItemRegistrationOptions: ContainerItemRegistrationOptions<
  ContainerItemType,
  DependenciesType,
  ArgumentsType
> = {
  singleton: true,
};

export type ExistsConfig = {
  checkExists?: boolean;
};

export type ContainerConfig = ExistsConfig;

export const defaultContainerConfig: ContainerConfig = {
  checkExists: false,
};

type ContainerItemMeta<T extends ContainerItemType, D, A> = {
  creator: ContainerItemCreator<T, D, A>;
  options?: ContainerItemRegistrationOptions<T, D, A>;
  instance?: T;
};

export interface ContainerSpec {
  setConfig(config: ContainerConfig): void;
  registerAll(
    items: {
      creator: ContainerItemCreator<
        ContainerItemType,
        DependenciesType,
        ArgumentsType
      >;
      options?: ContainerItemRegistrationOptions<
        ContainerItemType,
        DependenciesType,
        ArgumentsType
      >;
    }[]
  ): void;
  register<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    creator: ContainerItemCreator<T, D, A>,
    options?: ContainerItemRegistrationOptions<T, D, A>
  ): string;
  unregister<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    id: ContainerItemId<T, D, A>
  ): string;
  getAll(
    ids: ContainerItemId<ContainerItemType, DependenciesType, ArgumentsType>[],
    options?: ExistsConfig
  ): ContainerItemsType;
  get<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    id: ContainerItemId<T, D, A>,
    options?: ExistsConfig
  ): T | null;
}

export class Container implements ContainerSpec {
  protected static specImpl: ContainerSpec | null;
  protected static instance: LazyInstance<ContainerSpec> = new LazyInstance(
    () => (Container.specImpl ??= new Container()),
    {
      name: "Container",
    }
  );

  readonly items: {
    [k: string]:
      | ContainerItemMeta<ContainerItemType, DependenciesType, ArgumentsType>
      | undefined;
  } = {};
  readonly config: ContainerConfig = defaultContainerConfig;

  protected constructor() {
    // protected constructor - it's a singleton
  }

  static set impl(impl: ContainerSpec) {
    if (this.specImpl) {
      throw new Error("The Container is already initialized");
    } else {
      this.specImpl = impl;
    }
  }

  static reset(): void {
    this.specImpl = null;
    this.instance.reset();
  }

  static get I(): ContainerSpec {
    return this.instance.get;
  }

  setConfig(config: ContainerConfig): void {
    this.config.checkExists = config.checkExists;
  }

  registerAll(
    items: {
      creator: ContainerItemCreator<
        ContainerItemType,
        DependenciesType,
        ArgumentsType
      >;
      options?: ContainerItemRegistrationOptions<
        ContainerItemType,
        DependenciesType,
        ArgumentsType
      >;
    }[]
  ): void {
    for (const item of items) {
      this.register(item.creator, item.options);
    }
  }

  register<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    creator: ContainerItemCreator<T, D, A>,
    options?: ContainerItemRegistrationOptions<T, D, A>
  ): string {
    const actualName = options?.name ?? creator.name;
    const actualOptions = { ...defaultItemRegistrationOptions, ...options };
    if (this.items[actualName]) {
      throw new Error(`Item '${actualName}' already registered`);
    }

    this.items[actualName] = {
      creator,
      options: actualOptions,
    };
    return actualName;
  }

  unregister<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(id: ContainerItemId<T, D, A>): string {
    const name = Container.getName(id);
    if (this.items[name]) {
      this.items[name] = undefined;
      return name;
    }
    throw new Error(`Item '${name}' not registered`);
  }

  getAll(
    ids: ContainerItemId<ContainerItemType, DependenciesType, ArgumentsType>[],
    options?: ExistsConfig
  ): ContainerItemsType {
    const resolvedItems: ContainerItemsType = {};

    ids.forEach((id) => {
      const name = Container.getName(id);
      const resolvedDependency = this.get(name, options);
      if (resolvedDependency) {
        resolvedItems[name] = resolvedDependency;
      } else {
        resolvedItems[name] = new ContainerItemNotFoundError(name);
      }
    });
    return resolvedItems;
  }

  get<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(id: ContainerItemId<T, D, A>, options?: ExistsConfig): T | null {
    const name = Container.getName(id);

    const meta = this.items[name];
    if (meta) {
      return this.instantiate(meta) as T;
    }

    const checkExists = options?.checkExists ?? this.config.checkExists;
    if (checkExists) {
      throw new Error(`Item '${name}' not registered`);
    }

    return null;
  }

  private instantiate<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(meta: ContainerItemMeta<T, D, A>): ContainerItemType {
    if (meta.options?.singleton && meta.instance) {
      return meta.instance;
    }

    const deps = meta.options?.dependencies
      ? this.getAll(meta.options.dependencies)
      : undefined;

    const params: ContainerItemCreationParameters<
      DependenciesType,
      ArgumentsType
    > = {
      dependencies: deps,
      args: meta.options?.args,
    };

    // const actualCreator = meta.creator.name
    //   ? (params?: ContainerItemCreationParameters) =>
    //       new (meta.creator as ContainerItemConstructor<T>)(params)
    //   : meta.creator;

    // FIXME: how to detect if the creator is a constructor?
    try {
      meta.instance = new (meta.creator as ContainerItemConstructor<T, D, A>)(
        params
      );
    } catch (error) {
      meta.instance = (meta.creator as ContainerItemCreationFunction<T, D, A>)(
        params
      );
    }

    if (meta.instance && meta.options?.singleton) {
      // TODO: does this statement free up memory?
      meta.options.args = undefined;
    }

    return meta.instance;
  }

  private static getName(
    id: ContainerItemId<ContainerItemType, DependenciesType, ArgumentsType>
  ): string {
    return typeof id == "string" ? id : id.name;
  }
}
