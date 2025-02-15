import { userConfirm, showModal, focusAndSelectElement } from "./utils.js";

export function handleSaveDatabase(event, element) {
 
    const databaseNameInput = document.getElementById("databaseNameInput");

    const databaseType = document.querySelector('input[name="databaseType"]:checked')?.value;
    
    if (databaseNameInput.value != "") {

        if (databaseType === "local") {
            //Create a new local database and save it.
            let db = new loki (
                    databaseNameInput.value,
                    {
                        persistenceMethod: 'localStorage'
                    }
                );
            
        } else if (databaseType === "indexeddb") {
            
            //Create a new indexeddb database and save it.
            const db = new loki (
                databaseNameInput.value, { 
                    adapter: new LokiIndexedAdapter(),
                    persistenceMethod: "adapter",
                    autosave: true,
                    autoload: true,
                    autosaveInterval: 4000,
                    throttledSaves: false
                }
            );

            db.saveDatabase();

            //Log the indexed database.
            registerIndexedDBDatabase(databaseNameInput.value);
            
            db.close();
        }
        
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


function registerIndexedDBDatabase(databaseName) {

    let lokiIndexedDBList = JSON.parse(localStorage.getItem("lokiIndexedDBList")) || [];

    if (!lokiIndexedDBList.includes(databaseName)) {

        lokiIndexedDBList.push(databaseName);
        localStorage.setItem("lokiIndexedDBList", JSON.stringify(lokiIndexedDBList));
    }
}


export function handleDeleteDatabase(event, element) {

    if (userConfirm()) 
        {
            const dbToDelete  = event.target.getAttribute("data-databaseToRemove");
        
            let lokiIndexedDBList = JSON.parse(localStorage.getItem("lokiIndexedDBList")) || [];
            
            if (lokiIndexedDBList.includes(dbToDelete)) {
                
                deleteLokiIndexedDBDatabase(dbToDelete)
                    .then(() => {
                        console.log("Database deleted.")
                        
                        //Remove from indexed db list.
                        let index = lokiIndexedDBList.indexOf(dbToDelete); //Find the index.
                        if (index !== -1) {
                            lokiIndexedDBList.splice(index, 1); //Remove the element at index.

                            localStorage.setItem("lokiIndexedDBList", JSON.stringify(lokiIndexedDBList));
                        }
                    
                    })
                    .catch((err) => console.error("Error:", err));
            }
            else { console.log('2');
                localStorage.removeItem(dbToDelete);
            }

            htmx.ajax("GET","hxList.html","#mainContentContainer");
        }
}


function deleteLokiIndexedDBDatabase(dbName) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("LokiCatalog");

        request.onsuccess = (event) => {
            let db = event.target.result;
            
            if (!db.objectStoreNames.contains("LokiAKV")) {
                console.error("LokiAKV object store not found.");
                return reject("LokiAKV object store missing.");
            }

            let transaction = db.transaction("LokiAKV", "readwrite");
            let store = transaction.objectStore("LokiAKV");
            let cursorRequest = store.openCursor();

            cursorRequest.onsuccess = (event) => {
                let cursor = event.target.result;
                if (!cursor) {
                    console.warn(`Database '${dbName}' not found in LokiAKV.`);
                    return resolve();
                }

                let record = cursor.value;
                
                //Extract the database name.
                let storedDbName = JSON.parse(record.val).filename; 

                if (storedDbName === dbName) {
                    console.log(`Deleting record with ID: ${cursor.key}, DB Name: ${storedDbName}`);
                    store.delete(cursor.key).onsuccess = () => {
                        console.log(`Database '${dbName}' deleted successfully.`);
                        resolve();
                    };
                    //Stop once database is found.
                    return; 
                }
                
                //Move to the next record.
                cursor.continue(); 
            };

            cursorRequest.onerror = (err) => {
                console.error("Error iterating LokiAKV records:", err);
                reject(err);
            };
        };

        request.onerror = (err) => {
            console.error("Error opening LokiCatalog:", err);
            reject(err);
        };
    });
}
