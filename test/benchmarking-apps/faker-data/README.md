# Faker data

A disposable project to generate fake data using faker.js.
Faker.js is not directly used in the benchmark apps to remove 3rd party dependencies.
Rather the data is statically generated and dumped into a data.json file, which can be used later in the benchmark apps.

To generate data use any of the following.

```shell
# Syntax
# npm start [-- [--option count]]

# generate the data with default counts
npm start

# generate 250 names
npm start -- --name 250
```

To know the full set of options check the `generate-data.ts`.
