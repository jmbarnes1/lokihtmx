import {appState } from "./state.js";
import {userConfirm, showModal, focusAndSelectElement, getCollectionStructure } from "./utils.js";
import {handleNewDocument } from './documentHandlers.js';

export function handleDeleteField(event, element) {
    if (userConfirm()) 
    {
        const fieldName = element.getAttribute('data-fieldname');

        const span = event.target.closest('span[data-fieldname]');

        //Delete the specified field in all documents.
        appState.lokiCollection.data.forEach
        (
            document => 
            {
                delete document[fieldName];
            }
        );
        
        //Save the new structure
        appState.lokiDatabase.saveDatabase();

        appState.fieldsCurrentArray = getCollectionStructure(appState.lokiDatabase.getCollection(appState.collectionCurrent));

        //Refresh the page.
        htmx.ajax("GET","hxViewFields.html","#collectionPortalContainer");
    }
}

export function handleAddField(event, element) {

    let fieldName = document.getElementById("fieldName");
    
    if (appState.lokiCollection.data.length === 0)
    {
        appState.lokiCollection.insert({[fieldName.value]:null});
        appState.lokiDatabase.saveDatabase();
    }
    else
    {
        let lokiDoc = appState.lokiCollection.by("$loki", '1')
        
        lokiDoc[fieldName.value] = null;

        appState.lokiCollection.update(lokiDoc);
        appState.lokiDatabase.saveDatabase();
    }

    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();

    appState.fieldsCurrentArray = getCollectionStructure(appState.lokiDatabase.getCollection(appState.collectionCurrent));

    htmx.ajax("GET","hxViewFields.html","#collectionPortalContainer");
}


export function handleRenameFieldModal(event, element) {
    const oldFieldName  = event.target.getAttribute("data-fieldname");

    showModal
    (
        {
            title: 'RENAME FIELD',
            body: `
                <label for="oldFieldName" class="form-label">OLD FIELD NAME</label>
                <div>
                    <input type="text" 
                        name="oldFieldName" 
                        id="oldFieldName" 
                        value="${oldFieldName}"
                        class="form-control"
                        readonly>
                </div>
                <label for="databaseNameInput" class="form-label">NEW FIELD NAME</label>
                <div>
                <input type="text" 
                        name="newFieldName" 
                        id="newFieldName" 
                        value="${oldFieldName}" 
                        class="form-control" 
                        autocomplete="off">
                </div>`,
            footerButtons: [
                {
                    label: 'SAVE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'renameField'
                }
            ]
        }
    );
    
    focusAndSelectElement("newFieldName", 250);
}


export function handleRenameField(event, element) {
    const oldFieldName = document.getElementById("oldFieldName").value;
    const newFieldName = document.getElementById("newFieldName").value;
    
    // Iterate through all documents in the collection
    appState.lokiCollection.find().forEach
    (
        doc => 
        {
            if (doc.hasOwnProperty(oldFieldName)) 
            {
                // Copy value from the old field to the new field
                doc[newFieldName] = doc[oldFieldName];

                // Remove the old field
                delete doc[oldFieldName];

                // Update the document in the collection
                appState.lokiCollection.update(doc);
            }
        }
    );

    appState.lokiDatabase.saveDatabase();

    appState.fieldsCurrentArray = getCollectionStructure(appState.lokiDatabase.getCollection(collectionCurrent));

    //Close the modal.
    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();

    htmx.ajax("GET","hxViewFields.html","#collectionPortalContainer");
}

export function handleAddFieldModal(event, element) {
    showModal
    (
        {
            title: 'FIELD NAME',
            body: `
                <div id="dFieldModalContent">
                    <label to="fieldName" class="control-label">FIELD NAME</label>
                    <div>
                        <input type="text" 
                            name="fieldName" 
                            id="fieldName"
                            value=""
                            class="form-control" 
                            autocomplete="off">
                    </div>
                </div>`,
            footerButtons: [
                {
                    label: 'SAVE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'addField'
                }
            ]
        }
    );  
}


export function handleAddDocumentModal(event, element) {
    showModal
    (
        {
            title: 'NEW DOCUMENT',
            body: `
                <form name="newDocumentForm" id="newDocumentForm" autocomplete="off">
                    <div id="newDocumentModalContent"></div>
                </form>`,
            footerButtons: [
                {
                    label: 'SAVE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'saveNewDocument'
                }
            ]
        }
    );

    handleNewDocument();
}