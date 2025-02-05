import {appState, showBaseLog} from "./modules/state.js";
import * as utils from "./modules/utils.js";
import {createTableFromJSON} from './modules/table.js';
import {handleExportFilteredCSV,handleExportDocumentCSV} from './modules/csv.js';

import {handleDeleteCollection, handleRenameCollection, handleRenameCollectionModal, handleAddCollection} from './modules/collectionHandlers.js';
import {handleNewDocument, handleUpdateDocument, handleSaveNewDocument, handleEditDocument, handleDeleteDocument, handleUpdateDocumentModal} from './modules/documentHandlers.js';
import {handleAddField, handleRenameField, handleDeleteField, handleRenameFieldModal, handleAddFieldModal, handleAddDocumentModal} from './modules/fieldHandlers.js';
import {handleSaveDatabase, handleRenameDatabase, handleRenameDatabaseModal, handleDeleteDatabase} from './modules/databaseHandlers.js';

import {handleListSwap, handleDBPortalSwap, handleCollectionPortalSwap, handleViewFieldsSwap, handleViewDataSwap, handleSearchSwap} from './modules/swapHandlers.js';

//When the universal modal is hidden, run this.
document.addEventListener (
    'hidden.bs.modal', 
    function (event) 
    {
        //This prevents an error in regards to hidden elements having focus.
        document.activeElement?.blur();
    }
);


//Event handlers.
const handlers = {
    addField:  handleAddField,
    deleteField: handleDeleteField,
    addFieldModal:  handleAddFieldModal,
    renameFieldModal: handleRenameFieldModal,
    renameField:  handleRenameField,
    addCollection:  handleAddCollection,
    renameCollectionModal:  handleRenameCollectionModal,
    deleteCollection:  handleDeleteCollection,
    renameCollection:  handleRenameCollection,
    addDocument:  handleNewDocument,
    addDocumentModal:  handleAddDocumentModal,
    updateDocumentModal:  handleUpdateDocumentModal,
    saveNewDocument:  handleSaveNewDocument,
    updateDocument:  handleUpdateDocument,
    editDocument:  handleEditDocument,
    deleteDocument:  handleDeleteDocument,
    saveDatabase:  handleSaveDatabase,
    deleteDatabase:  handleDeleteDatabase,
    renameDatabaseModal:  handleRenameDatabaseModal,
    renameDatabase: handleRenameDatabase,
    exportDocumentCSV:  handleExportDocumentCSV,
    fillInput: utils.handleFillInput,
    dataSearch:  handleDataSearch,
    exportFilteredCSV: handleExportFilteredCSV
}


document.addEventListener (
    'click', 
    (event) => 
    {
        
        //Get the action if exists.
        const actionElement = event.target.closest('[data-action]');
        
        //Route the action if it exists.
        if (actionElement) 
        {
            const action = actionElement.dataset.action;
            if (handlers[action]) 
            {
                event.stopPropagation();
                handlers[action](event, actionElement);
            }
        }
    }
);


const fragmentHandlers = {
    "hxList.html": handleListSwap,
    "hxDBPortal.html": handleDBPortalSwap,
    "hxCollectionPortal.html": handleCollectionPortalSwap,
    "hxViewFields.html": handleViewFieldsSwap,
    "hxViewData.html": handleViewDataSwap,
    "hxSearch.html": handleSearchSwap,
};


//Run the function after HTMX content swaps.
document.body.addEventListener (
    "htmx:afterSwap", 
    event => 
    {
        //Check if the breadcrumb container is part of the swap
        if (event.target.id === "breadCrumbContainer" || event.target.contains(document.getElementById("breadCrumbContainer"))) 
        {
            utils.updatePlaceholders();
        }

        //Determine where the fragment came from (if needed)
        const fragmentName = event.detail.pathInfo.requestPath || 'unknown';

        showBaseLog(fragmentName);

        if (fragmentHandlers[fragmentName]) {
           fragmentHandlers[fragmentName]();
        } 
        else {
           console.warn(`No handler defined for fragment: ${fragmentName}`);
        }

    }
);


function handleDataSearch(event, element) {

    const searchField = document.getElementById("searchField").value;
    const searchOperator = document.getElementById("searchOperator").value;
    const searchValue = document.getElementById("searchValue").value;

    const results = appState.lokiCollection.find({[searchField]: { [searchOperator] : [searchValue]}});

    //Generate the table and add it to the DOM
    var holdSearch = document.getElementById('holdSearch');

    //Display the data.
    holdSearch.innerHTML = createTableFromJSON(utils.normalizeDataset(results));

    appState.filteredData = results;
}