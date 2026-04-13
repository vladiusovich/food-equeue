export class RuntimeDataStore<T extends object> {
    public data: T = $state({} as T);

    public setData<K extends keyof T>(fieldName: K, value: T[K]) {
        this.data[fieldName] = value;
    }
}

export default RuntimeDataStore;
