import {userConfirm, showModal, focusAndSelectElement } from "./utils.js";

export function handleSaveDatabase(event, element) {
 
    const databaseNameInput = document.getElementById("databaseNameInput");
    
    if (databaseNameInput.value != "")
    {
        //Create a new database and save it.
        var db = new loki(databaseNameInput.value);
        db.saveDatabase();
        
        let databaseProfileContainer = document.getElementById("databaseProfileContainer");

        //Create a div to contain a success message.
        let element = document.createElement("div");
        element.classList.add("alert");
        element.classList.add("alert-success");
        element.classList.add("text-center");
        element.classList.add("fw-bold");
        element.innerHTML= "SAVED!";

        databaseProfileContainer.innerHTML = "";
        databaseProfileContainer.append(element);

        //Refresh the page.
        htmx.ajax("GET","hxList.html","#mainContentContainer");
    }
}

export function handleDeleteDatabase(event, element) {

    if (userConfirm()) 
        {
            const dbToDelete  = event.target.getAttribute("data-databaseToRemove");
        
            localStorage.removeItem(dbToDelete);

            htmx.ajax("GET","hxList.html","#mainContentContainer");
        }
}

export function handleRenameDatabaseModal(event, element) {
    const databaseName = event.target.dataset.databasetorename;
    
    showModal
    (
        {
            title: 'RENAME DATABASE',
            body: `
                <label for="oldDatabaseName" class="form-label">OLD NAME</label>
                <div>
                    <input type="text" 
                        name="oldDatabaseName" 
                        id="oldDatabaseName" 
                        value="${databaseName}"
                        class="form-control"
                        readonly>
                </div>
                <label for="databaseNameInput" class="form-label">NEW NAME</label>
                <div>
                <input type="text" 
                        name="newDatabaseName" 
                        id="newDatabaseName" 
                        value="${databaseName}" 
                        class="form-control" 
                        autocomplete="off">
                </div>`,
            footerButtons: [
                {
                    label: 'SAVE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'renameDatabase'
                }
            ]
        }
    );

    focusAndSelectElement("newDatabaseName", 250);
}

export function handleRenameDatabase(event, element) {

    const newDatabaseName = document.getElementById("newDatabaseName");
    const oldDatabaseName = document.getElementById("oldDatabaseName");
    
    let oldDatabase = JSON.parse(localStorage.getItem(oldDatabaseName.value));

    oldDatabase.filename = newDatabaseName.value;

    localStorage.setItem(newDatabaseName.value, JSON.stringify(oldDatabase));
    
    localStorage.removeItem(oldDatabaseName.value);

    //Close the modal.
    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();
    
    //Refresh the page.
    htmx.ajax("GET","hxList.html","#mainContentContainer");    
}