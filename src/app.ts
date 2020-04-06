interface Validated {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validateInput(inputToValidate: Validated) {
    let isValid = true;
    const {value, required, minLength, maxLength, min, max} = inputToValidate;
    if (required)
        isValid = isValid && value.toString().trim().length > 0;

    // compared with != null because minLength could be 0
    if (minLength != null && typeof value === 'string') 
        isValid = isValid && value.length > minLength;
    if (min != null && typeof value === 'number') 
        isValid = isValid && value > min;

    if (maxLength != null && typeof value === 'string') 
        isValid = isValid && value.length < maxLength;
    if (max != null && typeof value === 'number') 
        isValid = isValid && value < max;
    

}
// autobind decorator
function autoBind(_: any, _2: String, descriptor: PropertyDescriptor) {
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

class ProjectInput {
    templateEle: HTMLTemplateElement;
    wrapperEle: HTMLDivElement;
    element: HTMLFormElement;
    titleEle: HTMLInputElement;
    descriptionEle: HTMLInputElement;
    peopleEle: HTMLInputElement;

    constructor() {
        this.templateEle = document.getElementById('project-input') as HTMLTemplateElement;
        this.wrapperEle = document.getElementById('app') as HTMLDivElement;

        const templateNode = document.importNode(this.templateEle.content, true);
        this.element = templateNode.firstElementChild as HTMLFormElement;
        
        this.element.id = 'user-input';
        this.titleEle = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionEle = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleEle = this.element.querySelector('#people') as HTMLInputElement;

        this.addListener();
        this.append();
    }

    private append() {
        this.wrapperEle.insertAdjacentElement('afterbegin', this.element);
    }

    private getUserInput() : [string, string, number] {
        const title = this.titleEle.value;
        const description = this.descriptionEle.value;
        const peopleCount = this.peopleEle.value;

        return [title, description, +peopleCount];
    }
    @autoBind
    private handlSubmit(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, count] = userInput;
            console.log(title, description, count);
            this.clearInput();
        }
    }

    private clearInput() {
        this.titleEle.value = '';
        this.descriptionEle.value = '';
        this.peopleEle.value = '';
    }
    private addListener() {
        this.element.addEventListener('submit', this.handlSubmit);
    }
}
const projectInputInstance = new ProjectInput();