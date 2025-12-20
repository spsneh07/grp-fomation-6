import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      // ✅ Fix 1: Added '!' to assert these exist
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              avatarUrl: user.image,
              password: "", // Optional now
              hasCompletedOnboarding: false,
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving Google user:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session }) {
      if (session.user) {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });
        
        if (dbUser) {
          // ⚠️ We use (session.user as any) to stop the red lines
          (session.user as any).id = dbUser._id.toString();
          (session.user as any).hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
          
          // You can also add other fields easily now
          (session.user as any).jobTitle = dbUser.jobTitle;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };