import { LazyInstance } from ".";

export class ContainerItemNotFoundError extends Error {
  constructor(public readonly containerItemName: string, message?: string) {
    super(message);
    // see: www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = ContainerItemNotFoundError.name; // stack traces display correctly now
  }
}

export type ContainerItemType = unknown;
export type InferredDependenciesType<D> = D extends Record<string, infer ID>
  ? Record<string, ID>
  : never;
export type DependenciesType = InferredDependenciesType<
  Record<string, unknown>
>;
export type InferredArgumentsType<A> = A extends infer IA ? IA : never;
export type ArgumentsType = InferredArgumentsType<unknown>;

export type ContainerItemCreationParameters<
  D, // extends DependenciesType, // = DependenciesType,
  A // extends ArgumentsType // = ArgumentsType
> = {
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

export type ContainerItemDependencies<T extends ContainerItemType, D, A> = (
  | string
  | ContainerItemConstructor<T, D, A>
)[];

export type ContainerItemRegistrationOptions<
  T extends ContainerItemType,
  D,
  A
> = {
  singleton?: boolean;
  dependencies?: ContainerItemDependencies<T, D, A>;
  args?: A;
};

export const defaultItemRegistrationOptions: ContainerItemRegistrationOptions<
  ContainerItemType,
  DependenciesType,
  ArgumentsType
> = {
  singleton: true,
};

export type ContainerConfig = {
  checkExists: boolean;
};

export const defaultContainerConfig: ContainerConfig = {
  checkExists: false,
};

type ContainerItemMeta<T extends ContainerItemType, D, A> = {
  creator: ContainerItemCreator<T, D, A>;
  options?: ContainerItemRegistrationOptions<T, D, A>;
  instance?: T;
};

export class Container {
  protected static instance: LazyInstance<Container> = new LazyInstance(
    () => new Container(),
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
    // protected constructor because it is a singleton
  }

  static get self(): Container {
    return this.instance.get;
  }

  setConfig(config: ContainerConfig): void {
    this.config.checkExists = config.checkExists;
  }

  registerAll(
    items: {
      name?: string;
      creator: ContainerItemCreator<ContainerItemType, unknown, unknown>;
      options?: ContainerItemRegistrationOptions<
        ContainerItemType,
        DependenciesType,
        ArgumentsType
      >;
    }[]
  ): void {
    for (const item of items) {
      this.registerNamed(
        item.name ?? item.creator.name,
        item.creator,
        item.options
      );
    }
  }

  register<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    creator: ContainerItemConstructor<T, D, A>,
    options?: ContainerItemRegistrationOptions<T, D, A>
  ): string {
    return this.registerNamed(creator.name, creator, options);
    // return this.registerNamed(
    //   creator.name,
    //   (params?: ContainerItemCreationParameters<D, A>) => new creator(params),
    //   options
    // );
  }

  unregister<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(itemConstructor: ContainerItemConstructor<T, D, A>): string {
    return this.unregisterNamed(itemConstructor.name);
  }

  get<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    itemConstructor: ContainerItemConstructor<T, D, A>,
    validate?: boolean
  ): T | null {
    const item = this.getNamed(itemConstructor.name, validate);

    if (item) {
      return item as T;
    }

    return null;
  }

  registerNamed<
    T extends ContainerItemType,
    D extends DependenciesType,
    A extends ArgumentsType
  >(
    name: string,
    creator: ContainerItemCreator<T, D, A>,
    options?: ContainerItemRegistrationOptions<T, D, A>
  ): string {
    const actualOptions = { ...defaultItemRegistrationOptions, ...options };
    if (this.items[name]) {
      throw new Error(`Item ${name} already registered`);
    }

    this.items[name] = {
      creator,
      options: actualOptions,
    };
    return name;
  }

  unregisterNamed(name: string): string {
    if (this.items[name]) {
      this.items[name] = undefined;
      return name;
    }
    throw new Error(`Item ${name} not registered`);
  }

  getNamed<T extends ContainerItemType>(
    name: string,
    checkExists?: boolean
  ): T | null {
    const meta = this.items[name];

    if (meta) {
      return this.instantiate(meta) as T;
    }

    checkExists ??= this.config.checkExists;
    if (checkExists) {
      throw new Error(`Item ${name} not registered`);
    }

    return null;
  }

  private getNamedAll(
    dependencies: ContainerItemDependencies<ContainerItemType, unknown, unknown>
  ): Record<string, unknown> {
    const resolvedDependencies: Record<string, unknown> = {};

    dependencies.forEach((dependency) => {
      const name = typeof dependency == "string" ? dependency : dependency.name;
      const resolvedDependency = this.getNamed(name);
      if (resolvedDependency) {
        resolvedDependencies[name] = resolvedDependency;
      } else {
        resolvedDependencies[name] = new ContainerItemNotFoundError(name);
      }
    });
    return resolvedDependencies;
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
      ? this.getNamedAll(meta.options.dependencies)
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

    // meta.instance = meta.creator({
    //   dependencies: deps,
    //   args: meta.options?.args,
    // });

    if (meta.instance && meta.options?.singleton) {
      // TODO: does this statement free up memory?
      meta.options.args = undefined;
    }

    return meta.instance;
  }
}
