import { appState } from "./state.js";


//Used by code see if locally stored variable is a JSON object.
export function isJsonString(str) {
    try 
    {
        JSON.parse(str);
    } 
    catch (e) 
    {
        return false;
    }

    return true;
}


//Simple confirm.  Used with deletes normally.
export function userConfirm(message = 'Are you sure?') {
    return confirm(message);
}


//Set focus.  Used in modals.
export function focusAndSelectElement(elementId, delay = 250) {
    setTimeout
    (
        () => 
        {
            const element = document.getElementById(elementId);
            if (element) 
            {
                element.focus();
                element.select();
            } 
            else 
            {
                console.warn(`Element with ID "${elementId}" not found.`);
            }
        }, 
        delay
    );
}


//Helper function to create and append input fields.
export function appendInputField(container, fieldName, fieldValue, isReadOnly) 
{
    const element = document.createElement("div");
    element.classList.add("pb-2");

    element.innerHTML = `
        <label for="${fieldName}" class="control-label">${fieldName}</label>
        <div>
            <input type="text" 
                name="${fieldName}" 
                id="${fieldName}"
                value="${fieldValue}"
                class="form-control" 
                autocomplete="off"
                ${isReadOnly ? "readonly" : ""}>
        </div>`;

    container.append(element);
}


export function showModal(options) 
{
    const modalTitle = document.getElementById('universalModalTitle');
    const modalBody = document.getElementById('universalModalBody');
    const modalFooter = document.getElementById('universalModalFooter');

    // Set title
    modalTitle.textContent = options.title || 'Default Title';

    // Set body content
    modalBody.innerHTML = options.body || '';

    // Clear previous footer buttons
    modalFooter.innerHTML = '';

    // Add footer buttons dynamically
    if (options.footerButtons && options.footerButtons.length) 
    {
        options.footerButtons.forEach
        (
            button => 
            {
                const btn = document.createElement('button');
                btn.type = button.type || 'button';
                btn.className = button.class || 'btn btn-primary';
                btn.textContent = button.label || 'Button';
                btn.dataset.action = button.buttonAction || '';
                btn.id = "universalModalButton";

                if (button.icon) 
                {
                    btn.innerHTML = `<i class="${button.icon}"></i> ${button.label}`;
                }
                
                modalFooter.appendChild(btn);
            }
        );
    }

    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('universalModal'));
    modal.show();
}


//Get a list of unique fields in a collection
export function getCollectionStructure(collection) 
{
    const uniqueFields = new Set();
    collection.find().forEach
    (
        (doc) => 
        {
            Object.keys(doc).sort().forEach((key) => uniqueFields.add(key));
        }
    );
    
    return Array.from(uniqueFields);
}


//Shows DB or Collection name in menu items.
export function updatePlaceholders() 
{
    // Update database name placeholders
    [...document.getElementsByClassName("dbName")].forEach
    (
        element => 
        {
            element.innerHTML = appState.databaseCurrent;
        }
    );

    // Update collection name placeholders
    [...document.getElementsByClassName("collectionName")].forEach
    (
        element => 
        {
            element.
            innerHTML = appState.collectionCurrent;
        }
    );
}


export function handleFillInput (event, element) {

    //Two methods to do this.
    const field = event.target.getAttribute("data-field");
    const target = event.target.dataset.target;

    document.getElementById(target).value = field;
}

export function normalizeDataset (data) {
    const allKeys = [...new Set(data.flatMap(document => Object.keys(document)))];
    return data.map
    (
        document => 
        {
            const normalizedDocument = {};
            allKeys.forEach(key => normalizedDocument[key] = document[key] || null);
            return normalizedDocument;
        }
    );
};