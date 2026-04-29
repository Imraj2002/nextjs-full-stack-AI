const http = require('http');

async function test() {
  const csrfRes = await fetch("http://127.0.0.1:5000/api/v1/auth/csrf");
  const csrfData = await csrfRes.json();
  const cookies = csrfRes.headers.get('set-cookie');

  const signInRes = await fetch("http://127.0.0.1:5000/api/v1/auth/signin/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      json: "true"
    }),
    redirect: "manual"
  });

  const data = await signInRes.json();
  console.log("Redirect URL:", data.url);
  
  const parsedUrl = new URL(data.url);
  console.log("Redirect URI sent to Google:", parsedUrl.searchParams.get("redirect_uri"));
}

test().catch(console.error);
