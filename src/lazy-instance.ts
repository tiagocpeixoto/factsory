export interface InitFunction<T> {
  (): T;
}

export interface InitOptions {
  name?: string;
  eagerInit?: boolean;
}

export class LazyInstance<T> {
  private instance?: T;
  private readonly name?: string;
  private readonly lazyInit: InitFunction<T>;

  constructor(
    lazyInit: InitFunction<T>,
    { name, eagerInit = false }: InitOptions = {}
  ) {
    this.lazyInit = lazyInit;
    this.name = `${name || "LazyInstance"}-${new Date().toISOString()}`;

    if (eagerInit) {
      this.instance = this.lazyInit();
    }
  }

  get instanceName(): string {
    return this.name as string;
  }

  get get(): T {
    // if (this.instance == null) {
    //     console.debug(`Lazying init ${this.name}...`)
    // }

    return this.instance || (this.instance = this.lazyInit());
  }

  reset(): void {
    this.instance = undefined;
  }
}
