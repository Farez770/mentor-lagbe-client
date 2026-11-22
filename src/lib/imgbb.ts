export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
    { method: "POST", body: formData },
  );

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error("Image upload failed. Please try again");
  }

  return json.data.url as string;
}
