import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

// Connect to MongoDB — BetterAuth will save the accounts in here
const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("mentor-lagbe");

export const auth = betterAuth({
  // Use the MongoDB adapter so users are stored in MongoDB
  database: mongodbAdapter(db, {
    client,
  }),

  // Enable email + password sign up / sign in
  emailAndPassword: {
    enabled: true,
  },

  // Google login (optional feature)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // ============================================================
  // CUSTOM USER FIELDS (role, plan, phone, bio)
  // BetterAuth ONLY saves fields that are declared here.
  // This is why the role was not being stored before — it was
  // never declared, so MongoDB silently ignored it.
  // ============================================================
  user: {
    // Store users in the "users" collection (matches our
    // project requirement of 4 collections: users, tuitions,
    // applications, payments). Without this, BetterAuth would
    // use its default collection name "user".
    modelName: "users",

    additionalFields: {
      // The role the user picks on the sign up page.
      // `type: ["student", "tutor"]` means only these two values
      // are accepted — anything else (e.g. "admin") is rejected
      // by BetterAuth before it reaches the database.
      role: {
        type: ["student", "tutor"],
        required: false,
        defaultValue: "student", // every new user starts as a student
      },

      // The subscription plan (free or pro)
      plan: {
        type: "string",
        required: false,
        defaultValue: "free", // everyone starts on the free plan
        input: false, // the user CANNOT send this value themselves,
        // so nobody can fake a "pro" plan while signing up
      },

      // Extra profile fields (used later on the Update Profile page)
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

  // ============================================================
  // BEARER PLUGIN — lets our Express server (mentor-lagbe-server)
  // verify a login. The browser gets the session token from
  // authClient.getSession() and sends it as
  //   Authorization: Bearer <token>
  // The server forwards that header to BetterAuth's get-session
  // endpoint to check the user is really logged in.
  // ============================================================
  plugins: [bearer()],

  // ============================================================
  // Runs right BEFORE a new user is written to MongoDB.
  // This is our safety net: even if someone tries to send a
  // wrong role/plan in the request, we clean it here.
  // ============================================================
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // The hook param is not fully typed for extra fields,
          // so we read role/plan through a small type
          const u = user as { role?: string; plan?: string };

          // Keep only valid roles — anything else becomes "student"
          const safeRole = u.role === "tutor" ? "tutor" : "student";

          // Always start with the free plan
          const safePlan = "free";

          // Return the cleaned data — THIS is what gets saved
          // into the users collection in MongoDB
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
