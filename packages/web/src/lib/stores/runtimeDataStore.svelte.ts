import type { RuntimeDataType } from "$lib/types/events/RuntimeDataType";

export class RuntimeDataStore<T extends object> {
    public data: T = $state({} as T);

    public setData<K extends keyof T>(fieldName: K, value: T[K]) {
        this.data[fieldName] = value;
    }
}

export const runtimeDataStore = new RuntimeDataStore<RuntimeDataType>();
