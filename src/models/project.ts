export enum ProjectStatus { Active, Finished}
// Custom Type - Project
export class Project {
    constructor(
        public id: string, 
        public title: string, 
        public description: string, 
        public people: number,
        public status: ProjectStatus) {

        }
}

