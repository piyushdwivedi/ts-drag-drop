import {Project, ProjectStatus} from '../models/project';


type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

// class for global state
export class GlobalState extends State<Project> {
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
        this.updateListeners();
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn([...this.projects]);
        }
    }
    moveProject(projectId: string, newStatus: ProjectStatus) {
        const prj = this.projects.find(prj => prj.id === projectId);
        if (prj && prj.status !== newStatus) {
            prj.status = newStatus;
            this.updateListeners();
        }
    }

}
export const globalState = GlobalState.getInstance();
