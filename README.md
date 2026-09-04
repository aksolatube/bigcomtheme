# Roots Theme

Up to date with Cornerstone v6.1.1

## Install

```
npm ci
stencil init
stencil start
```

## Working from multiple computers

Pull the latest `main` branch before editing. Commit and push completed changes so
the other computer can pull the same source and dependency versions.

```sh
git pull --rebase
npm ci
# Make and test changes.
git add .
git commit -m "Describe the theme change"
git push
```

## Download an uploadable theme ZIP

Every push to `main` runs the **Build BigCommerce theme** workflow. To download
the bundle:

1. Open the repository's **Actions** tab.
2. Open the latest successful **Build BigCommerce theme** run.
3. Download the `EXTRACT-FIRST-solatube-theme-v<version>-build-<number>`
   artifact from the **Artifacts** section.
4. Extract the downloaded artifact once.
5. Upload the `UPLOAD-TO-BIGCOMMERCE-solatube-theme-v<version>-build-<number>.zip`
   file inside it. Do not upload the outer `EXTRACT-FIRST` ZIP to BigCommerce.

The workflow can also be started manually with **Run workflow** from the Actions
tab. The version comes from `package.json`, and the build number increases with
each workflow run. Build artifacts are retained for 30 days.

To create the same uploadable bundle locally, install Stencil CLI and run:

```sh
npm install --global @bigcommerce/stencil-cli@9.2.0
npm ci
stencil bundle
```
