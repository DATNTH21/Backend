# Blackbox Test Generator (Backend)

## Installation

```bash
npm install
```

## Usage

1. Create a `.env` file in the root directory of the project with the following content, make sure to replace the placeholders with your own values (<YOUR_API_KEY>, <YOUR_USERNAME>, <YOUR_MONGO_CLUSTER_PASSWORD>, <YOUR_MAILTRAP_SMTP_USERNAME>, <YOUR_MAILTRAP_SMTP_PASSWORD>). We do not need <YOUR_SENDINBLUE_USERNAME> and <YOUR_SENDINBLUE_PASSWORD> for development, it's only for production:

```bash
API_KEY=<YOUR_GEMINI_API_KEY>
PORT=8080

MONGO_DB=mongodb+srv://<YOUR_USERNAME>:<PASSWORD>@cluster0.pgh67.mongodb.net/blackboxtestgen?retryWrites=true&w=majority
MONGO_PASSWORD=<YOUR_MONGO_CLUSTER_PASSWORD>

# Google App Credentials
GOOGLE_CLIENT_ID=93679810058-7c1dfov705p17so6u5fn2qo4bg38hdqo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# JWT
JWT_ACCESS_TOKEN_SECRET_KEY="12345"
JWT_REFRESH_TOKEN_SECRET_KEY = "54321"

JWT_ACCESS_TOKEN_EXPIRES_IN=15 # in minutes
JWT_REFRESH_TOKEN_EXPIRES_IN=5 # in days

EMAIL_USERNAME=<YOUR_MAILTRAP_SMTP_USERNAME>
EMAIL_PASSWORD=<YOUR_MAILTRAP_SMTP_PASSWORD>
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525

EMAIL_FROM=huynhcuong@seanc.dev
SENDINBLUE_USERNAME=<YOUR_SENDINBLUE_USERNAME>
SENDINBLUE_PASSWORD=<YOUR_SENDINBLUE_PASSWORD>
```

2. Run the server:

```bash
npm start
```
