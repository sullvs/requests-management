# Bun.js Request Management System with SQLite
This repository implements a request management system using Bun.js and SQLite. It addresses the challenge of storing and analyzing request data with different structures for various request types.

## Problem Statement
The existing system stores all request data in a single JSON field ("RequestData") within a "Requests" table. This structure makes it difficult to analyze data based on specific request types.

## Proposed Solution
This solution creates a new database schema with separate tables for each request type ("InspectionRequest", "AccountRequest", etc.). These tables will have specific columns to accommodate the data structure of each request type.

## Key Functionalities
- Data Analysis and Schema Design: The provided CSV file will be analyzed to determine the schema (column names and data types) for each request type.
- API for Uploading CSV Data: An API endpoint will allow users to upload CSV files containing request data.
- Data Processing and Insertion: The uploaded CSV data will be processed, separating records based on request type and inserting them into the corresponding tables.
- Import Summary: After successful data import, a summary will be provided to the user, including the number of records imported for each request type and the total processing time.

## Bonus Task: Error Handling
The solution will consider potential schema mismatches between the CSV data and the expected request data structure. Here are two approaches for handling such errors:

### 1. Error Reporting:

- The code will identify and log mismatched data points.
- The user will receive a report highlighting the number of encountered errors and the specific records with issues.

## 2. Partial Data Import (Optional):

- The code will attempt to insert valid data into the corresponding tables.
- Errors will be logged and reported as mentioned above.
- This approach allows for partial data import, potentially salvaging some records while identifying problematic ones.

**Note:** Implementing option 2 requires additional logic for handling partially processed records and potential data integrity issues.

## Benefits
This system offers several advantages:

- Improved Data Organization: Separating request data into dedicated tables allows for efficient querying and analysis based on specific request types.
- Enhanced Data Analysis: Structured data facilitates generating meaningful reports and statistics based on request details.
- Efficient Data Import: The API simplifies data import and provides feedback on the import process.
- Error Handling (Bonus): Error handling ensures data integrity and allows for troubleshooting potential data quality issues.

This repository provides a Bun.js solution for managing request data with varying structures, promoting better data organization, analysis, and import capabilities.
