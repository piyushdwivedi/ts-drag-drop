
export interface Validated {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

export function validateInput(inputToValidate: Validated) : boolean {
    let isValid = true;
    const {value, required, minLength, maxLength, min, max} = inputToValidate;
    if (required)
        isValid = isValid && value.toString().trim().length > 0;

    // compared with != null because minLength could be 0
    if (minLength != null && typeof value === 'string') 
        isValid = isValid && value.length >= minLength;
    if (min != null && typeof value === 'number') 
        isValid = isValid && value >= min;

    if (maxLength != null && typeof value === 'string') 
        isValid = isValid && value.length <= maxLength;
    if (max != null && typeof value === 'number') 
        isValid = isValid && value <= max;
    return isValid;

}
