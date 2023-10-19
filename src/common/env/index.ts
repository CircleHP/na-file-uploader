import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const { PORT, AZURE_ACCOUNT_ID, AZURE_ACCOUNT_KEY, API_KEY } =
  process.env;
