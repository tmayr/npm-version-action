## npm-version-action

GitHub Action for automated npm version.

Uses `npm version` and pushes to the current branch.

### How

- If a commit message contains `BREAKING CHANGE` it uses `major`
- If a commit message contains `feat` it uses `minor`
- Else, it uses `patch`

Afterwards it pushes back to the current branch along with the new tag

Inspired heavily by https://github.com/phips28/gh-action-bump-version
