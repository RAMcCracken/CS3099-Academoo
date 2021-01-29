from app import db, guard
from app.models import User, Community, Post, UserRole, getTime
from sqlalchemy import desc
import json
from uuid import UUID
import re

# NOTE: Should move to utils.py later when we refactor the code
def isUUID(val):
    try:
        UUID(val)
        return True
    except ValueError:
        return False

# NOTE: Move to utils.py
def validate_username(username):
    if not re.match("<^[a-zA-Z0-9-_]{1,24}$>", username):
        return (400, {"title": "Invalid username", "message": "username does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"})

# NOTE: Move to utils.py
def validate_community_id(community_id):
    if not re.match("<^[a-zA-Z0-9-_]{1,24}$>", community_id):
        return (400, {"title": "Invalid community id", "message": "community id does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"})

# NOTE: Move to utils.py
def validate_role(role):
    available_roles = ["admin", "contributor", "member", "guest", "prohibited"]
    if role not in available_roles:
        return (400, {"title": "Invalid role name", "message": "available roles are admin, contributor, member, guest, prohibited"})

# NOTE: Move to utils.py
def validate_post_id(post_id):
    if not isUUID(post_id):
        return (400, {"title": "post id is not in the correct format", "message": "Format of post id should be uuid4 string"})

def validate_json(file):
    try:
        json.loads(file)
    except ValueError:
        return (400, {"title": "Invalid JSON file passed", "message": "Make sure JSON file is properly formatted"})



def createCommunity(community_id, title, description, admins):
    validate_community_id(community_id)

    if Community.query.filter_by(id=community_id) is not None:
        return (400, {"title": "Community already exists", "message": "Please pick another community id that is not taken by an existing community"})

    community = Community(id=id, title=title, description=description)
    db.session.add(community)

    for admin in admins:
        if User.query.filter_by(user_id=admin) is None:
            return (404, {"title": "Could not find user" + admin, "message": "User does not exist on database, specify a different user"})
        response = grantRole(admin, id, "admin")
        ######################## not best way to do
        if response[0] != 200:
            return response
        ########################
    return (200, None)

def grantRole(username, community_id, role="member"):
    validate_community_id(community_id)
    validate_username(username)
    validate_role(role)
        
    user = User.query.filter_by(user_id = username).first()
    if user is None:
        return (404, {"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"})
    
    if UserRole.query.filter_by(user_id=username, id=community_id) is None:
        new_role = UserRole(user_id=username, community_id=community_id, role=role)
        db.session.add(new_role)
        db.session.commit()
    else:
        existing_role = UserRole.query.filter_by(user_id=username, id=community_id)
        existing_role.role = role
        db.session.commit()
    return (200, None)


def setDefaultRole(default_role, community_id):
    validate_community_id(community_id)
    validate_role(default_role)
    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return (404, {"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"})
    community.default_role = default_role
    db.session.commit()
    return (200, None)

def getDefaultRole(community_id):
    validate_community_id(community_id)
    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return (404, {"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"})
    community_dict = {"default_role": community.default_role}
    return (200, community_dict)

def createUser(username, email, password):
    validate_username(username)
    if db.session.query(User).filter_by(user_id=username).count() < 1 and db.session.query(User).filter_by(email=email).count() < 1:
        db.session.add(User(
            user_id=username,
            email=email,
            password_hash=guard.hash_password(password),
            host="Academoo",
        ))
        db.session.commit()
        return (200, None)
    
    return (400, {"title": "Username already taken by another user", "message": "Please pick another username that is not taken by an existing user"})

def getUser(user_id):
    validate_username(user_id)
    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return (404, {"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"})
    user_dict = {"id": user.user_id, "posts": [{"id": post.id, "host": post.host} for post in Post.query.filter_by(author_id=user.id)]}
    return (200, user_dict)

def searchUsers(prefix):
    validate_username(prefix)
    search = "{}%".format(prefix)
    users = User.query.filter(User.user_id.like(search))
    user_arr = [user.user_id for user in users]
    return (200, user_arr)

# Is this for only our server?, or for external users that have a role on our server as well
def getUserIDs():
    ids = [user.user_id for user in User.query.all()]
    return (200, ids)

def getRoles(community_id):
    validate_community_id(community_id)
    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return (404, {"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"})

    user_dict = {
        "admins": [user.user_id for user in community.admins()],
        "contributors": [user.user_id for user in community.contributors()],
        "members": [user.user_id for user in community.members()],
        "guests": [user.user_id for user in community.guests()],
        "prohibited": [user.user_id for user in community.prohibited()]
    }
    return (200, user_dict)


