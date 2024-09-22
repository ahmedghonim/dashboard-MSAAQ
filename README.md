# Commit Message Guide

## Overview
This guide provides guidelines for writing clear and informative commit messages. Following these guidelines will help maintain consistency, improve code review processes, and provide a clear history of project changes.

## Steps for Writing Commit Messages

### Step 1: Identify the Commit Type
Choose an appropriate commit type based on the nature of the changes. Here are some commonly used types:
- **feat**: Adding a new feature or significant enhancement.
- **fix**: Fixing a bug or issue.
- **refactor**: Restructuring or optimizing existing code without adding new features.
- **chore**: Routine tasks, maintenance, or other non-functional changes.
- **docs**: Updating documentation.

**Please NOTE:** Only the first commit for a task should be labeled as "feat" since it introduces the new logic, UI, or API. Subsequent commits should focus on updating the code related to the initial task.

### Step 2: Add a Scope (optional)
If applicable for every commit, include a scope to specify the component or area of the project the commit relates to. Use lowercase letters and separate multiple scopes with a slash (/) if necessary.

### Step 3: Include the Jira Task ID
Include the relevant Jira task or issue ID in the commit message. This links the commit directly to the task, enabling better tracking and reference. Ensure the Jira task ID is included only in the first commit message for the task.
**Please NOTE:** Subsequent commits related to the same task should focus on updating the code or making additional changes, without repeating the Jira task ID in their commit 

### Step 4: Write the Commit Message
Craft a concise and descriptive commit message that provides clarity about the changes. Avoid vague or generic terms and instead, provide specific details. 

### Step 5: Avoid making single file changes in a commit
Do not make a single file change in a commit, such as changing a variable name in the API interface or adding profile info data. Instead, group similar changes into one commit.

## Commit Message Structure

A typical commit message follows the structure below:

```
[Type(Scope)]: [TASK-ID] Commit message
```

- **Type**: The type of the commit, such as feat, fix, refactor, chore, or docs.
- **Scope** (optional): The component or area of the project the commit relates to.
- **TASK-ID**: The relevant Jira task or issue ID associated with the commit.
- **Commit message**: A clear and concise description of the changes introduced by the commit.

## Examples

- Adding a new feature:
```
feat(auth): MQ-3523 Implement user authentication
```
- Fixing a bug:
```
fix(profile): MQ-123 Fix incorrect user profile rendering
```
- Refactoring existing code:
```
refactor(affiliates): MQ-789 Optimize database queries in affiliate module
```
- Routine maintenance or non-functional change:
```
chore(docs): Update README with installation instructions
```

## complete example with the task of adding user auth UI and API with the Jira ID MQ-1234:
### Create a new branch for the task:
```bash
git checkout -b feature/auth
```
### Make the initial commit with a "feat" type, specifying the scope as "auth" and including the Jira Task ID:
```bash
git commit -m "feat(auth): MQ-1234 Add user auth UI and API"
```
### Start implementing the user auth UI and API. Make regular commits with appropriate commit messages as you progress:
```bash
git commit -m "chore(auth): Implement user login functionality"
git commit -m "chore(auth): Create user registration form"
git commit -m "chore(auth): Add API endpoints for user authentication"
```
### Once the task is completed, push the branch to the remote repository:
```bash
git push origin feature/auth
```

