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
            });

            db.saveDatabase();

        } else if (databaseType === "indexeddb") {
            
            //Create a new indexeddb database and save it.
            //Actually, it will not save if it is only a name.  A collection will have to be added.
            //This is expected behavior.

            //Log the indexed database.
            registerIndexedDBDatabase(databaseNameInput.value);
            
        }
        
        let databaseProfileContainer = document.getElementById("databaseProfileContainer");

        //Refresh the page.
        htmx.ajax("GET","hxList.html","#mainContentContainer");
    }
}


export function handleRenameDatabaseModal(event, element) {
    const databaseName = event.target.dataset.databasetorename;
    
    showModal ({
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
        }]
    });

    focusAndSelectElement("newDatabaseName", 250);
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
                        console.log('IndexedDb delete finished.')  
                    
                    })
                    .catch((err) => console.error("Error:", err));

                //Remove from indexed db list.
                let index = lokiIndexedDBList.indexOf(dbToDelete); //Find the index.
                
                if (index !== -1) {
                    lokiIndexedDBList.splice(index, 1); //Remove the element at index.

                    localStorage.setItem("lokiIndexedDBList", JSON.stringify(lokiIndexedDBList));
                }
            }
            else { 
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


export async function handleRenameDatabase(event, element) {

    const newDatabaseName = document.getElementById("newDatabaseName").value;
    const oldDatabaseName = document.getElementById("oldDatabaseName").value;

    //Retrieve the list of indexedDB.
    const lokiIndexedDBList = JSON.parse(localStorage.getItem("lokiIndexedDBList")) || [];

    //Is the database a local storage database or an indexeddb database?
    if (lokiIndexedDBList.includes(oldDatabaseName)) {

        console.log('idx')
        try {
            await renameIndexedDBDatabase(oldDatabaseName, newDatabaseName);

            const index = lokiIndexedDBList.findIndex(x => x === oldDatabaseName);
            if (index !== -1) {
                lokiIndexedDBList[index] = newDatabaseName;
            }
            
            localStorage.setItem("lokiIndexedDBList", JSON.stringify(lokiIndexedDBList));

        } catch (error) {
            console.error("Failed to rename IndexedDB database:", error);
            return;
        }

    }
    else {
        console.log('local')

        //Stash the old database.
        let oldDatabase = JSON.parse(localStorage.getItem(oldDatabaseName));

        //Change the name.
        oldDatabase.filename = newDatabaseName;

        //Store the newly named database.
        localStorage.setItem(newDatabaseName, JSON.stringify(oldDatabase));
        
        //Remove the old database.
        localStorage.removeItem(oldDatabaseName);
    }

    //Close the modal.
    bootstrap.Modal.getInstance(document.getElementById('universalModal')).hide();
    
    //Refresh the page.
    htmx.ajax("GET","hxList.html","#mainContentContainer");    
}


function renameIndexedDBDatabase(oldName, newName) {
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
                    console.warn(`Database '${oldName}' not found in LokiAKV.`);
                    return resolve();
                }

                let record = cursor.value;
                console.log("record:  ",record);


                //Extract the database name.
                let parsedVal = JSON.parse(record.val);
                let storedDbName = parsedVal.filename; 

                if (storedDbName === oldName) {
                    console.log(`Renaming database '${oldName}' to '${newName}'.`);

                    // **Update filename**
                    parsedVal.filename = newName;

                    // **Update appKey**
                    if (parsedVal.appKey && parsedVal.appKey.startsWith("loki,")) {
                        parsedVal.appKey = `loki,${newName}`;
                    }

                    let newRecord = {
                        key: newName, // New key
                        val: JSON.stringify(parsedVal) // Updated value
                    };

                    // Insert the new record.
                    let addRequest = store.add(newRecord);
                    addRequest.onsuccess = () => {
                        console.log(`New record added with key: ${newName}`);

                        // Delete the old record.
                        store.delete(cursor.key).onsuccess = () => {
                            console.log(`Old record '${oldName}' deleted successfully.`);
                            resolve();
                        };
                    };

                    addRequest.onerror = (err) => {
                        console.error("Error inserting new record:", err);
                        reject(err);
                    };

                    return; // Stop iteration after handling rename.
                }

                // Move to the next record.
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

