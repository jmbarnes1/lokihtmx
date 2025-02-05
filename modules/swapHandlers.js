import {appState } from "./state.js";
import * as utils from "./utils.js";
import {createTableFromJSON} from './table.js';

export function handleListSwap() {
    const localStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        localStorageKeys.push(localStorage.key(i));
    }
    localStorageKeys.sort();

    const databaseListContainer = document.getElementById("databaseListContainer");
    databaseListContainer.innerHTML = "";

    for (const key of localStorageKeys) {
        const localVariableContent = localStorage.getItem(key);
        if (utils.isJsonString(localVariableContent)) {
            const holdJSON = JSON.parse(localVariableContent);
            if (holdJSON.hasOwnProperty("databaseVersion")) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("list-group-item");

                const element = document.createElement("span");
                element.setAttribute("hx-get", "hxDBPortal.html");
                element.setAttribute("hx-target", "#mainContentContainer");
                element.setAttribute("hx-swap", "innerHTML");
                element.setAttribute("hx-trigger", "click");
                element.setAttribute("hx-on::before-request", `selectedDatabase="${holdJSON.filename}"`);
                element.classList.add("pointer");
                element.textContent = holdJSON.filename;

                const dbIcon = document.createElement("i");
                dbIcon.classList.add("db", "bi-database");
                element.prepend(dbIcon);

                const trashIcon = document.createElement("i");
                trashIcon.classList.add("bi", "bi-trash", "pointer", "float-end");
                trashIcon.setAttribute("data-action", "deleteDatabase");
                trashIcon.setAttribute("data-databasetoremove", holdJSON.filename);

                const pencilIcon = document.createElement("i");
                pencilIcon.classList.add("bi", "bi-pencil", "pointer", "float-end", "ps-4", "pe-4");
                pencilIcon.setAttribute("data-action", "renameDatabaseModal");
                pencilIcon.setAttribute("data-databasetorename", holdJSON.filename);

                wrapper.prepend(pencilIcon, trashIcon, element);
                databaseListContainer.append(wrapper);

                htmx.process(element);
            }
        }
    }
}


export function handleDBPortalSwap() {

    //Set app state.
    appState.databaseCurrent = selectedDatabase;

    //Initialize the database.
    appState.lokiDatabase = new loki
    (
        selectedDatabase,
        {
            persistenceMethod: 'localStorage'
        }
    );

    // Load the database
    appState.lokiDatabase.loadDatabase();

    // Get the collections for this database.
    if (appState.lokiDatabase.listCollections().length > 0)
    {
        const listCollectionsContainer = document.getElementById("listCollectionsContainer");
        listCollectionsContainer.innerHTML = "";
        
        for (let i = 0; i < appState.lokiDatabase.listCollections().length; i++)
        {
            
            let collectionName = appState.lokiDatabase.listCollections()[i].name;

            let elementHTML = `
                <span class="pointer"
                    hx-get="hxCollectionPortal.html"
                    hx-target="#mainContentContainer"
                    hx-swap="innerHTML"
                    hx-trigger="click"
                    hx-vals='{"collection":"${collectionName}"}'
                    hx-on::before-request='selectedCollection="${collectionName}"'>
                    <i class="db bi-collection"></i>
                    ${collectionName}
                </span>`;
            
            let trashIcon = `
                <i class="bi bi-trash float-end pointer" 
                    data-action="deleteCollection"
                    data-collectiontodelete="${collectionName}"></i>`
            let editIcon = `
                <i class="bi bi-pencil float-end pointer ps-4 pe-4" 
                    data-action="renameCollectionModal"
                    data-collectiontoedit="${collectionName}"></i>`

            const wrapper = document.createElement('div');
            wrapper.classList.add("list-group-item");
            wrapper.innerHTML = `${elementHTML} ${trashIcon} ${editIcon}`;

            listCollectionsContainer.prepend(wrapper);
            const newElement = listCollectionsContainer.firstElementChild;

            // Make sure the new element can use HTMX.
            htmx.process(newElement);
        }
    }
}


