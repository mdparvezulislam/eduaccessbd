import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  // (Optional) check if user is logged in before allowing upload
  const { token, expire, signature } = getUploadAuthParams({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
    // expire: 60 * 30, // optional: token expires in 30 mins
    // token: "random-token" // optional: provide your own unique token
  });

  return Response.json({
    token,
    expire,
    signature,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  });
}