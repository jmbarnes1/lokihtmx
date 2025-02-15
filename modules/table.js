export function formatCell (value) 
{
    if (value && typeof value === 'object') 
    {
        //Format object contents as a key-value list.
        return `<ul class="list-unstyled mb-0">
            ${Object.entries(value).map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`).join('')}
        </ul>`;
    }
    return value !== null && value !== undefined ? value : '';
};
    

//Dynamically create a table.
export function createTableFromJSON (data)  
{
    //Ensure the array is not empty.
    if (!data || data.length === 0) 
    {
        return '<div class="alert alert-info text-center fw-bold">NO DATA!</div>';
    }

    //Pull column names (keys) from the first object in the dataset.
    let columns = Object.keys(data[0]).sort();

    columns.splice(columns.indexOf("meta"), 1);
    columns[columns.length] = "meta";

    //Generate the table shell with dynamic headers.
    const tableHTML = `
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr> 
                        ${columns.map(col => `<td>${formatCell(row[col])}</td>`).join('')}
                        <td class="text-center">
                            <i class="bi bi-pencil pe-2 pointer"
                                data-key="${row["$loki"]}"
                                data-action="updateDocumentModal"></i>
                            <i class="bi bi-trash pointer"
                                data-key="${row["$loki"]}"
                                data-action="deleteDocument"></i>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;

    return tableHTML;
};