def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return (200, ids)

def getCommunity(community_id):
    validate_community_id(community_id)
    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return (404, {"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"})
    
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins()]}
    return (200, community_dict)

def getAllCommunityPostsTimeModified(community_id):
    # NOTE: shouldn't this return for all posts? Also, when we add comments to a post, then that parent post should have modified time updated as well?
    validate_community_id(community_id)
    if Community.query.filter_by(id = community_id).first() is None:
        return (404, {"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"})

    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return (200, post_dicts)

# Post host isnt a thing right now
def getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type):
    if community_id != "null": validate_community_id(community_id)
    if author != "null": validate_username(author)
    if parent_post != "null": validate_post_id(parent_post)
    
    query = db.session.Query(Post)
    if community_id != "null":
        query = query.filter(Post.community_id == community_id)
    if min_date != "null":
        query = query.filter(Post.created >= min_date)
    if author != "null":
        query = query.filter(Post.author_id == author)
    if host != "null":
        query = query.filter(Post.host == host)
    if parent_post != "null":
        query = query.filter(Post.parent_id == parent_post)
    if content_type != "null":
        query = query.filter(Post.content_type == content_type)
    if limit != "null":
        query = query.limit(limit)

    ''' add once tested fully
    if include_children:
        limit -= len(query)
        for post in query:
            post_children = getFilteredPosts(limit, community_id, min_date, author, host, post.id, True, content_type)
            limit -= len(post_children)
            query += post_children
    '''
    
    # ONLY SUPPORTS TEXT CONTENT TYPE
    post_dicts = [{"id": post.id, "community": post.community_id, "parentPost": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content": [{post.content_type: {"text": post.body}}], "author": {"id": post.author.user_id, "host": post.author.host}, "modified": post.modified, "created": post.created} for post in query]
    return (200, post_dicts)

# Post host may not be tied to author idk
# Author host is not in json file so will need to passed in manually :(
def createPost(post_data, host="NULL"):
    validate_json(post_data)
    community_id = post_data["community"]
    parent_post = post_data["parentPost"]
    title = post_data["title"]
    content_arr = post_data["content"]
    content_type = "text" #content_arr[0]["text"]
    content_body = content_arr[0]["text"]["text"]
    author_id = post_data["author"] # host not given so it will be "NULL" for moment

    validate_community_id(community_id)
    validate_username(author_id)
    if parent_post != "null": validate_post_id(parent_post)

    if User.query.filter_by(user_id = author_id) is None:
        new_user = User(user_id = author_id, host = host)
        db.session.add(new_user)
        db.session.commit()
    
    new_post = Post(community_id=community_id, title=title, parent_id=parent_post, content_type=content_type, body=content_body, author_id=author_id)
    db.session.add(new_post)
    db.session.commit()
    return (200, None)
        
# CONTENT FIELD IS WRONG AND WEIRD
def getPost(post_id):
    validate_post_id(post_id)
    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return (404, {"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"})

    post_dict = {"id": post.id, "community": post.community_id, "parentPost": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content": [{post.content_type: {"text": post.body}}], "author": {"id": post.author.user_id, "host": post.author.host}, "modified": post.modified, "created": post.created}
    return (200,post_dict)

# STILL NEED TO IMPLEMENT 403 FORBIDDEN
def editPost(post_id, post_data):
    validate_json(post_data)
    validate_post_id(post_id)
    update_title = post_data["title"]
    update_content_arr = post_data["content"]
    update_content_type = "text" #update_content_arr[0]["text"]
    update_content_body = update_content_arr[0]["text"]["text"]

    post = Post.query.filter_by(id = post_id)
    if post is None:
        return (404, {"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"})

    post.title = update_title
    post.content_type = update_content_type
    post.body = update_content_body
    db.session.commit()
    return (200, None)

# STILL NEED TO IMPLEMENT 403 FORBIDDEN
def deletePost(post_id):
    validate_post_id(post_id)
    post = Post.query.filter_by(id = post_id)
    if post is None:
        return (404, {"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"})

    db.session.delete(post)
    db.session.commit()
    return (200, None)

def changePassword(username, old_password, new_password):
    user = guard.authenticate(username, old_password)
    print(user)
    if user:
        user.password_hash = guard.hash_password(new_password)
        db.session.commit()
        return True
    
    return False