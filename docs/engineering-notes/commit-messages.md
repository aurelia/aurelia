# Commit message guidelines

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

### Format
1. A commit message MUST start with a type.
   1. The type MUST adhere to the guidelines specified [in this document](#type)
2. This SHOULD be directly followed by a scope.
   1. The scope MUST NOT contain spaces.
   2. The scope MUST start with an opening paren (`(`) and end with a closing paren (`)`).
   3. The text between the opening paren and closing paren SHOULD consist of only lowercase alphabetic characters (`a`-`z`).
3. This (either 1. or 2.) MUST be followed by a description.
   1. The description MUST start with a colon (`:`) and a space (` `).
   2. The description SHOULD be at most 100 characters.


## Type

The type MUST be one of the following words: "feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert".

Their meaning and implications are clarified in the table 1:

**Table 1:**

> Note: the semver bump is always at minimum "patch", so in practice, everything that is not "feat" will behave like "fix".
We make the distinction, however, for the purpose of this document because it adds a clearer meaning to the idea of "affects the semver bump".

|            | Semver bump | Changelog header         | Applicable to | Clarification |
| -----------|-------------|--------------------------|---------------|---------------|
| "feat"     | minor       | Features                 | Code that is published to npm | New capabilities / additions to public api | 
| "fix"      | patch       | Bugfixes                 | Code that is published to npm | Bugfixes, directly or indirectly related to public api |
| "perf"     | -           | Performance improvements | Code that is published to npm | Performance improvements, directly or indirectly related to public api |
| "refactor" | -           | Refactorings             | Code that is published to npm | Improvements, directly or indirectly related to public api, that don't fit the description of any other type |
| "docs"     | -           | -                        | Code/content that may or may not be published to npm | Markdown documents, jsdoc comments |
| "style"    | -           | -                        | Code that may or may not be published to npm | Linting fixes in code |
| "test"     | -           | -                        | Code that is NOT published to npm | Code that tests code that is published to npm: additions/changes to unit, integration, e2e tests |
| "build"    | -           | -                        | Code/config that is NOT published to npm | Code or config that produces the artifacts that are published to npm | 
| "ci"       | -           | -                        | Code/config that is NOT published to npm | Code or config that affects the CI/CD pipeline |
| "chore"    | -           | -                        | Anything that may or may not be published to npm | Any kind of house-keeping that does not clearly belong to any other type |
| "revert"   | -           | -                        | A specific commit that has been committed before and affects the changelog | Will cancel out the addition of said commit in the changelog (not yet implemented) |

The type SHOULD be chosen to best reflect the applicability and clarification as specified in table 1, provided the rules below are adhered to:
1. The types "feat", "fix", "perf" and "refactor" MUST be used when they are applicable as specified in table 1.
2. The types "feat", "fix", "perf" and "refactor" MUST NOT be used when they are NOT applicable as specified in table 1.
3. The types "perf" and "refactor" MAY be used interchangeably if the changes in code have aspects of both these types.
4. The types "feat" and "fix" MUST NOT be used interchangeably if the changes in code have aspects of both these types.
5. The type "chore" MAY be used instead of a more specific type (with the exception of "feat", "fix", "perf" and "refactor")

For context and further clarification:
1. Changes to code that affects end-user apps MUST be included in the changelog.
2. Changes to code that does NOT affect end-user apps MUST NOT be included in the changelog .
3. Anything that affects the version bump MUST be in an isolated commit.
4. Refactorings and performance improvements (which tend to go hand-in-hand) MAY be classified as either (preferably the intended or dominant one).
5. For all other cases, "chore" MAY be used as a 'catch-all' type, but it is RECOMMENDED to pick a more specific type if there is one.
