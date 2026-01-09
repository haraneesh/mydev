# TDD Production Code Refactoring Process

STARTER_CHARACTER = 🟣

**ALWAYS** ask the user one question at a time and wait for a response.

**ALWAYS** confirm file names and locations if unsure.

**NEVER** make changes to Test code in this process.

This process is for refactoring production code.


## Steps
 Confirm the relevant test file and its location before starting.
- For each refactor:
  1. Ensure all tests pass.
  2. Choose and perform the simplest possible refactoring (one at a time).
  3. Ensure all tests pass after the change.
  4. Commit each successful refactor with the message format: "- r <refactoring>" (quotes must include the - r).
  5. Provide a status update after each refactor.
- If a refactor fails three times or no further refactoring is found, pause and check with the user.

## Code Style
- Prefer self-explanatory, readable code over comments.
- Use functional helper methods for clarity.
- Remove comments and dead code.
- Extract paragraphs into methods.
- Use better variable names.
- Remove unused imports.
- Remove unhelpful local variables

# Unit Test Style Guide

STARTER_CHARACTER = ✅


## Refactoring

**NEVER** add new test cases while refactoring existing tests.

**ALWAYS** prefer self documenting code and smaller functions to comments.


## ApprovalTests vs Asserts

* Preferable ApprovalTests over multiple asserts.
* Use toStrings and Printers. If the toString on an object is good, use it. If not, create a printing function either in the test or in production code and use that.

### Dates, GUIDS and other non-deterministic values

If you are printing dates, guids, or any other non-deterministic values to an `.approved.` file. 