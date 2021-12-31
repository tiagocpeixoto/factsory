import { InitFunction, InitOptions } from "./lazy-instance";

export type AsyncInitFunction<T> = InitFunction<Promise<T>>;

export interface AsyncInitOptions extends InitOptions {
  lock?: Lock;
}

export interface Lock {
  acquire: () => Promise<() => void>;
}

export class AsyncLazyInstance<T> {
  readonly name: string;
  readonly eagerInit: boolean;
  #instance?: T;
  readonly #asyncLazyInit: AsyncInitFunction<T>;
  readonly #lock?: Lock;

  constructor(
    asyncLazyInit: AsyncInitFunction<T>,
    { name, eagerInit = false, lock }: AsyncInitOptions = {}
  ) {
    this.name = `${name ?? "AsyncLazyInstance"}-${new Date().toISOString()}`;
    this.eagerInit = eagerInit;
    this.#asyncLazyInit = asyncLazyInit;
    this.#lock = lock;

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

  get I(): Promise<T> {
    return this.getI();
  }

  async getI(): Promise<T> {
    const release = await this.#lock?.acquire();
    try {
      return this.#instance ?? (this.#instance = await this.#asyncLazyInit());
    } finally {
      release?.();
    }

    /**
     * It's an IIFE
     * @see https://developer.mozilla.org/en-US/docs/Glossary/IIFE
     */
    // return (async () => {
    //   const release = await this.#lock?.acquire();
    //   try {
    //     return this.#instance ?? (this.#instance = await this.#asyncLazyInit());
    //   } finally {
    //     release?.();
    //   }
    // })();
  }

  reset(): void {
    this.#instance = undefined;
  }
}
