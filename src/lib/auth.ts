import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("mentor-lagbe");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    modelName: "users",

    additionalFields: {
      role: {
        type: ["student", "tutor"],
        required: false,
        defaultValue: "student",
      },

      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },

      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "1d",
        definePayload: ({ user }) => ({
          role: (user as { role?: string }).role ?? "student",
        }),
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const u = user as { role?: string; plan?: string };

          const safeRole = u.role === "tutor" ? "tutor" : "student";

          const safePlan = "free";

          return {
            data: {
              ...user,
              role: safeRole,
              plan: safePlan,
            },
          };
        },
      },
    },
  },
});
