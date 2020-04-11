import {ParentComponent} from '../components/base-component';
import {Project, ProjectStatus} from '../models/project';
import {DragTarget} from '../models/drag-drop-interface';
import {globalState} from '../state/global';
import {autoBind} from '../decorators/autobind';
import {ProjectItem} from './project-item';

// ProjectList class:
// render list of projects
export class ProjectList extends ParentComponent<HTMLDivElement, HTMLElement>
implements DragTarget {
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
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

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

@autoBind
dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
    event.preventDefault();
    const ulListEle = this.element.querySelector('ul')!;
    ulListEle.classList.add('droppable');
    }
}

@autoBind
    dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain');
    const prjStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;
    globalState.moveProject(prjId, prjStatus);
}

@autoBind
dragLeaveHandler(_: DragEvent){
    const ulListEle = this.element.querySelector('ul')!;
    ulListEle.classList.remove('droppable');
}


private renderProjects() {
    const listEle = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listEle.innerHTML = ''; // not ok for a large app --> performance
    for (const prjItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
        }
    }
}
