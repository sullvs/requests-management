import { Database } from "bun:sqlite";
import parse from "csv-simple-parser";
const db = new Database("requests_db.sqlite");

const server = Bun.serve({
    port: 4000,
    async fetch(req) {
        const url = new URL(req.url);

        // return index.html for root path
        if (url.pathname === "/")
            return new Response(Bun.file("index.html"), {
                headers: {
                    "Content-Type": "text/html",
                },
            });

        // parse formdata at /action
        if (url.pathname === '/api/v1/action') {
            console.time("importTime"); // Start measuring import time
            const formdata = await req.formData();
            const request_csv = formdata.get('request_csv');
            if (!request_csv) throw new Error('Must upload a request csv file.');

            // Generate a new file name using timestamp
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const fileName = `uploads/request_csv_${timestamp}.csv`;

            // write profilePicture to disk
            await Bun.write(fileName, request_csv);
            //Read CSV File and Write to Database
            // Delete all records from the REQUEST table
            await db.query("DELETE FROM REQUEST").run();

            const file = Bun.file(fileName);
            console.time("total");
            const csv = parse(await file.text(), { header: true });
            const inputParameter = [];

            console.log('Rows from CSV File ' + csv.length);

            for (const row of csv) {
                const requestType = row.RequestType;
                const requestStatus = row.RequestStatus;
                const requestData = row.RequestData;

                // Build data object for each row
                const dataObject = {
                    $requestType: requestType,
                    $requestStatus: requestStatus,
                    $requestData: requestData
                };

                inputParameter.push(dataObject); // Add data object to the array
            }

            let insert = db.prepare(`
                            INSERT INTO REQUEST (RequestType, RequestStatus, RequestData)
                            VALUES ($requestType, $requestStatus, $requestData)`);

            let insertData = db.transaction(dataArray => {
                for (const data of dataArray) insert.run(data);
            })

            insertData(inputParameter);

            // Call the function to update tables
            updateTables();

            console.timeEnd("total");

            // Retrieve all rows from the requests table
            const rows = await db.query("SELECT * FROM REQUEST").all();

            // Retrieve statistics for each request type
            const statistics = {
                totalRecords: rows.length,
                newLicenseRequests: rows.filter(row => row.RequestType === 1).length,
                accountRequests: rows.filter(row => row.RequestType === 2).length,
                inspectionRequests: rows.filter(row => row.RequestType === 3).length,
                addActivityRequests: rows.filter(row => row.RequestType === 4).length,
                stampLicenseRequests: rows.filter(row => row.RequestType === 5).length
            };

            /*return new Response(Bun.file("success.html"), {
                headers: {
                    "Content-Type": "text/html",
                },
            });*/

            console.timeEnd("importTime"); // End measuring import time

            // Return success.html as response with summary information
            return new Response(generateSuccessHTML(statistics, performance.now()), {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        }

        return new Response("Not Found", { status: 404 });
    },
});

// Function to generate HTML with statistics and upload link
function generateSuccessHTML(statistics, importTime) {
    const importTimeInSeconds = importTime / 1000; // Convert milliseconds to seconds
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Upload Success</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
      <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-4">Upload Success</h1>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Summary Information</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-700"><span class="font-semibold">Total Records:</span> ${statistics.totalRecords}</p>
              <p class="text-gray-700"><span class="font-semibold">New License Requests:</span> ${statistics.newLicenseRequests}</p>
              <p class="text-gray-700"><span class="font-semibold">Account Requests:</span> ${statistics.accountRequests}</p>
              <p class="text-gray-700"><span class="font-semibold">Inspection Requests:</span> ${statistics.inspectionRequests}</p>
              <p class="text-gray-700"><span class="font-semibold">Add Activity Requests:</span> ${statistics.addActivityRequests}</p>
              <p class="text-gray-700"><span class="font-semibold">Stamp License Requests:</span> ${statistics.stampLicenseRequests}</p>
            </div>
            <div>
              <p class="text-gray-700"><span class="font-semibold">Import Time:</span> ${importTimeInSeconds.toFixed(2)} seconds</p>
            </div>
          </div>
          <a href="/" class="text-blue-500 mt-4 block">Upload Again</a>
        </div>
      </div>
    </body>
    </html>
  `;
}


// Function to update tables based on request type
const updateTables = async () => {
    try {
        // Retrieve all rows from the requests table
        const rows = await db.query("SELECT * FROM REQUEST").all();

        // Iterate through each row
        for (const row of rows) {
            // Parse the RequestData column to extract request type and details
            const requestData = JSON.parse(row.RequestData);
            const requestType = row.RequestType;

            // Determine the appropriate table based on request type
            switch (requestType) {
                case 1:
                    // Update NewLicense table
                    await db.query(`
                      INSERT INTO NewLicense (CompanyName, LicenceType, IsOffice, OfficeName, OfficeServiceNumber, RequestDate, Activities)
                      VALUES (?, ?, ?, ?, ?, ?, ?)
                  `).run(
                        requestData.CompanyName,
                        requestData.LicenceType,
                        requestData.IsOffice,
                        requestData.OfficeName,
                        requestData.OfficeServiceNumber,
                        requestData.RequestDate,
                        requestData.Activities
                    );
                    break;
                case 2:
                    // Update AccountRequest table
                    await db.query(`
                      INSERT INTO AccountRequest (CompanyName, RequesterName, ApplicantName, UserName, ContactEmail, Permissions)
                      VALUES (?, ?, ?, ?, ?, ?)
                  `).run(
                        requestData.CompanyName,
                        requestData.RequesterName,
                        requestData.ApplicantName,
                        requestData.UserName,
                        requestData.ContactEmail,
                        JSON.stringify(requestData.Permissions)
                    );
                    break;
                case 3:
                    // Update InspectionRequest table
                    await db.query(`
                      INSERT INTO InspectionRequest (CompanyName, InspectionDate, InspectionTime, InspectionType)
                      VALUES (?, ?, ?, ?)
                  `).run(
                        requestData.CompanyName,
                        requestData.InspectionDate,
                        requestData.InspectionTime,
                        requestData.InspectionType
                    );
                    break;
                case 4:
                    // Update AddActivity table
                    await db.query(`
                      INSERT INTO AddActivity (CompanyName, LicenceID, Activities)
                      VALUES (?, ?, ?)
                  `).run(
                        requestData.CompanyName,
                        requestData.LicenceID,
                        JSON.stringify(requestData.Activities)
                    );
                    break;
                case 5:
                    // Update StampLicense table
                    await db.query(`
                      INSERT INTO StampLicense (CompanyName, LicenceID, RequestDate)
                      VALUES (?, ?, ?)
                  `).run(
                        requestData.CompanyName,
                        requestData.LicenceID,
                        requestData.RequestDate
                    );
                    break;
                default:
                    console.log("Invalid request type");
                    break;
            }
        }
        console.log("Tables updated successfully");
    } catch (error) {
        console.error("Error updating tables:", error);
    }
};

console.log(`Listening on http://localhost:${server.port}`);