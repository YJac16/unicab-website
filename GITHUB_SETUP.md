# GitHub Setup Guide

## Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Sign up for a free account

## Step 2: Create a New Repository on GitHub

1. **Click the "+" icon** in the top right corner
2. Select **"New repository"**
3. Fill in:
   - **Repository name:** `unicab-website` (or any name you prefer)
   - **Description:** "Unicab Travel & Tours website"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

## Step 3: Initialize Git and Push to GitHub

Open PowerShell in your project folder and run these commands:

```powershell
# Navigate to your project
cd "E:\Code Work\Unicab Website"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Unicab Travel & Tours website"

# Add your GitHub repository as remote
# REPLACE YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
If your GitHub username is `johnsmith` and repo name is `unicab-website`:
```powershell
git remote add origin https://github.com/johnsmith/unicab-website.git
```

## Step 4: Authentication

If you're asked for credentials:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your GitHub password)

### How to Create a Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Unicab Website")
4. Select scopes: Check `repo` (full control)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when pushing

## Step 5: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files there
3. Files in `.gitignore` (like `node_modules/`, `dist/`) won't appear (this is correct)

## Future Updates

After making changes to your code:

```powershell
# Add changed files
git add .

# Commit changes
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

## Quick Commands Reference

```powershell
# Check status (what files changed)
git status

# See what changed
git diff

# View commit history
git log

# Pull latest changes (if working on multiple computers)
git pull
```

