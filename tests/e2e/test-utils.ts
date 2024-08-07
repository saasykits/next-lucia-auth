export const testSignupUser = {
  name: "Test SignUp",
  email: "test+signup@example.com",
  password: "testPass123",
};
export const testLoginUser = {
  name: "Test Login User",
  email: "test+login@example.com",
  password: "testPass123",
};

export function extractLastCode(log: string): string | null {
  // Regular expression to match the code value
  const regex = /"code":"(\d+)"/g;

  let match: RegExpExecArray | null;
  let lastCode: string | null = null;

  // Find all matches and keep track of the last one
  while ((match = regex.exec(log)) !== null) {
    lastCode = match[1] ?? null;
  }
  return lastCode;
}
