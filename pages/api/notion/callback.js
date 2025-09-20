// pages/api/notion/callback.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const code = req.query.code;

    // Exchange the code for an access token
    const tokenResp = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
        client_id: process.env.NOTION_CLIENT_ID,
        client_secret: process.env.NOTION_CLIENT_SECRET,
      }),
    });

    const tokenJson = await tokenResp.json();

    if (tokenJson.error) {
      console.error("Error exchanging code:", tokenJson);
      return res.status(400).json({ error: tokenJson });
    }

    // Example fields in response:
    // tokenJson.access_token
    // tokenJson.workspace_id
    // tokenJson.duplicated_template_id (if user duplicated your template)

    console.log("OAuth success:", tokenJson);

    // TODO: store tokenJson in your DB (workspace_id, access_token, etc.)
    // For now, just send back a success response
    return res.status(200).json({
      message: "Notion OAuth success!",
      data: tokenJson,
    });
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
