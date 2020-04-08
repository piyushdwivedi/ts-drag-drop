interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

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

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}
// class for global state
class GlobalState extends State<Project> {
    private projects: Project[] = [];
    private static instance: GlobalState;
    private constructor() {
        super();
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
        isValid = isValid && value.length >= minLength;
    if (min != null && typeof value === 'number') 
        isValid = isValid && value >= min;

    if (maxLength != null && typeof value === 'string') 
        isValid = isValid && value.length <= maxLength;
    if (max != null && typeof value === 'number') 
        isValid = isValid && value <= max;
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

abstract class ParentComponent<T extends HTMLElement, U extends HTMLElement> {
    templateEle: HTMLTemplateElement;
    wrapperEle: T;
    element: U;

    constructor(templateId: string, hostElementId: string, 
        insertAtBeginning: boolean, newElementId?: string) {
        this.templateEle = document.getElementById(templateId) as HTMLTemplateElement;
        this.wrapperEle = document.getElementById(hostElementId) as T;

        const templateNode = document.importNode(this.templateEle.content, true);
        this.element = templateNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = `${newElementId}`;
        }
        this.append(insertAtBeginning);
    }

    private append(insertAtBeginning: boolean) {
        const insertPosition = insertAtBeginning ? 'afterbegin': 'beforeend';
        this.wrapperEle.insertAdjacentElement(insertPosition, this.element);
    }
    abstract configure(): void;
    abstract addContent(): void;
}
// ProjectList class:
// render list of projects
class ProjectList extends ParentComponent<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];
        
        this.configure();
        this.addContent();
    }

    addContent() {
        const listId = `${this.type}-project-list`;
        // add ! because we know the element is in the html
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} Projects`;
    }

    configure() {
        globalState.addListener((projects: Project[]) => {
            const validProjects = projects.filter(project => {
                if (this.type === 'active') 
                    return project.status === ProjectStatus.Active;
                return project.status === ProjectStatus.Finished;
            })
            this.assignedProjects = validProjects;
            this.renderProjects();
        })
    }

    private renderProjects() {
        const listEle = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEle.innerHTML = ''; // not ok for a large app --> performance
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
        }
    }
}

// ProjectItem class
class ProjectItem extends ParentComponent<HTMLUListElement, HTMLLIElement> 
        implements Draggable {
    private project: Project;
    get personnel() {
        const peopleCount = this.project.people;
        if (peopleCount === 1) 
            return '1 person';
        else 
            return `${peopleCount} people`;
    }
    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.addContent();
    }
    
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    addContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.personnel + ' working on this';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
    
    @autoBind
    dragStartHandler(event: DragEvent) {
        console.log(event);
    }
    
    dragEndHandler(_: DragEvent) {
        console.log('drag ended');
    }
}
// ProjectInput class: 
// Renders the form and validates form inputs
class ProjectInput extends ParentComponent<HTMLDivElement, HTMLFormElement> {
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
}
const projectInputInstance = new ProjectInput();
const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');