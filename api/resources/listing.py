from api import db
from api.utils.req_handling import *
from flask_login import current_user
from flask_restplus import Resource, fields
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import or_
import api
import json
import logging

listing = api.api.namespace("listings", description="Listing operations")

RESULT_LIMIT = 20

listing_details = api.api.model(
    "Listing",
    {
        "listing_id": fields.Integer(
            required=True, description="The ID of the listing"
        ),
        "listing_name": fields.String(
            required=True, description="The name of the listing"
        ),
        "address": fields.String(
            required=True, description="The address of the listing"
        ),
        "category": fields.String(required=True, description="The category"),
        "description": fields.String(required=True, description="The description"),
        "user_id": fields.Integer(
            required=True, description="The owner of the listing"
        ),
        "username": fields.String(required=True, description="Username of the user"),
    },
)


class ListingModel(db.Model):
    __tablename__ = "listings"
    listing_id = db.Column(db.Integer, primary_key=True)
    listing_name = db.Column(db.Text, unique=True)
    address = db.Column(db.Text)
    category = db.Column(db.Text)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    username = db.Column(db.Text, db.ForeignKey("users.username"), nullable=False)

    def __repr__(self):
        return json.dumps(self.to_dict())

    def to_dict(self):
        data = {
            "listing_id": self.listing_id,
            "listing_name": self.listing_name,
            "address": self.address,
            "category": self.category,
            "description": self.description,
            "user_id": self.user_id,
            "username": self.username,
        }
        return data


# See example: https://github.com/noirbizarre/flask-restplus/blob/master/examples/todo.py
@listing.route("/<int:listing_id>")
@listing.param("listing_id", "The listing identifier")
@listing.response(404, "listing not found")
class Listing(Resource):
    @listing.doc(description=f"listing_id must be provided")
    @listing.marshal_with(listing_details)
    def get(self, listing_id):
        logging.info(f"Getting listing {listing_id}")
        return ListingModel.query.get_or_404(listing_id).to_dict()

    @listing.doc(description=f"listing_id must be provided")
    @listing.marshal_with(listing_details)
    def delete(self, listing_id):
        logging.info(f"Deleting listing {listing_id}")
        listing = ListingModel.query.filter(ListingModel.listing_id == listing_id)
        listing.delete()
        db.session.commit()
        return listing

    # Need to see what updates are made
    @listing.doc(description=f"listing_id must be provided")
    @listing.marshal_with(listing_details)
    def put(self, listing_id):
        logging.info(f"Updating listing {listing_id}")
        # get listing id
        content = get_request_json()
        listing = ListingModel.query.get_or_404(listing_id)
        # update the listing data
        listing.listing_name = content["listing_name"]
        listing.address = content["address"]
        listing.category = content["category"]
        listing.description = content["description"]
        listing.user_id = current_user.user_id
        listing.username = current_user.username
        flag_modified(listing, "description")
        db.session.merge(listing)
        db.session.flush()
        db.session.commit()
        return listing


@listing.route("")
@listing.param("search_query", "Keyword resource search")
class ListingList(Resource):
    @listing.doc(description=f"Creates a new listing")
    @listing.expect(listing_details)
    @listing.marshal_with(listing_details)
    def post(self):
        logging.info("Registering a listing")
        content = get_request_json()
        try:
            # Receive contents from request
            logging.info(content)
            listing_name = content["listing_name"]
            address = content["address"]
            description = content["description"]
            category = content["category"]
            v = ListingModel(
                listing_name=listing_name,
                address=address,
                description=description,
                category=category,
                user_id=current_user.user_id,
                username=current_user.username,
            )
            db.session.add(v)
            db.session.commit()
            listing_id = v.listing_id
            logging.info(f"listing_id created: {listing_id}")
            return ListingModel.query.get_or_404(listing_id).to_dict()

        except Exception as e:
            logging.error(e)
            api.api.abort(500, f"{e}")

    @listing.doc(description=f"Returns a listing by search")
    @listing.expect(listing_details)
    def get(self):
        keyword = request.args.get("search_query")
        logging.info(f"Searching for {keyword}")
        search_return = ListingModel.query.filter(
            or_(
                ListingModel.listing_name.ilike(f"%{keyword}%"),
                ListingModel.description.ilike(f"%{keyword}%"),
                ListingModel.address.ilike(f"%{keyword}%"),
            )
        ).limit(RESULT_LIMIT)
        search_listings = [l.to_dict() for l in search_return]
        return {"listings": search_listings}


# TODO: Paginate this and add docs
@listing.route("/mylistings")
class MyListings(Resource):
    @listing.doc(description=f"Fetch my listings")
    def get(self):
        my_listings = ListingModel.query.filter_by(user_id=current_user.user_id).limit(
            RESULT_LIMIT
        )
        my_listings = [l.to_dict() for l in my_listings]
        return {"mylistings": my_listings}
