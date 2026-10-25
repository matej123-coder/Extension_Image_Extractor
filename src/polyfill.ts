// Promise.withResolvers
declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  }

  interface PromiseConstructor {
    try<T, A extends unknown[]>(
      callback: (...args: A) => T | PromiseLike<T>,
      ...args: A
    ): Promise<Awaited<T>>;
  }

  interface Map<K, V> {
    getOrInsertComputed(key: K, callback: (key: K) => V): V;
    getOrInsert(key: K, value: V): V;
  }

  interface Uint8Array {
    toHex(): string;
  }

  interface Math {
    sumPrecise(items: Iterable<number>): number;
  }
}

// Promise.withResolvers
if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}

// Promise.try
if (typeof Promise.try !== "function") {
  Promise.try = function <T, A extends unknown[]>(
    callback: (...args: A) => T | PromiseLike<T>,
    ...args: A
  ): Promise<Awaited<T>> {
    return new Promise<Awaited<T>>((resolve, reject) => {
      try {
        resolve(callback(...args) as Awaited<T>);
      } catch (error) {
        reject(error);
      }
    });
  };
}

// Map.prototype.getOrInsertComputed
if (typeof Map.prototype.getOrInsertComputed !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsertComputed", {
    value: function <K, V>(
      this: Map<K, V>,
      key: K,
      callback: (key: K) => V,
    ): V {
      if (this.has(key)) {
        return this.get(key)!;
      }

      const value = callback(key);
      this.set(key, value);
      return value;
    },
    writable: true,
    configurable: true,
  });
}

// Map.prototype.getOrInsert
if (typeof Map.prototype.getOrInsert !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsert", {
    value: function <K, V>(this: Map<K, V>, key: K, value: V): V {
      if (this.has(key)) {
        return this.get(key)!;
      }

      this.set(key, value);
      return value;
    },
    writable: true,
    configurable: true,
  });
}

// Uint8Array.prototype.toHex
if (typeof Uint8Array.prototype.toHex !== "function") {
  Object.defineProperty(Uint8Array.prototype, "toHex", {
    value: function (this: Uint8Array): string {
      let hex = "";

      for (let i = 0; i < this.length; i++) {
        hex += this[i].toString(16).padStart(2, "0");
      }

      return hex;
    },
    writable: true,
    configurable: true,
  });
}

// Math.sumPrecise
if (typeof Math.sumPrecise !== "function") {
  Object.defineProperty(Math, "sumPrecise", {
    value: function (items: Iterable<number>): number {
      let sum = 0;

      for (const value of items) {
        sum += value;
      }

      return sum;
    },
    writable: true,
    configurable: true,
  });
}

export {};
