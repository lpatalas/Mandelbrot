

function findElementById<T>(id: string, elementType: { new(): T }): T {
    const element = document.getElementById(id);
    if (!element || !(element instanceof elementType)) {
        throw new Error(`Can't find element: ${id}`);
    }

    return element;
}

function findElementBySelector<T>(selector: string, elementType: { new(): T }): T {
    const element = document.querySelector(selector);
    if (!element || !(element instanceof elementType)) {
        throw new Error(`Can't find element: ${selector}`);
    }

    return element;
}

function px(x: number) {
    return `${x}px`;
}