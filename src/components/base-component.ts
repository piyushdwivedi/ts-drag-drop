namespace App {
    export abstract class ParentComponent<T extends HTMLElement, U extends HTMLElement> {
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
}