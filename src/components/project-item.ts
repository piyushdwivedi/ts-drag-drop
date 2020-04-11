/// <reference path="base-component.ts" />

namespace App {
    // ProjectItem class
    export class ProjectItem extends ParentComponent<HTMLUListElement, HTMLLIElement> 
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
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
        }

        dragEndHandler(_: DragEvent) {
            console.log('drag ended');
        }
    }
}