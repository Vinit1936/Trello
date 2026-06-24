we are building trello application by Atlassian
# Schema 

user :{
    id
    username
    password  
}

orgs :{
    id:
    title:
    descirption:
    admin:
    members :[]
}

boards{
    id
    title
    orgId:
}

issue {
    id
    title
    status [inqueue, inprogress, done]
    boardId
}

# Routes!

/signin post (done)
/signup post (done)

/create org post (done)
/add member to org post(done)

/create board post (done)
/create issue post (done)

# get

/boards?=orgId (done)
/issues?=boardId 
/members?= orgId

# put

/issues?issue id to move the status of issue


# delete

/issues? = id
/members