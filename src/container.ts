import { LazyInstance } from ".";

export type ContainerItem = unknown;

type ContainerItemConstructor<T extends ContainerItem> = new (
  ...params: unknown[]
) => T;

export type ContainerItemCreator<T extends ContainerItem> = (
  ...params: unknown[]
) => T;

export type ItemCreationOptions = {
  singleton: boolean;
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

type ContainerItemMeta<T extends ContainerItem> = {
  creator: ContainerItemCreator<T>;
  options: ItemCreationOptions;
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

  register<T extends ContainerItem>(
    creator: ContainerItemConstructor<T>,
    options?: ItemCreationOptions
  ): string {
    return this.registerNamed(
      creator.name,
      () => new creator(options),
      options
    );
  }

  unregister<T extends ContainerItem>(itemConstructor: {
    new (...params: unknown[]): T;
  }): string {
    return this.unregisterNamed(itemConstructor.name);
  }

  get<T extends ContainerItem>(
    itemConstructor: ContainerItemConstructor<T>,
    validate?: boolean
  ): T | null {
    const item = this.getNamed(itemConstructor.name, validate);

    if (item) {
      return item as T;
    }

    return null;
  }

  registerNamed<T extends ContainerItem>(
    name: string,
    creator: ContainerItemCreator<T>,
    options: ItemCreationOptions = defaultItemCreationOptions
  ): string {
    if (options.singleton && this.items[name]) {
      throw new Error(`Item ${name} already registered`);
    }

    this.items[name] = {
      creator,
      options,
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

  private static instantiate(
    meta: ContainerItemMeta<ContainerItem>
  ): ContainerItem {
    if (!meta) {
      throw new Error("Invalid item metadata ");
    }

    if (meta.options.singleton && meta.instance) {
      return meta.instance;
    }

    return (meta.instance = meta.creator(meta.options));
  }
}
