from app import db
from app.models import User, Community, Post
import json
import time

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return ids

def getCommunity(community_id):
    community = Community.query.filter_by(id = community_id).first()
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins]}
    return community_dict

def getAllCommunityPostsTimeModified(community_id):
    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community = community_id)]
    return post_dicts

def getFilteredPosts(limit, community_id, min_date):
    posts = Post.query.filter(Post.created >= min_date, Post.community == community_id).limit(limit)
    post_dicts = [{"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content-type": post.content_type, "body": post.body, "author": {"id": post.admin.id, "host": post.admin.host}, "modified": post.modified, "created": post.created} for post in posts]
    return post_dicts

def createPost(post_data):
    # to_create = json.loads(json_file)
    post_id = post_data["id"]
    # COULD BE NONE
    post_parent = post_data["parent"]
    post_title = post_data["title"]
    post_content_type = post_data["content_type"]
    post_body = post_data["body"]
    author_dict = post_data["author"]

    author_id = author_dict["id"]
    author_host = author_dict["host"]
    current_time = int(time.time())
    post_created = current_time
    post_modified = current_time
    post_community = None # Still dont know where to find community in a post json doc help plz

    if User.query(User.id).filter_by(user_id = author_id).scalar() is not None:
        user = User(user_id = author_id, host = author_host)
        db.session.add(user)
        db.session.commit()
    
    post_author = User.query.filter_by(user_id = author_id)
    post = Post(id=post_id, title=post_title, author=post_author, content_type=post_content_type, body=post_body, parent=post_parent, created=post_created, modified=post_modified, community=post_community)
    db.session.add(post)
    db.session.commit()

def getPost(post_id):
    post = Post.query.filter_by(id = post_id).first()
    post_dict = {"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content-type": post.content_type, "body": post.body, "author": {"id": post.admin.id, "host": post.admin.host}, "modified": post.modified, "created": post.created}
    return json.dumps(post_dict)

def editPost(post_id, post_data):
    # to_update = json.loads(json_file)
    update_title = post_data["title"]
    update_content_type = post_data["content_type"]
    update_body = post_data["body"]
    update_modified = int(time.time())

    post = Post.query.filter_by(id = post_id)
    post.title = update_title
    post.content_type = update_content_type
    post.body = update_body
    post.modified = update_modified
    db.session.commit()

def deletePost(post_id):
    post = Post.query.filter_by(id = post_id)
    db.session.delete(post)
    db.session.commit()