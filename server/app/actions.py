from app import db, guard
from app.models import User, Community, Post, UserRole, getTime
from sqlalchemy import desc
import json
from uuid import UUID
import re
from utils import *

def createCommunity(community_id, title, description, admin):
    if validate_community_id(community_id): return validate_community_id(community_id)
    
    if Community.query.filter_by(id=community_id).first() is not None:
        return ({"title": "Community already exists", "message": "Please pick another community id that is not taken by an existing community"}, 400)

    community = Community(id=community_id, title=title, description=description)
    db.session.add(community)
    
    if User.query.filter_by(user_id=admin) is None:
        return ({"title": "Could not find user" + admin, "message": "User does not exist on database, specify a different user"}, 404)
        
    response = grantRole(admin, community_id, admin, "admin")
    if response[1] != 200:
        return response

    db.session.commit()
    return (None, 200)

# TODO: We need to handle granting roles to external users too
def grantRole(username, community_id, current_user, role="member", external=False, user_host=None):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(username): return validate_username(username)
    if validate_role(role): return validate_role(role)

    user = User.query.filter_by(user_id = username).first()
    if user is None:
        if external:
            if user_host is None:
                return ({"title": "external user host not provided", "message": "Please provide external user host by specifying grantRole external_host parameter"}, 400)
            external_user = User(user_id=username, host = user_host)
            db.session.add(external_user)
        else:
            return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)
    
    current_role = UserRole.query.filter_by(user_id=current_user, community_id=community_id).first()

    if current_role is not None and username == current_user:
        return ({"title": "User cannot change own role", "message": "please choose another user"}, 400)

    if UserRole.query.filter_by(user_id=username, community_id=community_id).first() is None:
        new_role = UserRole(user_id=username, community_id=community_id, role=role)
        db.session.add(new_role)
        db.session.commit()
    else:
        existing_role = UserRole.query.filter_by(user_id=username, community_id=community_id).first()
        existing_role.role = role
        db.session.commit()

    
    return (None, 200)


def setDefaultRole(default_role, community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_role(default_role): return validate_role(default_role)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community.default_role = default_role
    db.session.commit()
    return (None, 200)

def getDefaultRole(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community_dict = {"default_role": community.default_role}
    return (community_dict, 200)

def createUser(username, email, password):
    if validate_username(username): return validate_username(username)

    if db.session.query(User).filter_by(user_id=username).count() < 1 and db.session.query(User).filter_by(email=email).count() < 1:
        db.session.add(User(
            user_id=username,
            email=email,
            password_hash=guard.hash_password(password),
            host="Academoo",
        ))
        db.session.commit()
        return (None, 200)
    
    return ({"title": "Username already taken by another user", "message": "Please pick another username that is not taken by an existing user"}, 400)

def getUser(user_id):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 404)
    user_dict = {"id": user.user_id, "posts": [{"id": post.id, "host": post.host} for post in Post.query.filter_by(author_id=user.id)]}
    return (user_dict, 200)

def searchUsers(prefix):
    if validate_username(prefix): return validate_username(prefix)

    search = "{}%".format(prefix)
    users = User.query.filter(User.user_id.like(search))
    user_arr = [user.user_id for user in users]
    return (user_arr, 200)

def updateBio(user_id, bio):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    user.bio = bio
    db.session.commit()

def updatePrivacy(user_id, private_account):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    if private_account == "private" :
        user.private_account = True
    elif private_account == "public":
        user.private_account = False
    else:
        return False
    db.session.commit()
    user_dict = {"id": user.user_id, "private": private_account}
    return user_dict

def getUserIDs():
    ids = [user.user_id for user in User.query.all()]
    return (ids, 200)

def getRoles(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)

    user_dict = {
        "admins": [user.user_id for user in community.admins()],
        "contributors": [user.user_id for user in community.contributors()],
        "members": [user.user_id for user in community.members()],
        "guests": [user.user_id for user in community.guests()],
        "prohibited": [user.user_id for user in community.prohibited()]
    }
    return (user_dict, 200)


def getLocalUser(id):
    if validate_username(id): return validate_username(id)

    user = User.query.filter_by(user_id=id).first()
    if(user == None):
        return False
    else:
        if user.private_account:
            user_dict = {"id":user.user_id, "email": "", "host":user.host, "bio":""}
            return user_dict
        else:
            user_dict = {"id": user.user_id, "email": user.email, "host": user.host, "bio": user.bio}
            return user_dict

def addSubscriber(user_id, community_id):
    user = User.query.filter_by(user_id = user_id).first()
    user.subscribed_communities.add(community_id)

    db.sesssion.commit()

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return (ids, 200)

def getCommunity(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins()]}
    return (community_dict, 200)

