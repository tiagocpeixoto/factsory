import { LazyInstance } from ".";

export type ContainerItem = unknown;

type ContainerItemConstructor<T extends ContainerItem, P = unknown> = new (
  param: P
) => T;

export type ContainerItemCreator<T extends ContainerItem, P = unknown> = (
  param: P
) => T;

export type ItemCreationOptions<P = unknown> = {
  singleton?: boolean;
  creationParam?: P;
};

export const defaultItemCreationOptions: ItemCreationOptions = {
  singleton: true,
};

export type ContainerConfig = {
  checkExists: boolean;
};

export const defaultContainerConfig: ContainerConfig = {
  checkExists: false,
};

type ContainerItemMeta<T extends ContainerItem, P = unknown> = {
  creator: ContainerItemCreator<T, P>;
  options?: ItemCreationOptions<P>;
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
    [k: string]: ContainerItemMeta<ContainerItem> | undefined;
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

  registerAll<T extends ContainerItem>(
    items: {
      creator: ContainerItemConstructor<T>;
      options?: ItemCreationOptions;
    }[]
  ): void {
    for (const item of items) {
      this.register(item.creator, item.options);
    }
  }

  register<T extends ContainerItem, P>(
    creator: ContainerItemConstructor<T, P>,
    options?: ItemCreationOptions<P>
  ): string {
    return this.registerNamed(
      creator.name,
      (param: P) => new creator(param),
      options
    );
  }

  unregister<T extends ContainerItem, P>(
    itemConstructor: ContainerItemConstructor<T, P>
  ): string {
    return this.unregisterNamed(itemConstructor.name);
  }

  get<T extends ContainerItem, P>(
    itemConstructor: ContainerItemConstructor<T, P>,
    validate?: boolean
  ): T | null {
    const item = this.getNamed(itemConstructor.name, validate);

    if (item) {
      return item as T;
    }

    return null;
  }

  registerNamed<T extends ContainerItem, P>(
    name: string,
    creator: ContainerItemCreator<T, P>,
    options?: ItemCreationOptions<P>
  ): string {
    const actualOptions = { ...defaultItemCreationOptions, ...options };
    if (this.items[name]) {
      throw new Error(`Item ${name} already registered`);
    }

    this.items[name] = {
      creator: creator as ContainerItemCreator<T>,
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

  getNamed(name: string, checkExists?: boolean): ContainerItem | null {
    const meta = this.items[name];

    if (meta) {
      return Container.instantiate(meta);
    }

    checkExists ??= this.config.checkExists;
    if (checkExists) {
      throw new Error(`Item ${name} not registered`);
    }

    return null;
  }

  private static instantiate<T extends ContainerItem>(
    meta: ContainerItemMeta<T>
  ): ContainerItem {
    if (!meta) {
      throw new Error("Invalid item metadata ");
    }

    if (meta.options?.singleton && meta.instance) {
      return meta.instance;
    }

    meta.instance = meta.creator(meta.options?.creationParam);

    if (meta.instance && meta.options?.singleton) {
      // TODO: does this statement free up memory?
      meta.options.creationParam = undefined;
    }

    return meta.instance;
  }
}
