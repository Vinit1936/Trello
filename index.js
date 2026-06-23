const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { UserModel } = require("./schema");
const bcrypt = require("bcrypt");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

app.use(express.json());

// Auth Routes
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExist = await UserModel.findOne({ username });

    if (userExist) {
      return res.status(400).json({
        error: "User with that username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      userId: newUser._id,
      message: "Signed up successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({
        msg: "User doesn't exist",
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({
        msg: "Incorrect password",
      });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.status(200).json({
      message: "Signin Successful",
      token,
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(8000);