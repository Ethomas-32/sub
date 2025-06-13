import withAuth from "next-auth/middleware";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_CLIENT_ID!,
            clientSecret: process.env.AZURE_CLIENT_SECRET!,
            tenantId: process.env.AZURE_TENANT_ID!
        })
    ],
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            session.user.role = token.role;
            return session;
        }
    }
};

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "admin" || token?.role === "user",
  },
});
