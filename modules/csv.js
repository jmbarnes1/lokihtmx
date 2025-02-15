import { appState } from "./state.js";

//Trigger CSV download
export function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.click();
    
    //Clean up the URL object
    URL.revokeObjectURL(url); 
}


//Handle exporting filtered data to CSV.
export function handleExportFilteredCSV(filteredData, filename) {

    //Generate CSV content for filtered data.
    const csvContent = generateCSV(appState.filteredData, appState.fieldsCurrentArray);

    //Trigger the download.
    downloadCSV(csvContent, appState.collectionCurrent + '.csv');
}


export function handleExportDocumentCSV(event, element){

    //Get all data from the collection
    const data = appState.lokiCollection.data;

    //Generate CSV content
    const csvContent = generateCSV(data, appState.fieldsCurrentArray);

    //Trigger download
    downloadCSV(csvContent, appState.collectionCurrent + '.csv');
}


//Utility function to convert data to CSV format.
//replacer will send in the value or an empty string.
export function generateCSV(data, fields, replacer = (key, value) => value ?? '') {
    
    //Convert the fields array to a CSV header row
    const headerRow = fields.join(',');

    //Convert each data row to CSV format
    const csvRows = data.map((row) =>
        fields.map((field) => JSON.stringify(row[field], replacer)).join(',')
    );

    //Combine header and rows into the final CSV string
    return [headerRow, ...csvRows].join('\r\n');
}