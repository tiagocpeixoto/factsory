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
} from "./container-spec";
import { LazyInstance } from "./lazy-instance";

export class ContainerItemNotFoundError extends Error {
  constructor(public readonly containerItemName: string, message?: string) {
    super(message);
    // see: www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = ContainerItemNotFoundError.name; // stack traces display correctly now
  }
}

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
      name: "Container",
    }
  );

  readonly items: {
    [k: string]: ItemMeta | undefined;
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
    options?: RegistrationOptions<unknown>
  ): string {
    const actualName = options?.name ?? creator.name;
    const actualOptions: RegistrationOptions<unknown> = {
      ...defaultItemRegistrationOptions,
      ...options,
    };
    if (this.items[actualName]) {
      throw new Error(`Item '${actualName}' already registered`);
    }

    this.items[actualName] = {
      creator: creator as Creator,
      options: actualOptions,
    };
    return actualName;
  }

  unregister<T, D extends Items, A>(id: ItemId<T, D, A>): string {
    const name = Container.#getName(id);
    if (this.items[name]) {
      this.items[name] = undefined;
      return name;
    }
    throw new Error(`Item '${name}' not registered`);
  }

  getAll(ids: ItemId<unknown, never, never>[], options?: ExistsConfig): Items {
    const resolvedItems: Items = {};

    ids.forEach((id) => {
      const name = Container.#getName(id);
      const resolvedDependency = this.get(name, options);
      if (resolvedDependency) {
        resolvedItems[name] = resolvedDependency;
      } else {
        resolvedItems[name] = new ContainerItemNotFoundError(name);
      }
    });
    return resolvedItems;
  }

  get<T>(id: ItemId<T>, options?: ExistsConfig): T | null {
    const name = Container.#getName(id);

    const meta = this.items[name];
    if (meta) {
      return this.#instantiate(meta) as T;
    }

    const checkExists = options?.checkExists ?? this.config.checkExists;
    if (checkExists) {
      throw new Error(`Item '${name}' not registered`);
    }

    return null;
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

  static #getName<T, D extends Items, A>(id: ItemId<T, D, A>): string {
    return typeof id === "string" ? id : id.name;
  }
}
