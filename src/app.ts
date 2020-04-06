enum ProjectStatus { Active, Finished}
// Custom Type - Project
class Project {
    constructor(
        public id: string, 
        public title: string, 
        public description: string, 
        public people: number,
        public status: ProjectStatus) {

        }
}

type Listener = (items: Project[]) => void;
// class for global state
class GlobalState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: GlobalState;
    private constructor() {

    }
    
    static getInstance() {
        if (this.instance) 
            return this.instance;
        this.instance = new GlobalState();
        return this.instance;
    }

    addProject(title: string, description: string, numberOfPeople: number) {
        const prjObj = new Project(
            Math.floor(Math.random()*numberOfPeople).toString(),
            title,
            description,
            numberOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(prjObj);
        for (const listenerFn of this.listeners) {
            listenerFn([...this.projects]);
        }
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

}
const globalState = GlobalState.getInstance();

interface Validated {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validateInput(inputToValidate: Validated) : boolean {
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
    return isValid;

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

// ProjectList class:
// render list of projects
class ProjectList {
    templateEle: HTMLTemplateElement;
    wrapperEle: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        this.templateEle = document.getElementById('project-list') as HTMLTemplateElement;
        this.wrapperEle = document.getElementById('app') as HTMLDivElement;
        this.assignedProjects = [];
        const templateNode = document.importNode(this.templateEle.content, true);
        this.element = templateNode.firstElementChild as HTMLElement;
        
        this.element.id = `${this.type}-projects`;

        globalState.addListener((projects: Project[]) => {
            const validProjects = projects.filter(project => {
                if (this.type === 'active') 
                    return project.status === ProjectStatus.Active;
                return project.status === ProjectStatus.Finished;
            })
            this.assignedProjects = validProjects;
            this.renderProjects();
        })
        this.append();
        this.addContent();
    }

    private renderProjects() {
        const listEle = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEle.innerHTML = ''; // not ok for a large app --> performance
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEle.appendChild(listItem);
        }
    }
    private append() {
        this.wrapperEle.insertAdjacentElement('beforeend', this.element);
    }

    private addContent() {
        const listId = `${this.type}-project-list`;
        // add ! because we know the element is in the html
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} Projects`;
    }
}

// ProjectInput class: 
// Renders the form and validates form inputs
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
            console.log(title, description, count);
            globalState.addProject(title, description, count);
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
const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');