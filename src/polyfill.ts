declare global {
  interface Map<K, V> {
    getOrInsertComputed(key: K, callback: (key: K) => V): V;
  }
}

if (!Map.prototype.getOrInsertComputed) {
  Map.prototype.getOrInsertComputed = function <K, V>(
    this: Map<K, V>,
    key: K,
    callback: (key: K) => V,
  ): V {
    if (!this.has(key)) {
      this.set(key, callback(key));
    }

    return this.get(key)!;
  };
}

export {};
