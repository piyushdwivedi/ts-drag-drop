
import {ParentComponent} from '../components/base-component';
import {Validated, validateInput} from '../utils/validation';
import {autoBind} from '../decorators/autobind';
import {globalState} from '../state/global';
// ProjectInput class: 
// Renders the form and validates form inputs
export class ProjectInput extends ParentComponent<HTMLDivElement, HTMLFormElement> {
    titleEle: HTMLInputElement;
    descriptionEle: HTMLInputElement;
    peopleEle: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true,'user-input');
        this.titleEle = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionEle = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleEle = this.element.querySelector('#people') as HTMLInputElement;
        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.handlSubmit);
    }

    addContent() {}
    // would return a tuple for valid input and void for invalid
    private getUserInput() : [string, string, number] | void {
        const title = this.titleEle.value;
        const description = this.descriptionEle.value;
        const peopleCount = this.peopleEle.value;

        const titleValidated: Validated = {
            value: title,
            required: true
        };
        const descValidated: Validated = {
            value: description,
            minLength: 5
        };
        const peopleCountValidated: Validated = {
            value: +peopleCount,
            min: 1,
            max: 5
        };
        if (!validateInput(titleValidated) || 
            !validateInput(descValidated) ||
            !validateInput(peopleCountValidated)) {
                alert('Invalid input entered');
                return;
        } else {
            return [title, description, +peopleCount];
        }
        
    }

    @autoBind
    private handlSubmit(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, count] = userInput;
            globalState.addProject(title, description, count);
            this.clearInput();
        }
    }

    private clearInput() {
        this.titleEle.value = '';
        this.descriptionEle.value = '';
        this.peopleEle.value = '';
    }
}
