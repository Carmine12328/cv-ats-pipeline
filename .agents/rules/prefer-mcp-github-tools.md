---
name: prefer-mcp-github-tools
description: Prefer using MCP GitHub tools instead of local git commands for all repository operations.
---

# Prefer MCP GitHub Tools

When the user asks to perform **any** version control or repository operations (e.g., committing, pushing, creating branches, or pull requests), **always prioritize using the GitHub MCP tools** (like `create_or_update_file`, `push_files`, `create_branch`, etc.).

Do not use the local `git` CLI (e.g., `git add`, `git commit`, `git push`) through the `run_command` tool. Running `git` locally often hangs indefinitely in the background environment because it waits for authentication prompts that cannot be interacted with. The GitHub MCP server is properly authenticated and should be the sole method for repository operations.
