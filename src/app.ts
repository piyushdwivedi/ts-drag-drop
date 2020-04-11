/// <reference path="models/drag-drop-interface.ts" />
/// <reference path="models/project.ts" />
/// <reference path="state/global.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />

namespace App {
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}
