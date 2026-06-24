const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { UserModel, OrgModel, BoardModel, IssueModel } = require("./schema");
const bcrypt = require("bcrypt");
const { authMiddleware } = require("./middleware");
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

//Post Routes
aapp.post("/orgs", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const admin = req.userId;

    const newOrg = await OrgModel.create({
      title,
      description,
      admin,
      members: [admin],
    });

    res.status(201).json({
      message: "Org created",
      orgId: newOrg._id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/members", authMiddleware, async (req, res) => {
  try {
    const orgId = req.query.orgId;
    const username = req.body.username;
    const requesterId = req.userId;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const org = await OrgModel.findById(orgId);
    if (!org) {
      return res.status(404).json({
        error: "Organization not found",
      });
    }

    // only admin can add members
    if (org.admin.toString() !== requesterId) {
      return res.status(403).json({
        error: "Only admin can add members",
      });
    }

    // avoid duplicate members
    const alreadyMember = org.members.includes(user._id);
    if (alreadyMember) {
      return res.status(400).json({
        error: "User is already a member",
      });
    }

    org.members.push(user._id);
    await org.save();

    res.status(200).json({
      message: "Member added successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/boards", authMiddleware, async (req, res) => {
  try {
    const orgId = req.query.orgId;
    const title = req.body.title;
    const requesterId = req.userId;

    const org = await OrgModel.findById(orgId);
    if (!org) {
      return res.status(404).json({
        error: "Organization not found",
      });
    }

    // const members = org.members.map((member) => member.toString());
    // const isMember = members.includes(requesterId);
    const isMember = org.members.some(
      //checks if atleast one element satisfy the condition
      (member) => member.toString() === requesterId,
    );

    if (!isMember) {
      return res.status(403).json({
        error: "Access Denied",
      });
    }

    const newBoard = await BoardModel.create({
      title,
      orgId,
    });

    res.json(201).json({
      message: "New Board Added to Organisation",
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/issues", authMiddleware, async (req, res) => {
  try {
    const boardId = req.query.boardId;
    const { title, description, status } = req.body;
    const requesterId = req.userId;

    const board = await BoardModel.findById(boardId); //_id : boardId
    if (!board) {
      return res.status(404).json({
        error: "Board not found",
      });
    }

    const org = await OrgModel.findById(board.orgId); // _id : board.orgId
    if (!org) {
      return res.status(404).json({
        error: "Organization doesn't exist",
      });
    }

    const isValidUser = org.members.some(
      (member) => member.toString() === requesterId,
    );

    if (!isValidUser) {
      return res.status(403).json({
        error: "Access Denied",
      });
    }

    const newIssue = await IssueModel.create({
      title,
      description,
      status,
      board: boardId,
    });

    res.status(201).json({
      message: "New issue added successfully",
      issueId: newIssue._id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

//Get routes
app.get("/board", authMiddleware, async (req, res) => {
  try {
    const orgId = req.query.orgId;
    const requesterId = req.userId;

    const org = await OrgModel.findById(orgId);

    if (!org) {
      return res.status(404).json({
        error: "Organization doesn't exist",
      });
    }

    const isValidUser = org.members.some(
      member => member.toString() === requesterId
    );

    if (!isValidUser) {
      return res.status(403).json({
        error: "Access Denied",
      });
    }

    const boards = await BoardModel.find({ orgId });

    res.status(200).json({
      boards
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get('/issues', authMiddleware, async (req, res) => {
  try {
    const boardId = req.query.boardId;
    const requesterId = req.userId;

    const board = await BoardModel.findById(boardId);

    if (!board) {
      return res.status(404).json({
        error: "Board not found",
      });
    }

    const org = await OrgModel.findById(board.orgId);

    if (!org) {
      return res.status(404).json({
        error: "Organization doesn't exist",
      });
    }

    const isValidUser = org.members.some(
      member => member.toString() === requesterId
    );

    if (!isValidUser) {
      return res.status(403).json({
        error: "Access Denied",
      });
    }

    const issues = await IssueModel.find({ board: boardId });

    res.status(200).json({
      issues
    });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error"
    });
  }
});




app.listen(8000, () => {
  console.log(`Server listening at port 8000`);
});
