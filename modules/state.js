export const appState = {
    databaseCurrent: "",
    databaseType: "",
    lokiDatabase: [],
    collectionCurrent: "",
    lokiCollection: [],
    fieldsCurrentArray: [],
    filteredData: [],
};

export function updateState(key, value) {
    if (appState.hasOwnProperty(key)) {
        appState[key] = value;
    }
}

//export function showBaseLog(whereAmI = '',currentStateObject)
export function showBaseLog(whereAmI = '')
{
    console.clear();
    console.log("==============================================================================================================");
    console.log(`== Page:  ${whereAmI}`);

    if (appState.databaseCurrent && appState.databaseCurrent != '') {
        console.log(`== Active Database:  ${appState.databaseCurrent}`);
    }
    if (appState.collectionCurrent && appState.collectionCurrent != '') {
        console.log(`== Active Collection:  ${appState.collectionCurrent}`);
    }
    if (appState.fieldsCurrentArray && appState.fieldsCurrentArray != '') {
        console.log(`== Current fields:  ${appState.fieldsCurrentArray}`);
    }

    console.log("==============================================================================================================");
    console.log();
    console.log();
}
