import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

import app
from flask_praetorian.exceptions import InvalidTokenHeader, MissingTokenHeader

# def verify_signature(encoded_signature, pkey):
#     ok = b"""(request-target): get /fed/posts?community=General
# host: cs3099user-a1.host.cs.st-andrews.ac.uk
# client-host: cs3099user-a1.host.cs.st-andrews.ac.uk
# user-id: nnv2
# date: Tue, 23 Mar 2021 14:23:01 GMT
# digest: z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg=="""

#     public_key = serialization.load_pem_public_key(pkey)

#     decoded_signature = base64.b64decode(encoded_signature)
#     ret = public_key.verify(
#         decoded_signature,
#         ok,
#         padding.PKCS1v15(),
#         hashes.SHA512()
#     )

#     print(ret)

def verify_request(headers, request_target, body=b""):
    try:
        # Authentication Check
        token = app.guard.read_token_from_header()
        app.guard.extract_jwt_token(token)
    except (MissingTokenHeader, InvalidTokenHeader):
        # Otherwise, perform a signature check
        host = headers.get("Client-Host")
        signature = headers.get("Signature")

        if not host or not signature: return False

        signature = signature.split("signature=")[-1].replace('"', '') # zzzzz
        instance = app.federation.url_to_instance.get(host)
        
        if not instance.verify_signature(signature, request_target, headers, body=body):
            return False
        
    return True

def generate_signature(body):
    with open("../.ssh/private", "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
        )

    signature = private_key.sign(
        body,
        padding.PKCS1v15(),
        hashes.SHA512()
    )

    # Signature: keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host user-id date digest",signature="<base64_signature>"
    return base64.b64encode(signature).decode("ascii")

def generate_digest(body):
    digest = hashes.Hash(hashes.SHA512())
    digest.update(body)

    base64encoded = base64.b64encode(digest.finalize())

    return base64encoded.decode("ascii")