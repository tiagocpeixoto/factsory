export interface InitFunction<T> {
  (): T;
}

export interface AsyncInitFunction<T> {
  (): Promise<T>;
}

export interface InitOptions {
  name?: string;
  eagerInit?: boolean;
}

export class LazyInstance<T> {
  readonly name: string;
  readonly eagerInit: boolean;
  #instance?: T;
  readonly #lazyInit: InitFunction<T>;

  constructor(
    lazyInit: InitFunction<T>,
    { name, eagerInit = false }: InitOptions = {}
  ) {
    this.name = `${name ?? "LazyInstance"}-${new Date().toISOString()}`;
    this.eagerInit = eagerInit;
    this.#lazyInit = lazyInit;

    if (this.eagerInit) {
      this.init();
    }
  }

  init(): void {
    this.#instance = this.#lazyInit();
  }

  get instanceName(): string {
    return this.name as string;
  }

  get get(): T {
    // if (this.instance == null) {
    //     console.debug(`Lazying init ${this.name}...`)
    // }

    return this.#instance ?? (this.#instance = this.#lazyInit());
  }

  reset(): void {
    this.#instance = undefined;
  }
}

export class AsyncLazyInstance<T> {
  readonly name: string;
  readonly eagerInit: boolean;
  #instance?: T;
  readonly #asyncLazyInit: AsyncInitFunction<T>;

  constructor(
    asyncLazyInit: AsyncInitFunction<T>,
    { name, eagerInit = false }: InitOptions = {}
  ) {
    this.name = `${name ?? "AsyncLazyInstance"}-${new Date().toISOString()}`;
    this.eagerInit = eagerInit;
    this.#asyncLazyInit = asyncLazyInit;

    if (this.eagerInit) {
      this.asyncInit().catch(console.error);
    }
  }

  async asyncInit(): Promise<void> {
    this.#instance = await this.#asyncLazyInit();
  }

  get instanceName(): string {
    return this.name as string;
  }

  get get(): Promise<T> {
    /**
     * It's an IIFE
     * @see https://developer.mozilla.org/en-US/docs/Glossary/IIFE
     */
    return (async () => {
      return this.#instance ?? (this.#instance = await this.#asyncLazyInit());
    })();
  }

  reset(): void {
    this.#instance = undefined;
  }
}
