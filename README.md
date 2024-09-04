# MikroORM reproduction example

This repository serves as a base reproduction example, it contains basic setup with MikroORM 6 with SQLite driver and jest. This is what the main repository is using, and therefore allows for a simple integration to the codebase.

## Few hints for creating your own reproductions

- Focus on reproducing one problem at a time.
- Set up the data, the test needs to be **self-contained**.
- Don't use the CLI, do everything programmatically as part of the test.
- Remove everything unrelated, keep things as simple as possible.
- Duplication in tests is fine, better than complex abstractions.
- Comments are fine, asserts are better!
- If the problem is not driver specific, use in-memory SQLite database.


## 
Go to `./docker` and run `docker-compose up -d` to setup mysql db.
Or define it on your own and point to it.
Wait for db to start and run `yarn test`