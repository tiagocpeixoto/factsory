import {
  ContainerConfig,
  ContainerSpec,
  Creator,
  ExistsConfig,
  ItemId,
  ItemMeta,
  Items,
  ItemsRegister,
  RegistrationOptions,
  SimpleItemId,
} from "./container-spec";
import { ContainerItemNotFoundError } from "./errors/container-item-not-found-error";
import { LazyInstance } from "./lazy-instance";

export const defaultItemRegistrationOptions: RegistrationOptions<unknown> = {
  singleton: true,
};

export const defaultContainerConfig: ContainerConfig = {
  checkExists: false,
};

export class Container implements ContainerSpec {
  protected static specImpl: ContainerSpec | null;
  protected static instance: LazyInstance<ContainerSpec> = new LazyInstance(
    () => (Container.specImpl ??= new Container()),
    {
      id: "Container",
    },
  );

  readonly items: {
    [k: SimpleItemId]: ItemMeta | undefined;
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
    return this.instance.I;
  }

  setConfig(config: ContainerConfig): void {
    this.config.checkExists = config.checkExists;
  }

  registerAll<T extends ItemsRegister>(items: T): void {
    for (const item of items) {
      this.register(item.creator, item.options);
    }
  }

  register<T, D extends Items, A>(
    creator: Creator<T, D, A>,
    options?: RegistrationOptions<unknown>,
  ): SimpleItemId {
    const id = options?.id ?? creator.name;
    const actualOptions: RegistrationOptions<unknown> = {
      ...defaultItemRegistrationOptions,
      ...options,
    };
    if (this.items[id]) {
      throw new Error(`Item '${id?.toString()}' already registered`);
    }

    this.items[id] = {
      creator: creator as Creator,
      options: actualOptions,
    };
    return id;
  }

  unregister<T, D extends Items, A>(itemId: ItemId<T, D, A>): SimpleItemId {
    const id = Container.#getId(itemId);
    if (this.items[id]) {
      this.items[id] = undefined;
      return id;
    }
    throw new Error(`Item '${id?.toString()}' not registered`);
  }

  getAll(ids: ItemId<unknown, never, never>[], options?: ExistsConfig): Items {
    const resolvedItems: Items = {};

    ids.forEach((itemId) => {
      const id = Container.#getId(itemId);
      const resolvedDependency = this.get(id, options);
      if (resolvedDependency) {
        resolvedItems[id] = resolvedDependency;
      } else {
        resolvedItems[id] = new ContainerItemNotFoundError(id?.toString());
      }
    });
    return resolvedItems;
  }

  get<T>(itemId: ItemId<T>, options?: ExistsConfig): T | null {
    const id = Container.#getId(itemId);

    const meta = this.items[id];
    if (meta) {
      return this.#instantiate(meta) as T;
    }

    const checkExists = options?.checkExists ?? this.config.checkExists;
    if (checkExists) {
      throw new Error(`Item '${id?.toString()}' not registered`);
    }

    return null;
  }

  clear(): void {
    Object.getOwnPropertyNames(this.items).forEach((prop) => {
      delete this.items[prop];
    });
  }

  #instantiate<T>(meta: ItemMeta<T>): T {
    if (meta.options?.singleton && meta.instance) {
      return meta.instance;
    }

    const deps = meta.options?.dependencies
      ? this.getAll(meta.options.dependencies)
      : undefined;

    const params = {
      dependencies: deps,
      args: meta.options?.args,
    };

    if ("isFactoryMethod" in meta.creator) {
      meta.instance = meta.creator(params);
    } else {
      meta.instance = new meta.creator(params);
    }

    if (meta.instance && meta.options?.singleton) {
      // TODO: does this statement free up memory?
      meta.options.args = undefined;
    }

    if (!meta.instance) {
      throw new Error("Could not create the instance");
    }

    return meta.instance;
  }

  static #getId<T, D extends Items, A>(id: ItemId<T, D, A>): SimpleItemId {
    return typeof id === "string" || typeof id === "symbol" ? id : id.name;
  }
}
