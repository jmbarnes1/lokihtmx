import { appState } from "./state.js";
import { userConfirm, appendInputField, showModal } from "./utils.js";

export function handleNewDocument(event, element) {
    
    if (appState.fieldsCurrentArray.length > 0)
    {
        let newDocumentModalContent = document.getElementById('newDocumentModalContent');
        
        newDocumentModalContent.innerHTML = "";

        //Loop through the array and create spans
        appState.fieldsCurrentArray.forEach
        (
            field => 
            {
                if ((field != '$loki') && (field != 'meta'))
                {
                    
                    const element = document.createElement("div");
                    element.classList.add("p-2");

                    element.innerHTML = `
                        <label for="${field}" class="control-label">${field}</label>
                        <div>
                            <input type="text" 
                                name="${field}" 
                                id="${field}"
                                value=""
                                class="form-control" 
                                autocomplete="off">
                        </div>`;

                        newDocumentModalContent.append(element);
                }
            }
        );
    }
}


export function handleUpdateDocument(event, element) {
    
    //Get the form.
    const form = document.querySelector('#updateDocumentForm');

    //Get field data for the form.
    //Returns a FormData object.
    const data = new FormData(form);
    
    const lokiKey = parseInt(data.get("$loki"));
    
    let lokiDoc = appState.lokiCollection.by("$loki", lokiKey);

    let formData = Object.fromEntries
    (
        Array.from
        (
            data.keys()
        ).map
        (
            key => [key, data.getAll(key).length > 1 ? data.getAll(key) : lokiDoc[key] = data.get(key)]   
        )
    )

    lokiDoc["$loki"] = lokiKey;

    appState.lokiCollection.update(lokiDoc);

    //Save the new structure
    appState.lokiDatabase.saveDatabase();

    const updateModalContent = document.getElementById("updateModalContent");
    updateModalContent.innerHTML = '<div class="alert alert-success text-center fw-bold">UPDATED!</div>';

    document.getElementById("universalModalButton").style.display = "none";

    htmx.ajax("GET","hxViewData.html","#collectionPortalContainer");
}


export function handleSaveNewDocument(event, element) {
    //Get the form
    let newDocumentForm = document.querySelector('#newDocumentForm');

    //Get all field data from the form
    //returns a FormData object
    let newDocumentFormData = new FormData(newDocumentForm);

    let formData = Object.fromEntries
    (
        Array.from
        (
            newDocumentFormData.keys()
        ).map
        (
            key => [key, newDocumentFormData.getAll(key).length > 1 ? newDocumentFormData.getAll(key) : newDocumentFormData.get(key)]
        )
    )

    appState.lokiCollection.insert(formData);

    //Save the new structure
    appState.lokiDatabase.saveDatabase();

    const newDocumentModalContent = document.getElementById("newDocumentModalContent");
    newDocumentModalContent.innerHTML = '<div class="alert alert-success text-center fw-bold">SAVED!</div>';

    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();

    htmx.ajax("GET","hxViewData.html","#collectionPortalContainer");
}


export function handleEditDocument(event, element) {

    const key = event.target.dataset.key;

    let holdCollection = appState.lokiCollection.find({"$loki":parseInt(key)});

    if (appState.fieldsCurrentArray.length > 0)
    {
        let updateModalContent = document.getElementById('updateModalContent');
        
        updateModalContent.innerHTML = "";

        //Loop through the array and create spans.
        appState.fieldsCurrentArray.forEach
        (
            field => 
            {
                if (field === '$loki') 
                {
                    appendInputField(updateModalContent, field, holdCollection[0][field], true);
                } 
                else if (field !== 'meta') 
                {
                    const fieldValue = holdCollection[0][field] !== undefined ? holdCollection[0][field] : "";
                    appendInputField(updateModalContent, field, fieldValue, false);
                }
            }
        );
    }
}


export function handleDeleteDocument(event, element) {

    if(userConfirm())
    {
        const key = event.target.dataset.key;

        appState.lokiCollection.data = appState.lokiCollection.data.filter(document => document["$loki"] != key);
        
        //Save the new structure.
        appState.lokiDatabase.saveDatabase();
        
        //Refresh the page.
        htmx.ajax("GET","hxViewData.html","#collectionPortalContainer");
    }
}


export function handleUpdateDocumentModal(event, element) {
    showModal
    (
        {
            title: 'FORM',
            body: `
                <form name="updateDocumentForm" id="updateDocumentForm" autocomplete="off">
                    <div id="updateModalContent"></div>
                </form>`,
            footerButtons: [
                {
                    label: 'UPDATE',
                    class: 'btn btn-primary',
                    icon: 'bi bi-save',
                    buttonAction: 'updateDocument'
                }
            ]
        }
    );

    handleEditDocument(event,element);
}