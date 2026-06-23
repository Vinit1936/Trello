const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
});

const orgSchema = new Schema({
    title: String,
    description: String,
    admin: {
        type: ObjectId,
        ref: "User"
    },
    members: [{
        type: ObjectId,
        ref: "User"
    }]
});

const boardSchema = new Schema({
    title: String,
    orgId: {
        type: ObjectId,
        ref: "Organization"
    }
});

const issueSchema = new Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ["Inqueue", "Inprogress", "Done"]
    },
    board: {
        type: ObjectId,
        ref: "Board"
    }
});

const UserModel = mongoose.model("User", userSchema);
const OrgModel = mongoose.model("Organization", orgSchema);
const BoardModel = mongoose.model("Board", boardSchema);
const IssueModel = mongoose.model("Issue", issueSchema);

module.exports = {
    UserModel,
    OrgModel,
    BoardModel,
    IssueModel
};