## Running the tests

- `cd app`
- `npm install`
- `npm run build`
- `npm run serve` (ensure the app is running on port 9001)
- (open a new terminal window, keep the current app server running)
- `cd ../` (go back to the `cypress` folder)
- `npm run e2e` (installs dependencies and opens Cypress)
- `npm run e2eci` (runs headless tests and generates results files)

You need to have the app open in one terminal window on port 9001 and the e2e tests need to be run from another, this is very important. The local server needs to be running for e2e tests to run.
