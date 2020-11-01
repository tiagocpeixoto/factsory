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

export type DependenciesType = Record<string, unknown>;

export type ArgumentsType = unknown;

export type ContainerItemCreationParameters<
  D extends DependenciesType = DependenciesType,
  A extends ArgumentsType = ArgumentsType
> = {
  dependencies?: D;
  args?: A;
};

export type ContainerItemCreationDependencies<
  D extends DependenciesType = DependenciesType
> = ContainerItemCreationParameters<D, never>;

export type ContainerItemCreationArguments<
  A extends ArgumentsType = ArgumentsType
> = ContainerItemCreationParameters<never, A>;

export type ContainerItemConstructor<
  T extends ContainerItemType,
  D extends DependenciesType = DependenciesType,
  A extends ArgumentsType = ArgumentsType
> = new (params?: ContainerItemCreationParameters<D, A>) => T;

export type ContainerItemCreator<
  T extends ContainerItemType,
  D extends DependenciesType = DependenciesType,
  A extends ArgumentsType = ArgumentsType
> = (params?: ContainerItemCreationParameters<D, A>) => T;

export type ContainerItemRegister<
  T extends ContainerItemType,
  D extends DependenciesType = DependenciesType,
  A extends ArgumentsType = ArgumentsType
> = ContainerItemConstructor<T, D, A> | ContainerItemCreator<T, D, A>;

export type ContainerItemDependencies = (
  | string
  | ContainerItemConstructor<ContainerItemType>
)[];

export type ContainerItemRegistrationOptions<
  A extends ArgumentsType = ArgumentsType
> = {
  singleton?: boolean;
  dependencies?: ContainerItemDependencies;
  args?: A;
};

export const defaultItemRegistrationOptions: ContainerItemRegistrationOptions = {
  singleton: true,
};

export type ContainerConfig = {
  checkExists: boolean;
};

export const defaultContainerConfig: ContainerConfig = {
  checkExists: false,
};

type ContainerItemMeta<
  T extends ContainerItemType,
  D extends DependenciesType = DependenciesType,
  A extends ArgumentsType = ArgumentsType
> = {
  creator: ContainerItemRegister<T, D, A>;
  options?: ContainerItemRegistrationOptions<A>;
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
    [k: string]: ContainerItemMeta<ContainerItemType> | undefined;
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
      creator: ContainerItemRegister<ContainerItemType>;
      options?: ContainerItemRegistrationOptions;
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
    options?: ContainerItemRegistrationOptions<A>
  ): string {
    return this.registerNamed(
      creator.name,
      (params?: ContainerItemCreationParameters<D, A>) => new creator(params),
      options
    );
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
    // creator: ContainerItemCreator<T, D, A>,
    creator: ContainerItemRegister<T, D, A>,
    options?: ContainerItemRegistrationOptions<A>
  ): string {
    const actualOptions = { ...defaultItemRegistrationOptions, ...options };
    if (this.items[name]) {
      throw new Error(`Item ${name} already registered`);
    }

    this.items[name] = {
      creator: creator as ContainerItemRegister<T>,
      // creator: creator as ContainerItemCreator<T>,
      // creator: actualCreator as ContainerItemCreator<T>,
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
    dependencies: ContainerItemDependencies
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

  private instantiate<T extends ContainerItemType>(
    meta: ContainerItemMeta<T>
  ): ContainerItemType {
    if (!meta) {
      throw new Error("Invalid item metadata ");
    }

    if (meta.options?.singleton && meta.instance) {
      return meta.instance;
    }

    const deps = meta.options?.dependencies
      ? this.getNamedAll(meta.options.dependencies)
      : undefined;

    // const actualCreator = meta.creator.name
    //   ? (params?: ContainerItemCreationParameters) =>
    //       new (meta.creator as ContainerItemConstructor<T>)(params)
    //   : meta.creator;

    const params = {
      dependencies: deps,
      args: meta.options?.args,
    };

    // FIXME: how to detect if the creator is a constructor?
    try {
      meta.instance = new (meta.creator as ContainerItemConstructor<T>)(params);
    } catch (error) {
      meta.instance = (meta.creator as ContainerItemCreator<T>)(params);
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
