# Notes about running the benchmark viewer locally

- Make sure all the modules are build.
- Make sure you have some benchmarking data locally. To that end, you navigate to the `../runner` directory and start the benchmarking process for the current branch using `npm run bench-all`. This should produce JSON files under `../.results` directory.
- To run the server locally, navigate to `./server` and run
  ```shell
  // powershell
  $Env:MODE = "dev"; npm start

  // shell
  MODE=dev npm start
  ```
  This starts the server, with the file-system-based storage service that reads the data from `../.results` directory.
- To run the client locally, navigate to `./client` and run
  ```shell
  npm run watch
  ```
