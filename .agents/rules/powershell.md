# PowerShell Command Chaining

When chaining multiple commands in PowerShell, always use `;` (semicolon) instead of `&&`.
The `&&` operator is only available in PowerShell 7+ and is not supported in this environment.

Example:

- ❌ `git add -A && git commit -m "msg"`
- ✅ `git add -A; git commit -m "msg"`
