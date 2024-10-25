# Blackbox Test Generator (Backend)

## Installation

```bash
npm install
```

## Usage

1. Create a `.env` file in the root directory of the project with the following content, make sure to replace the placeholders with your own values (<YOUR_API_KEY>, <YOUR_USERNAME>, <YOUR_MONGO_CLUSTER_PASSWORD>):

```bash
API_KEY=<YOUR_API_KEY>
PORT=8080

MONGO_DB=mongodb+srv://<YOUR_USERNAME>:<PASSWORD>@cluster0.pgh67.mongodb.net/blackboxtestgen?retryWrites=true&w=majority
MONGO_PASSWORD=<YOUR_MONGO_CLUSTER_PASSWORD>

# Google App Credentials
GOOGLE_CLIENT_ID=93679810058-7c1dfov705p17so6u5fn2qo4bg38hdqo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

SESSION_SECRET=secretblablabla
```

2. Run the server:

```bash
npm start
```
