---
description: Workflow for handling GitHub issues, branch management, and integrated testing.
---

Follow these steps when tasked with resolving a GitHub issue or when you identify a new one.

## 0. Issue Creation / Discovery
Use this step when you identify a new bug, improvement, or task that needs tracking.

1. **Draft the Issue**: Prepare a clear title and detailed description.
2. **Submit to GitHub**:
   // turbo
   ```powershell
   gh issue create --title "[Title]" --body "[Description]" --label "bug,backend"
   ```

3. **Record the Issue ID**: Note the issue number (e.g., #105).

## 1. Branch Setup
Create or checkout the branch associated with the issue using the user's naming convention: `[id]-[slug]`.

1. **Checkout or Create Branch**:
   // turbo
   ```powershell
   gh issue checkout [issue-number]
   ```
   *Note: If the branch doesn't exist, ensure the name follows the `[id]-[descriptive-name]` pattern (e.g., `105-implement-error-handling`).*

2. **Sync with Origin**:
   // turbo
   ```powershell
   git fetch origin
   git pull origin
   ```

## 2. Issue Analysis & Planning
Refer to the issue context directly.

1. **View Issue Details**:
   // turbo
   ```powershell
   gh issue view [issue-number]
   ```
2. Create an `implementation_plan.md` in the brain directory.

## 3. Development & Testing Cycle
Develop while keeping tests in sync.

1. **Implement Changes**.
2. **Apply Unit Tests**: Use the `/dotnet-testing` workflow for backend.
3. **Iterate**: Fix bugs found during testing.

## 4. Final Verification
// turbo
```powershell
dotnet test workspace/apps/backend-test
```

## 5. Completion & PR Management
Finalize and create a Pull Request.

1. **Commit**: 
   Use simple, descriptive lowercase messages (e.g., `updated readme, added more tests`).
   ```powershell
   git add .
   git commit -m "[descriptive message] (resolves #[issue-number])"
   ```

2. **Push & PR**:
   // turbo
   ```powershell
   gh pr create --title "[Title]" --body "Resolves #[issue-number]. [Detailed description]" --base main
   ```

3. **Notify User**: Inform them that the PR is ready for review.
