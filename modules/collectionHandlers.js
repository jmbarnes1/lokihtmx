import {appState } from "./state.js";
import {userConfirm, showModal, focusAndSelectElement } from "./utils.js";


export function handleDeleteCollection(event, element) {

    if (userConfirm()) 
    {
        let collectionToDelete  = event.target.getAttribute("data-collectiontodelete");
        
        appState.lokiDatabase.removeCollection(collectionToDelete);
        appState.lokiDatabase.saveDatabase();

        htmx.ajax("GET","hxDBPortal.html","#mainContentContainer");
    }
}


export function handleRenameCollection(event, element) {

    const oldCollectionName = document.getElementById("oldCollectionName").value;
    const newCollectionName = document.getElementById("newCollectionName").value;

    appState.lokiDatabase.renameCollection(oldCollectionName,newCollectionName);
    appState.lokiDatabase.saveDatabase();

    //Close the modal.
    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();
    
    //Refresh the page.
    htmx.ajax("GET","hxDBPortal.html","#mainContentContainer");    
}


export function handleRenameCollectionModal(event, element) {
    
    const collectionName = event.target.dataset.collectiontoedit;

    showModal
    (
        {
            title: 'RENAME COLLECTION',
            body: `
                <form name="renameCollection" id="renameCollection" autocomplete="off">
                    <div id="renameCollectionModalContent">

                        <label to="collectionName" class="control-label">COLLECTION NAME</label>
                        <div>
                            <input type="text" 
                                name="oldCollectionName" 
                                id="oldCollectionName"
                                value="${collectionName}"
                                class="form-control" 
                                readonly>
                        </div>

                        <label to="collectionName" class="control-label">COLLECTION NAME</label>
                        <div>
                            <input type="text" 
                                name="newCollectionName" 
                                id="newCollectionName"
                                value="${collectionName}"
                                class="form-control" 
                                autocomplete="off">
                        </div>
                    </div>
                </form>`,
            footerButtons: [
                {
                    label: 'SAVE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'renameCollection'
                }
            ]
        }
    );

    focusAndSelectElement("newCollectionName", 250);
}


export function handleAddCollection(event, element) {
    
    const collectionNameInput = document.getElementById("collectionNameInput");

    if (collectionNameInput.value != "")
    {  
        appState.lokiDatabase.addCollection(collectionNameInput.value);
        appState.lokiDatabase.saveDatabase();

        let collectionContainer = document.getElementById("collectionContainer");

        var element = document.createElement("div");
        element.classList.add("alert");
        element.classList.add("alert-success");
        element.classList.add("text-center");
        element.classList.add("fw-bold");
        element.innerHTML= "SAVED!";

        collectionContainer.innerHTML = "";
        collectionContainer.append(element);

        //Refresh the page.
        htmx.ajax("GET","hxDBPortal.html","#mainContentContainer");
    } 
}