export function handleCollectionPortalSwap () {

    document.getElementById("deleteCollectionButton").setAttribute('data-collectiontodelete', appState.collectionCurrent);

    //Set the collection.
    appState.lokiCollection = appState.lokiDatabase.getCollection(selectedCollection);

    //Set app state.
    appState.databaseCurrent = selectedDatabase;
    appState.collectionCurrent = selectedCollection;

    //Get the fields.
    appState.fieldsCurrentArray = utils.getCollectionStructure(appState.lokiDatabase.getCollection(appState.collectionCurrent));

    //Organize fields.
    appState.fieldsCurrentArray.splice(appState.fieldsCurrentArray.indexOf("meta"), 1);
    appState.fieldsCurrentArray[appState.fieldsCurrentArray.length] = "meta";
}


export function handleViewFieldsSwap() {

    //Build the list group of fields.
    if (appState.fieldsCurrentArray.length > 0) {
        const fieldsListGroup = document.getElementById('fieldsListGroup');
        fieldsListGroup.innerHTML = "";

        appState.fieldsCurrentArray.forEach
        (
            field => 
            {
                const fieldDiv = addFieldToListGroup(field);   
                fieldsListGroup.append(fieldDiv);
            }
        );
    }
    else {
        const fieldsListGroup = document.getElementById('fieldsListGroup');

        const fieldDiv = document.createElement("div");
        fieldDiv.classList.add("list-group-item","list-group-item-danger");
        fieldDiv.textContent = "NO FIELDS EXIST YET!"

        fieldsListGroup.prepend(fieldDiv);
    }
}


export function handleViewDataSwap () {

    //Generate the table and add it to the DOM.  Filter out document 1.  It's the model.
    const holdTable = document.getElementById('holdTable');
    holdTable.innerHTML = createTableFromJSON(utils.normalizeDataset(appState.lokiCollection.data).filter(document => document["$loki"] !== 1));
}


export function handleSearchSwap () {

    //Build the list group of fields.
    if (appState.fieldsCurrentArray.length > 0) {
        const searchListGroup = document.getElementById('searchListGroup');

        appState.fieldsCurrentArray.forEach
        (
            field => 
            {
                const fieldContainer = document.createElement('div');
                
                if (field != 'meta')
                {
                    
                    fieldContainer.dataset.action = "fillInput";
                    fieldContainer.dataset.field = field;
                    fieldContainer.dataset.target = "searchField";
                    fieldContainer.classList.add("pointer");
                    
                    fieldContainer.innerHTML = `
                        <i class="db bi bi-input-cursor-text pointer" 
                            data-action="fillInput"
                            data-field="${field}"
                            data-target="searchField"></i>
                        ${field}`;
                }
                else
                {
                    fieldContainer.innerHTML = `
                        <i class="bi bi-input-cursor-text"></i>
                        ${field}`;
                }

                searchListGroup.append(fieldContainer);

            }
        );
    }

}


//This adds fields to the list group display.
function addFieldToListGroup(fieldName)
{
    const fieldContainer = document.createElement('div');
    fieldContainer.classList.add("list-group-item");
    
    if ((fieldName != '$loki') && (fieldName != 'meta'))
    {
        fieldContainer.innerHTML = `
            <i class="db bi-file"></i>
            ${fieldName}
            <i class="bi bi-trash pointer float-end ps-5 pe-5"
                data-fieldname="${fieldName}" 
                data-action="deleteField"></i>
            <i class="bi bi-pencil pointer float-end"
                data-fieldname="${fieldName}" 
                data-action="renameFieldModal"></i>`;
    }
    else
    {
        fieldContainer.innerHTML = `
            <i class="bi bi-file"></i>
            ${fieldName}`;
    }

    return fieldContainer;
}

