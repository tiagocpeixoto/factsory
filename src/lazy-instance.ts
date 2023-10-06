export interface InitFunction<T> {
  (): T;
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
    { name, eagerInit = false }: InitOptions = {},
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
    return this.name;
  }

  get I(): T {
    return this.getI();
  }

  getI(): T {
    // if (this.instance == null) {
    //     console.debug(`Lazying init ${this.name}...`)
    // }

    return this.#instance ?? (this.#instance = this.#lazyInit());
  }

  reset(): void {
    this.#instance = undefined;
  }
}
