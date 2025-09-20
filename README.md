# ClaritySync

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project Structure

This project is organized with a separate folder for the backend API code.

- `src/` - Contains all React frontend files.
- `api/` - Contains the Node.js Express server that acts as a proxy to the Notion API.

## Environment Variables

This project uses environment variables for configuration. Create a `.env.local` file in the project root and add the following variables. This file is for sensitive credentials and should **not** be committed to version control.

- `DATABASE_ID`: The ID of your Notion database.

- `NOTION_SECRET`: Your Notion Integration Secret for direct API access.

- `NOTION_CLIENT_ID`: The Client ID for your Notion OAuth app.

- `NOTION_CLIENT_SECRET`: The Client Secret for your Notion OAuth app.

- `NOTION_REDIRECT_URI`: The callback URL for the OAuth flow. For local development, this will be on your backend server, e.g., `http://localhost:5000/api/auth/notion/callback`.

- `SESSION_SECRET`: A long, random string used to secure user sessions.

- `FRONTEND_URL`: The base URL of your frontend application (e.g., `http://localhost:3000` for local development).

## Running the Application Locally

There are two ways to run the application:

### Option 1: Run Separately (Recommended for Debugging)

This approach is best when you're first setting things up, as it makes it easier to see errors from either the frontend or the backend.

1.  **Start the Backend API**

    In your first terminal, start the backend server:
    ```bash
    npm run server
    ```
    You should see a message like `Server listening on http://localhost:5000`. Leave this terminal running.

2.  **Start the Frontend App**

    In a **second terminal**, start the frontend:
    ```bash
    npm start
    ```
    This should open `http://localhost:3000` in your browser.

### Option 2: Run Concurrently with `npm run dev`

This script is designed to run both the backend and frontend for you.
```bash
npm run dev
```
This will start the backend on `http://localhost:5000` and the frontend on `http://localhost:3000`, and it should open the application in your browser automatically.

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

**Note:** This script only starts the frontend. For full local development, you must run the backend server in a separate terminal (`npm run server`), or use `npm run dev` to start both concurrently.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
