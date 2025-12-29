# NexaWork Deployment & Hosting Guide

This guide outlines the steps to host the NexaWork backend and publish the mobile application to the Google Play Store.

## 1. Hosting the Backend (Laravel)

### Recommended Hosting Providers
- **DigitalOcean (Droplet)**: Affordable and powerful.
- **Heroku**: easiest for beginners but more expensive.
- **Shared Hosting (e.g. Namecheap/Bluehost)**: Only if they support SSH and Laravel.

### Deployment Steps (DigitalOcean Example)
1. **Set up a Linux Server**: Create an Ubuntu 22.04 Droplet.
2. **Install LAMP/LEMP Stack**: Install PHP 8.1+, MySQL, and Nginx.
3. **Upload Code**: Use Git (`git clone`) to pull code onto the server.
4. **Configure Environment`:
   - Copy `.env.example` to `.env`.
   - Update `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
   - Update `APP_URL` to your production domain (e.g., `https://api.nexawork.com`).
   - Run `php artisan key:generate`.
5. **Install Dependencies**: Run `composer install --optimize-autoloader --no-dev`.
6. **Migrate Database**: Run `php artisan migrate --force`.
7. **SSL Certificate**: Use **Certbot (Let's Encrypt)** for free HTTPS.
8. **Queue Worker**: Set up a Supervisor job to run `php artisan queue:work` if using queues.

---

## 2. Publishing to Google Play Store (Expo)

### Prerequisites
- A **Google Play Console** account ($25 one-time fee).
- **Expo Application Services (EAS)** account.

### Step-by-Step Build Process
1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo**:
   ```bash
   eas login
   ```
3. **Configure Project**:
   ```bash
   eas build:configure
   ```
4. **Update app.json**:
   - Ensure `package` name is unique (e.g., `com.shuaibu.nexawork`).
   - Set `versionCode` and `version`.
   - Add your icon and splash screen.
5. **Generate Android Build (AAB)**:
   ```bash
   eas build --platform android
   ```
   - Select "Build for Google Play" (AAB format).
   - Expo will handle your keystore generation and signing automatically.
6. **Download AAB**: Once the build finishes on Expo's servers, download the `.aab` file.
7. **Upload to Play Console**:
   - Create a new app in Google Play Console.
   - Go to "Production" -> "Create new release".
   - Upload the `.aab` file.
   - Complete the store listing (descriptions, screenshots, privacy policy).
8. **Submit for Review**: Google usually takes 2-7 days to review.

### Important Note on Push Notifications
To use Push Notifications in production, ensure your `projectId` in `NotificationContext.tsx` matches your Expo project ID, and configure FCM (Firebase Cloud Messaging) in the Expo dashboard.

---
**Code & Documentation by Shuaibu Abdulmumini**
