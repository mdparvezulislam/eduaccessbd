import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email/phone or password");
        }

        try {
          await connectToDatabase();

          const user = await User.findOne({
            $or: [
              { email: credentials.email }, 
              { phone: credentials.email }
            ]
          }).select("+password");

          if (!user) {
            throw new Error("No user found with this email or phone");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // 4. Return User Data (Stored in Session)
          // ✅ Added phone here
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user",
            image: user.image,
            phone: user.phone || null, 
          };
        } catch (error) {
          console.error("Auth error: ", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone; // ✅ Save phone to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string | undefined; // ✅ Expose phone in session
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};