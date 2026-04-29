const { default: GoogleProvider } = require("next-auth/providers/google");
const provider = GoogleProvider({
  clientId: "123",
  clientSecret: "456",
  callbackUrl: "http://localhost:5000/api/v1/auth/google/callback"
});
console.log(provider);
