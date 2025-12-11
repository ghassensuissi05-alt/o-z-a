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

  try {
    // Fetch existing file
    const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const fileData = await fileRes.json();
    const content = Buffer.from(fileData.content, "base64").toString();
    const users = JSON.parse(content);

    // Check if user already exists
    const existingUser = users.find(user => user.f === f && user.l === l && user.p === p);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Add new user
    users.push({ f, l, p });

    // Commit update
    const commitRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
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

    const commitResult = await commitRes.json();
    if (commitResult.error) {
      return res.status(500).json({ error: commitResult.error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
