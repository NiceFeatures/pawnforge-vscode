# Pull Request Review Plan: PR #8 (Add Linux support & integrity checks)

## Objective
Thoroughly review Pull Request #8 on the `amxxpawn-language` repository to ensure the changes are secure, functional, and adhere to best practices before merging.

## Context
- **PR Description:** Updates the way the AMX Mod X compiler is downloaded and extracted from the official release page for both Linux and Windows users. It also introduces SHA256 file integrity checks and removes the bundled `compiler.zip`.
- **Key Changes:**
  - `src/client/commands.ts` modified to download from GitHub releases (`1.9.0.5303`).
  - Added OS-specific extensions (`.zip` for Windows, `.tar.gz` for Linux).
  - Added `verifyFileIntegrity` function using the `crypto` module.
  - Modified `extractZip` to handle both `.zip` (via PowerShell) and `.tar.gz` (via `tar` in Linux).
  - Cleaned up the extraction by removing unused files (e.g., `addons`, `testsuite`, `*.sma`).

## Phase 2: Implementation (Parallel Agent Assignments)

Once this plan is approved, the following agents will be invoked in parallel to conduct a comprehensive review:

1. **`security-auditor`**
   - **Focus:** Identify security vulnerabilities in the new implementation.
   - **Tasks:**
     - Audit the `verifyFileIntegrity` function (hash validation logic, stream handling).
     - Check for Command Injection vulnerabilities in `CP.exec` (specifically analyzing how `zipPath` and `destDir` are passed to PowerShell and Bash).
     - Review the SHA256 hashes provided for the binaries.

2. **`backend-specialist` (TypeScript/Node.js Expert)**
   - **Focus:** TypeScript code quality and error handling.
   - **Tasks:**
     - Review the use of Promises and stream error handling in `verifyFileIntegrity`.
     - Evaluate the hardcoded variables (`COMPILER_VERSION`, `COMPILER_BUILD`).
     - Look for potential bugs such as wildcard expansion issues in Bash (`rm -rf "${destDir}/*.sma"` where `*` might not expand correctly when inside double quotes).

3. **`test-engineer`**
   - **Focus:** Verification of external resources and commands.
   - **Tasks:**
     - Validate that the download URLs for Windows and Linux actually exist.
     - Validate that the expected SHA256 hashes match the actual files located at those URLs.
     - Verify if the `tar` and `powershell` commands will properly extract the structure as intended.

## Phase 3: Final Verification & Synthesis
After the parallel review, we will:
- Run static analysis (`lint_runner.py` or similar if applicable).
- Synthesize the findings into a final PR review report to be submitted to the user.
