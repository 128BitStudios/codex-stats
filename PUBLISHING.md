# Publishing

This fork publishes as `128bitstudios.codex-stats-updated`.

## One-time Marketplace setup

1. Create or sign in to a Microsoft/Azure DevOps account.
2. Create a Marketplace publisher with ID `128bitstudios` at <https://marketplace.visualstudio.com/manage/publishers/>.
3. Create an Azure DevOps Personal Access Token with `Marketplace > Manage`.
4. Run `npx vsce login 128bitstudios` and paste the token when prompted.

Microsoft notes that global Azure DevOps PATs retire on December 1, 2026, so use PAT publishing for the first manual release and move to Entra ID based publishing later if you automate releases.

## Manual release

```bash
npm install
npm run compile
npm run vscode:package
npx vsce publish
```

If you prefer uploading in the browser, use `npm run vscode:package`, then upload `codex-stats-updated-1.0.4.vsix` from the publisher management page.

## GitHub Actions release

1. Add a repository secret named `VSCE_PAT` containing an Azure DevOps Personal Access Token with `Marketplace > Manage`.
2. Open pull requests against `main`; the `CI` workflow will lint, build, test, package, and upload the VSIX artifact.
3. Merge to `main` to run the same validation and publish to the VS Code Marketplace.
4. You can also publish with the `Publish Extension` workflow by publishing a GitHub Release or by running it manually with `publish` set to `true`.

## Versioning

Update `version` in `package.json` before each release. Marketplace versions are immutable after publishing; the GitHub Actions publish step uses `--skip-duplicate` so a merge without a version bump will not fail only because that version already exists.
