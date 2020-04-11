namespace App {
    // autobind decorator
    export function autoBind(_: any, _2: String, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const modifiedMethod: PropertyDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        }
        return modifiedMethod;
    }
}