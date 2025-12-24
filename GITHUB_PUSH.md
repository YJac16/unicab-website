# Push to GitHub - Quick Guide

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `unicab-website` (or your preferred name)
4. Description: "UNICAB Travel & Tours - Premium travel website"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Connect Your Local Repository

After creating the repository, GitHub will show you commands. Use these:

### Option A: If repository is empty (recommended)

```bash
# Set the remote URL (replace YOUR_USERNAME with your GitHub username)
git remote set-url origin https://github.com/YOUR_USERNAME/unicab-website.git

# Push to GitHub
git push -u origin master
```

### Option B: If you need to add remote

```bash
# Remove old placeholder remote
git remote remove origin

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/unicab-website.git

# Push to GitHub
git push -u origin master
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. The README.md will display on the repository homepage

## Alternative: Using GitHub Desktop

1. Download [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository
3. Select your project folder
4. Publish repository to GitHub

## Troubleshooting

### Authentication Issues

If you get authentication errors, you may need to:

1. **Use Personal Access Token:**
   - GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` permissions
   - Use token as password when pushing

2. **Or use SSH:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/unicab-website.git
   ```

### Branch Name Issues

If you get errors about branch name, try:

```bash
# Rename branch to main (if needed)
git branch -M main
git push -u origin main
```






