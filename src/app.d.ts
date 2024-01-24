// app.d.ts
/* eslint @typescript-eslint/consistent-type-imports:0, @typescript-eslint/ban-types: 0 */

/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./lib/auth/lucia").Auth;
  type DatabaseUserAttributes = {
    full_name: string;
    email: string;
    email_verified: boolean;
  };
  type DatabaseSessionAttributes = {};
}
