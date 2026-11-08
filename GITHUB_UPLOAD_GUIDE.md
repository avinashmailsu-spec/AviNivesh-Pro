# Upload AviNivesh Pro 2.0 to GitHub

**Developed by Avinash Ekka**

This is a source-code repository (not a compiled app). There is **no `.env` or real API token in this package**. Please review the repository and keep personal credentials out of all commits and screenshots.

## Option A — GitHub website (no command line)

1. Sign in to [github.com](https://github.com) and click **New repository**.
2. Enter **`avinivesh-pro`** as the repository name, add the description suggested in [README](README.md), and choose **Private** or **Public**.
3. Because this folder already includes a README and `.gitignore`, do **not** ask GitHub to create another README, `.gitignore`, or license for this initial upload.
4. Click **Create repository**. On the new, empty repository, choose **uploading an existing file** or **Add file → Upload files**.
5. **Extract the provided ZIP** and open its `AviNivesh_Pro_GitHub_Ready` folder. Drag all its *contents* (files and subfolders such as `src`, `server`, `.github`) into the upload area. Ensure hidden files such as `.gitignore`, `.env.example`, `.gitattributes` and `.github` are included. If hidden files do not appear in your file picker, use GitHub Desktop (Option B) or Git (Option C) instead.
6. Add commit message `Initial release — AviNivesh Pro 2.0` and commit.
7. Open the **Actions** tab and inspect the **CI** workflow (the first run may take a moment). It installs dependencies, runs checks/tests and builds the project.
8. Verify that the README, `src/`, `server/`, `tests/`, `.github/workflows/ci.yml` and `.env.example` are visible in the repository.

> Upload the source files and folders, **not just the ZIP file**. A repository containing only a ZIP does not make the application code navigable or run CI. GitHub's browser uploader may impose per-file/total-file limits. For larger projects, prefer GitHub Desktop or Git.

## Option B — GitHub Desktop (easy for Windows)

1. Install [GitHub Desktop](https://desktop.github.com/) and sign in.
2. Extract the ZIP somewhere permanent, such as `Documents\AviNivesh_Pro_GitHub_Ready`.
3. Choose **File → Add local repository**, select the extracted project folder, and if prompted select **Create a repository here**.
4. Use the commit message `Initial release — AviNivesh Pro 2.0` and **Commit to main**.
5. Click **Publish repository**, keep name `avinivesh-pro`, and choose whether the repository should be public or private.
6. Select **Publish Repository**. Confirm the `CI` workflow appears under **Actions** after publication.

## Option C — Git commands

Install [Git](https://git-scm.com/downloads). Create an **empty** repository named `avinivesh-pro` on GitHub. In PowerShell, inside your extracted folder:

```powershell
git init -b main
git add .
git status
git commit -m "Initial release - AviNivesh Pro 2.0"
git remote add origin https://github.com/YOUR_USERNAME/avinivesh-pro.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your own GitHub handle, and authenticate through GitHub's supported sign-in flow. If Git asks for an author identity, set your own `git config user.name` and `git config user.email` first. **Never paste a personal access token into code or commit it to Git.**

## After publishing

- Add your repository description and topics (listed in the README).
- Turn on automated vulnerability alerts, where supported, and investigate the CI results.
- Decide whether to add an open-source licence; none has been selected by default.
- Do **not** turn on GitHub Pages expecting the app to work there: this is a **full-stack React + Express app**. GitHub Pages hosts static files but cannot run the Express backend. A deployment requires an appropriate server platform and security hardening.
- Keep provider terms in mind: authenticated and exchange-sourced data may have display or redistribution restrictions.

**Security:** `.env` is intentionally ignored. Check `git status` before every commit, and never commit your own market-data, OpenAI, brokerage, or other credentials.
