import clientPromise from "lib/mongodb";
import {NextApiRequest, NextApiResponse} from "next";

let db: any; // Type 'any' should be avoided whenever possible

async function initDB() {
  if (db) return db;

  const client = await clientPromise;
  db = client.db(); // Assuming client.db() returns the database instance
  console.log("Database connected");
  return db;
}

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse<{code: number; message: string; data?: any}>
) {
  const {method, body} = req;
  const {email, password} = body;

  if (method !== "POST") {
    res.status(405).json({code: 405, message: "Method Not Allowed"});
    return;
  }

  if (!email || !password) {
    res.status(401).json({code: 401, message: "Invalid email or password"});
    return;
  }

  try {
    const db = await initDB();
    const users = db.collection("users");

    // Check if email exists
    const existingUser = await users.findOne({email});

    if (existingUser) {
      if (existingUser.password !== password) {
        res.status(400).json({code: 400, message: "Invalid email/password"});
        return;
      } else {
        res
          .status(200)
          .json({
            code: 200,
            message: "Email already exists",
            data: existingUser,
          });
        return;
      }
    }

    // Hash password before storing (recommended for security)
    // Replace this with your password hashing logic
    // const hashedPassword = await hashPassword(password);
    const hashedPassword = password;

    // Create new user document
    const newUser = {
      email,
      password: hashedPassword,
      createdOn: new Date(),
      _id: "", // Replace with the actual ID after insertion
    };

    // Insert new user
    await users.insertOne(newUser);

    res
      .status(201)
      .json({code: 201, message: "User created successfully", data: newUser});
  } catch (error) {
    console.error(error);
    res.status(500).json({code: 500, message: "Internal server error"});
  }
}
