# My Docker Optimization Notes

## 🚀 What I Did to Speed Things Up

I got tired of the slow Docker builds, so I spent some time optimizing everything. My build times went from a painful 7+ minutes down to **less than 2 minutes**.

Here are the main things I changed:

### 1. **Added `.dockerignore` Files**
I created `.dockerignore` files for both the frontend and backend. This stops Docker from copying useless files like `node_modules` and build folders into the build context, which makes the first step of the build way faster.

### 2. **Optimized the Dockerfiles**
- I switched the base images to `alpine` linux because they're much smaller and faster to pull.
- I re-ordered the commands to take advantage of layer caching. I now copy `package.json` and run `npm ci` *before* copying my source code. This way, Docker only re-installs dependencies when my `package.json` actually changes.
- I switched from `npm install` to `npm ci`, which is faster and better for CI/CD environments.
- I got rid of the slow `chown` commands that were wasting over 200 seconds during the build.

### 3. **Fixed the Volume Mounts**
- I set up anonymous volumes for the `node_modules` folders. This trick prevents my local `node_modules` from overwriting the ones inside the container, which was causing issues.
- I added a named volume for the npm cache, so dependencies are cached between builds, making them much faster.
- I also made sure the Keycloak data is stored in a persistent volume so I don't lose my configuration every time I restart the containers.

### 4. **Created a Dev-Specific Setup**
- I created a `docker-compose.dev.yml` file specifically for development. It's configured for hot-reloading so my code changes show up instantly.
- I tweaked the environment variables to enable faster file watching and other dev-friendly features.

## 📋 How to Use It

### Quick Start (The way I use it)
```bash
# On Windows
.\\dev.bat start

# On Linux/Mac
./dev.sh start
```

### Manual Docker Compose Commands
If I need to do something specific, I use these:
```bash
# To start everything up for development
docker-compose -f docker-compose.dev.yml up --build -d

# To stop it all
docker-compose -f docker-compose.dev.yml down

# To check the logs
docker-compose -f docker-compose.dev.yml logs -f

# To clean up everything (including volumes)
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
```

## 🔧 My Custom Scripts

I wrote some simple scripts to make my life easier.

### Windows (`dev.bat`)
- `.\\dev.bat start`: Starts the dev environment.
- `.\\dev.bat stop`: Stops it.
- `.\\dev.bat restart`: Restarts all services, keeping my data.
- `.\\dev.bat restart-apps`: **My most used command.** Just restarts the backend and frontend. Super fast.
- `.\\dev.bat rebuild-apps`: Rebuilds the backend and frontend if I change dependencies.
- `.\\dev.bat logs`: Tails the logs for all services.
- `.\\dev.bat status`: Shows me what's running.
- `.\\dev.bat clean`: **DANGER!** This wipes everything, including my Keycloak and database data.
- `.\\dev.bat clean-apps`: Cleans just the app data, but keeps Keycloak/DB safe.
- `.\\dev.bat rebuild`: Rebuilds all containers from scratch.

### Linux/Mac (`dev.sh`)
The commands are the same as the Windows ones, just with `./dev.sh` instead.

## 🎯 Coolest Features

### Hot Reloading
- The backend uses `ts-node-dev` to automatically recompile and restart when I change a `.ts` file.
- The frontend uses React Fast Refresh, so UI changes are instant.

### Caching Strategy
- **Docker Layers**: Dependencies are on a separate layer from my code, so they rarely get rebuilt.
- **NPM Cache Volume**: The npm cache is shared across builds, so it's much faster.

### Keycloak Data Persistence
This is a big one. My Keycloak configuration (users, clients, etc.) is now **saved** even when I shut down the containers.

**What's preserved:**
- All my users, realms, and clients.
- Roles and permissions I've set up.

**Commands that are SAFE for my Keycloak data:**
- `restart-apps`, `rebuild-apps`, `restart`, `rebuild`

**Commands that will DELETE my Keycloak data:**
- `clean` (This one wipes EVERYTHING).

## 🚨 A Few Reminders for Myself

1.  The very first build will still take a couple of minutes to download everything.
2.  After that, builds should only take 10-30 seconds, and that's only if I change dependencies.
3.  Code changes should appear instantly because of hot-reloading.
4.  If I lose my Keycloak config, I probably ran `clean` by accident.

## 💡 Pro Tips

- I mostly use `restart-apps` for day-to-day coding.
- If I add a new npm package, I use `rebuild-apps`.
- `clean-apps` is good for when something feels stuck, but I don't want to reconfigure Keycloak.
- I only use `clean` if I really want a fresh start.

## 🎉 Benefits

1. **Faster development cycles**: Code changes reflect immediately
2. **Reduced wait times**: Build times cut by 60-70%
3. **Better caching**: Dependencies cached between builds
4. **Improved reliability**: More stable development environment
5. **Easier management**: Simple scripts for common operations
6. **Keycloak persistence**: No more losing configuration on restarts!
7. **Granular control**: Restart only what you need

## 🔍 Troubleshooting

### If builds are still slow:
1. **Clean Docker cache**: `docker system prune -a`
2. **Rebuild from scratch**: Use `.\dev.bat rebuild` or `./dev.sh rebuild`
3. **Check Docker resources**: Ensure Docker has enough memory and CPU allocated

### If hot reloading isn't working:
1. **Check file permissions**: Ensure your IDE has write permissions
2. **Verify volume mounts**: Check that source code is properly mounted
3. **Restart applications only**: Use `.\dev.bat restart-apps` or `./dev.sh restart-apps`

### If Keycloak configuration is lost:
1. **Check volume mounts**: Ensure `keycloak-data` volume exists
2. **Verify container restart**: Use commands that preserve data
3. **Check Docker volumes**: `docker volume ls` to see if `keycloak-data` exists

## 📊 Expected Performance

- **Initial build**: 2-3 minutes (down from 7+ minutes)
- **Code changes**: Instant (hot reloading)
- **Dependency changes**: 10-30 seconds
- **Full rebuild**: 2-3 minutes
- **App-only rebuild**: 10-30 seconds

## 🎉 Benefits

1. **Faster development cycles**: Code changes reflect immediately
2. **Reduced wait times**: Build times cut by 60-70%
3. **Better caching**: Dependencies cached between builds
4. **Improved reliability**: More stable development environment
5. **Easier management**: Simple scripts for common operations
6. **Keycloak persistence**: No more losing configuration on restarts!
7. **Granular control**: Restart only what you need

## 💡 Pro Tips

1. **Use `restart-apps` for code changes**: Fastest way to restart just your applications
2. **Use `rebuild-apps` for dependency changes**: Rebuilds only backend/frontend
3. **Use `status` to check container health**: Quick overview of all services
4. **Use `clean-apps` for troubleshooting**: Cleans app data but preserves Keycloak/MongoDB
5. **Only use `clean` when you want to start fresh**: Removes everything including Keycloak config 