import crypto from "crypto";

export function generateRandomString(length = 15) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomBytes = crypto.randomBytes(length);
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i]! % characters.length;
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
