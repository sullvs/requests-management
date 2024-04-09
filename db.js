import { Database } from "bun:sqlite";

const db = new Database("requests_db.sqlite");

// Define the SQL statements to create the tables for each request type
const sqlStatements = [
    // REQUEST table
    `
    CREATE TABLE IF NOT EXISTS REQUEST (
        RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
        RequestType INTEGER CHECK(RequestType BETWEEN 1 AND 5),
        RequestStatus INTEGER CHECK(RequestStatus BETWEEN 1 AND 3),
        RequestData TEXT
    );
    `,
    // -- RequestType 3: Inspection Request
    `
    CREATE TABLE IF NOT EXISTS InspectionRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        InspectionDate TEXT,
        InspectionTime TEXT,
        InspectionType TEXT
    );
    `,
    // -- RequestType 2: Account Request
    `
    CREATE TABLE IF NOT EXISTS AccountRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        RequesterName TEXT,
        ApplicantName TEXT,
        UserName TEXT,
        ContactEmail TEXT,
        Permissions TEXT
    );
    `,
    // RequestType 1: New License
    `
    CREATE TABLE IF NOT EXISTS NewLicense (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        LicenceType TEXT,
        IsOffice BOOLEAN,
        OfficeName TEXT,
        OfficeServiceNumber TEXT,
        RequestDate TEXT,
        Activities TEXT
    );
    `,
    // RequestType 4: Add Activity
    `
    CREATE TABLE IF NOT EXISTS AddActivity (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        LicenceID TEXT,
        Activities TEXT
    );
    `,
    // RequestType 5: Stamp License Letter
    `
    CREATE TABLE IF NOT EXISTS StampLicense (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        LicenceID TEXT,
        RequestDate TEXT
    );
    `
];

// Execute the SQL statements to create the tables
for (const sql of sqlStatements) {
    db.query(sql).run();
}

console.log("Database has successfully been created")