from app import actions, federation
from app.supergroup_protocol import bp
from flask import jsonify, request, Response
from app.models import User, Community
from utils import *
import json

def respond_with_action(actionResponse):
    data, status = actionResponse
    if data is None:
        return Response(status=status)
    else:
        return jsonify(data), status
# User
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getUserIDs())
    else:
        return jsonify(federation.get_users(external))

@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getLocalUser(id))
    else:
        return jsonify(federation.get_users(external, id=id))

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    host = request.headers.get("Client-Host")
    if host is None:
        return Response(status = 400)
    external = request.args.get("external")

    if not external:
        body, status = actions.getCommunityIDs()
        return respond_with_action(actions.getCommunityIDs())
    else:
        headers = {"Client-Host": host}
        return jsonify(federation.get_communities(external, headers))

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    host = request.headers.get("Client-Host")
    if host is None:
        return Response(status = 400)
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getCommunity(id))
    else:
        headers = {"Client-Host": host}
        return jsonify(federation.get_communities(external, headers, id=id))

@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id): ############################################################# NO SUPPORT FOR FEDERATION?????????????/
    ##headers = request.headers['Client-Host']
    return respond_with_action(actions.getAllCommunityPostsTimeModified(id))

# Posts
@bp.route("/posts", methods=["GET"])
def get_all_posts():
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)
    # limit, community, min_date
    limit = int(request.args.get("limit", 20))
    community_id = request.args.get("community")
    min_date = request.args.get("minDate", 0)
    author = request.args.get("author") #####
    #host = request.args.get("host") ###### removed from protocol
    parent_post = request.args.get("parentPost")
    include_children = request.args.get("includeSubChildrenPosts")
    content_type = request.args.get("contentType")

    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        responseArr = federation.get_posts(external, community_id, headers)
        for post in responseArr:
            post['host'] = external
        
        return jsonify(responseArr)

@bp.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    external = request.args.get("external")
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)

    if not external:
        return respond_with_action(actions.getPost(id))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        post = federation.get_post_by_id(external, id, headers)
        post['host'] = external
        
        return jsonify(post)

@bp.route("/posts", methods=["POST"])
def create_post():
    external = request.json.get("external", None)
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)

    if check_create_post(request.get_json(silent=True, force=True)): return check_create_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)
    if external is None:
        community_id = request.json["community"]

        if requester is None:
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "contributor") & (role != "admin")):
                return Response(status = 403)
        elif not requester.has_role(community_id, "guest"):
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "contributor") & (role != "admin")):
                return Response(status = 403)
        else :
            if not requester.has_role(community_id, "contributor"):
                return Response(status = 403)
        
        return respond_with_action(actions.createPost(request.json, requester_str, host))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return federation.create_post(external, request.json, headers)

    #return Response(status = 201)

@bp.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)
    external = request.json.get("external", None) # Changed from request.json.get("external") as external not field in create_post json

    if check_edit_post(request.get_json(silent=True, force=True)): return check_edit_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)

    if external is None:
        actions.editPost(id, request.json, requester)
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        federation.edit_post(external, request.json, headers)

    return Response(status = 200)

@bp.route("/posts/<id>", methods=["DELETE"])
def delete_post(id):
    external = request.args.get("external")

    host = request.headers.get("Client-Host") 
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)

    requester = User.lookup(requester_str)

    if external is None:
        actions.deletePost(id, requester)
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        federation.delete_post(external, request.json, headers)

    return Response(status = 200)
