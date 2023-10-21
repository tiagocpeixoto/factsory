export interface InitFunction<T> {
  (): T;
}

export interface InitOptions {
  id?: string;
  eagerInit?: boolean;
}

export class LazyInstance<T> {
  readonly id: string;
  readonly eagerInit: boolean;
  #instance?: T;
  readonly #lazyInit: InitFunction<T>;

  constructor(
    lazyInit: InitFunction<T>,
    { id, eagerInit = false }: InitOptions = {},
  ) {
    this.id = `${id ?? "LazyInstance"}-${new Date().toISOString()}`;
    this.eagerInit = eagerInit;
    this.#lazyInit = lazyInit;

    if (this.eagerInit) {
      this.init();
    }
  }

  init(): void {
    this.#instance = this.#lazyInit();
  }

  get instanceId(): string {
    return this.id;
  }

  get I(): T {
    return this.getI();
  }

  getI(): T {
    // if (this.instance == null) {
    //     console.debug(`Lazying init ${this.id}...`)
    // }

    return this.#instance ?? (this.#instance = this.#lazyInit());
  }

  reset(): void {
    this.#instance = undefined;
  }
}
