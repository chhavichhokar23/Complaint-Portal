export async function POST(req: Request) {
  try {
    const formData= await req.formData()
    const file = formData.get("file") as File
    if (!file) {
        return Response.json({ error: "No file uploaded" }, { status: 400 })
        }
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]

    if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
        return Response.json({ error: "File too large" }, { status: 400 })
        }


  } catch (error) {
    
  }
}