def getAllCommunityPostsTimeModified(community_id):
    # NOTE: shouldn't this return for all posts? Also, when we add comments to a post, then that parent post should have modified time updated as well?
    # it do do that though
    if validate_community_id(community_id): return validate_community_id(community_id)

    if Community.query.filter_by(id = community_id).first() is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)

    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return (post_dicts, 200)

# Post host isnt a thing right now
def getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type):
    if community_id is not None: 
        if validate_community_id(community_id): return validate_community_id(community_id)
    if author is not None: 
        if validate_username(author): return validate_username(author)
    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)
    
    query = db.session.query(Post)
    if community_id is not None:
        query = query.filter(Post.community_id == community_id)
    if min_date is not None:
        query = query.filter(Post.created >= min_date)
    if author is not None:
        query = query.filter(Post.author_id == author)
    if host is not None:
        query = query.filter(Post.host == host)
    if parent_post is not None:
        query = query.filter(Post.parent_id == parent_post)
    if content_type is not None:
        query = query.filter(Post.content_type == content_type)
    query = query.order_by(desc(Post.created))
    if limit is not None:
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
    return (post_dicts, 200)

# Post host may not be tied to author idk
# Author host is not in json file so will need to passed in manually :(
def createPost(post_data, host="NULL"):
    community_id = post_data["community"]
    parent_post = post_data["parentPost"]
    title = post_data["title"]
    content_arr = post_data["content"]
    content_type = "text" #content_arr[0]["text"]
    content_body = content_arr[0]["text"]["text"]
    author = post_data["author"] # host not given so it will be "NULL" for moment
    author_id = author["id"]
    host = author["host"]

    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(author_id): return validate_username(author_id)
    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)

    if User.query.filter_by(user_id = author_id) is None:
        new_user = User(user_id = author_id, host = host)
        db.session.add(new_user)
        db.session.commit()
    
    new_post = Post(community_id=community_id, title=title, parent_id=parent_post, content_type=content_type, body=content_body, author_id=author_id, host=host)
    db.session.add(new_post)
    db.session.commit()
    return (None, 200)
        
# CONTENT FIELD IS WRONG AND WEIRD
def getPost(post_id):
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    post_dict = {"id": post.id, "community": post.community_id, "parentPost": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content": [{post.content_type: {"text": post.body}}], "author": {"id": post.author.user_id, "host": post.author.host}, "modified": post.modified, "created": post.created}
    return (post_dict, 200)

def editPost(post_id, post_data, requester):
    if validate_post_id(post_id): return validate_post_id(post_id)
    print("AFTER VAL EDIT")

    update_title = post_data["title"]
    update_content_arr = post_data["content"]
    update_content_type = "text" #update_content_arr[0]["text"]
    update_content_body = update_content_arr[0]["text"]["text"]

    post = Post.query.filter_by(id = post_id).first()
    
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    if requester.user_id != post.author.user_id:
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to edit this post"}, 403)


    post.title = update_title
    post.content_type = update_content_type
    post.body = update_content_body
    db.session.commit()
    return (None, 200)

def deletePost(post_id, requester):
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    if requester.user_id != post.author.user_id:
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to delete this post"}, 403)

    #will need to recursively delete comments
    ''' comment.id will not exist if comment is None
    print(post.comments)
    for comment in post.comments:
        if comment is None:
            return ({"title": "could not find comment id " + comment.id, "message": "Could not find comment id, use another comment id"}, 404)
        db.session.delete(comment)
    '''

    db.session.delete(post)
    db.session.commit()
    return (None, 200)

def changePassword(username, old_password, new_password):
    user = guard.authenticate(username, old_password)
    if user:
        user.password_hash = guard.hash_password(new_password)
        db.session.commit()
        return True
    
    return False