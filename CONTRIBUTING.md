# QuickPoll Git Workflow Guide

Welcome to the QuickPoll development team! We use a standardized Git workflow to maintain high code quality and a clean project history.

## 🌿 Branching Strategy

We follow a simplified Git Flow model:

- **`main`**: Production code only. Always stable.
- **`develop`**: Integration branch for features. This is where most work is merged.
- **`feature/xxx`**: Dedicated branches for new features. Create these from `develop`.
- **`bugfix/xxx`**: Dedicated branches for fixing bugs.

## 🛠️ Commit Quality (Husky)

We have integrated **Husky** and **Lint-staged**.
Every time you run `git commit`, the system will automatically:
1. Run **ESLint** to find code errors.
2. Run **Prettier** to format your code.

If either fails, the commit will be blocked. Please fix the errors and try again!

## 📝 Commit Messages

Please used the following prefixes for your commit messages:
- `feat:` for new features.
- `fix:` for bug fixes.
- `chore:` for maintenance (updating dependencies, etc.).
- `docs:` for documentation changes.

## ☁️ Connecting to a Remote (GitHub/GitLab)

To push this project to your own remote repository:

1. Create an empty repository on GitHub/GitLab.
2. Run the following in your terminal:
   ```bash
   git remote add origin YOUR_REMOTE_URL
   git push -u origin main
   ```

Happy coding! 🚀
