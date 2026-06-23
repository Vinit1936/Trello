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
    boardId
}

# Routes!