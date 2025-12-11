export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { f, l, p } = req.body;

  if (!f || !l || !p) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const repoOwner = "ghassensuissi05-alt";
  const repoName = "o-z-a";
  const filePath = "users.json";
  const token = process.env.GITHUB_TOKEN;

  // Fetch existing file
  const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const fileData = await fileRes.json();
  const content = Buffer.from(fileData.content, "base64").toString();
  const users = JSON.parse(content);

  // Add new user
  users.push({ f, l, p });

  // Commit update
  await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Add new user",
      content: Buffer.from(JSON.stringify(users, null, 2)).toString("base64"),
      sha: fileData.sha
    })
  });

  return res.status(200).json({ success: true });
}
