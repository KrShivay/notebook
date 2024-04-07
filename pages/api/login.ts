import clientPromise from "lib/mongodb";

let client: any;
let db: any | undefined;
let users: any;

export async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = await client.db();
    users = db.collection("users");
    console.log("Database connected >>>>");
    return true;
  } catch (error) {
    throw new Error("Failed to stablish connection to database");
  }
}

export default async function loginHandler(
  req: {body: {email: any; password: any}; method: string},
  res: {
    send: (arg0: {responseCode: number; responseMessage: string}) => void;
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: {code: number; message: string; data?: any}): void;
        new (): any;
      };
    };
  }
) {
  const {email, password} = req.body;
  if (!email || !password) {
    res.send({
      responseCode: 401,
      responseMessage: "Invalid email or password",
    });
  }

  if (req.method === "POST") {
    try {
      if (!users) await init();

      // Check if email exists
      const existingUser = await users.findOne({email});

      if (existingUser) {
        if (!existingUser.password === password) {
          res.status(200).json({
            code: 400,
            message: "Invalid email/password",
          });
          return;
        } else {
          res.status(200).json({
            code: 200,
            message: "Email already exists",
            data: existingUser,
          });
          return;
        }
      }

      // Hash password before storing (recommended for security)
      // You'll need to install a library like bcryptjs for password hashing
      // const hashedPassword = await hashPassword(password); // Replace with your password hashing logic
      const hashedPassword = password; // Replace with your password hashing logic

      // Create new user document
      const newUser = {
        email,
        password: hashedPassword,
        createdOn: new Date(),
        _id: "",
      };

      // Insert new user
      await users.insertOne(newUser, function (err: Error) {
        if (err) return;
        // Object inserted successfully.
        var objectId = newUser._id; // this will return the id of object inserted
      });
      console.log({newUser});
      res
        .status(200)
        .json({code: 201, message: "User created successfully", data: newUser});
    } catch (error) {
      console.error(error);
      res.status(200).json({code: 500, message: "Internal server error"});
    } finally {
    }
  } else {
    res.status(200).json({code: 405, message: "Method Not Allowed"});
  }
}
