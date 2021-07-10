import json
import logging
from datetime import datetime, timezone
from api import db
from api.resources.availability import AvailabilityModel
from api.utils.req_handling import *
from flask_login import current_user
from flask_restplus import Resource, fields
from sqlalchemy.orm.attributes import flag_modified
import api


booking = api.api.namespace("bookings", description="booking operations")

booking_details = api.api.model(
    "booking",
    {
        "booking_id": fields.Integer(
            required=True, description="The ID of the booking"
        ),
        "user_id": fields.Integer(
            required=True, description="The user_id who owns the booking"
        ),
        "listing_id": fields.Integer(
            required=True, description="The listing_id that the booking is for"
        ),
        "availability_id": fields.Integer(
            required=True,
            description="The availability_id linked to the availabilities table",
        ),
    },
)


class BookingModel(db.Model):
    __tablename__ = "bookings"
    booking_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    listing_id = db.Column(
        db.Integer, db.ForeignKey("listings.listing_id"), nullable=False
    )
    availability_id = db.Column(
        db.Integer, db.ForeignKey("availabilities.availability_id"), nullable=False
    )

    def __repr__(self):
        return json.dumps(self.to_dict())

    def to_dict(self):
        data = {
            "booking_id": self.booking_id,
            "user_id": self.user_id,
            "listing_id": self.listing_id,
            "availability_id": self.availability_id,
        }
        return data


# See example: https://github.com/noirbizarre/flask-restplus/blob/master/examples/todo.py
@booking.route("/<int:booking_id>")
@booking.param("booking_id", "The booking identifier")
@booking.response(404, "booking not found")
class Booking(Resource):
    @booking.doc(description=f"booking_id must be provided")
    @booking.marshal_with(booking_details)
    def get(self, booking_id):
        logging.info(f"Getting booking {booking_id}")
        return BookingModel.query.get_or_404(booking_id).to_dict()

    # TODO(Harris/Saksham): Update & Delete
    # @booking.doc(description=f"booking_id must be provided")
    # @booking.marshal_with(booking_details)
    # def delete(self, booking_id):
    #     logging.info(f"Deleting booking {booking_id}")
    #     b = BookingModel.query.filter(BookingModel.booking_id == booking_id)
    #     b.delete()
    #     db.session.commit()
    #     return b

    @booking.doc(description=f"booking_id must be provided")
    @booking.marshal_with(booking_details)
    def put(self, booking_id):
        logging.info(f"Updating booking {booking_id}")
        # get booking id
        content = get_request_json()
        try:
            new_time = AvailabilityModel.query.get_or_404(
                content["availability_id"]
            ).to_dict()

            new_time_month = datetime.fromtimestamp(new_time["start_time"]).strftime(
                "%m"
            )
            b = BookingModel.query.get_or_404(booking_id).to_dict()
            old_time = AvailabilityModel.query.get_or_404(
                b["availability_id"]
            ).to_dict()
            current_unixtime = datetime.now().strftime("%s")
            # No updated booking is allowed if the difference between now and start date is less than 3 days
            if (
                (float(old_time["start_time"]) - float(current_unixtime))
                / (60 * 60 * 24)
            ) < 3.0:
                raise Exception(
                    "Cannot make an updated booking less than 3 days after the start date of the existing booking"
                )
            # New booking cannot allow a user more than 10 hours in a month - note that this is based on the consumer
            list_bookings = BookingModel.query.filter_by(
                user_id=current_user.user_id
            ).all()
            list_bookings = [l.to_dict() for l in list_bookings]
            hours_booked = 0

            ##Search through the existing bookings
            for i in range(len(list_bookings)):
                timeslot = AvailabilityModel.query.get_or_404(
                    list_bookings[i]["availability_id"]
                ).to_dict()
                if (
                    datetime.fromtimestamp(timeslot["start_time"]).strftime("%m")
                    == new_time_month
                ):
                    get_interval = (
                        float(timeslot["end_time"]) - float(timeslot["start_time"])
                    ) / (60 * 60)
                    hours_booked += get_interval
            get_new_booking_interval = (
                float(new_time["end_time"]) - float(new_time["start_time"])
            ) / (60 * 60)
            if (hours_booked + get_new_booking_interval) > 10.0:
                raise Exception(
                    "Not allowed to have more than 10 hours in a calendar month"
                )
            b1 = BookingModel.query.get_or_404(booking_id)
            old_avail = AvailabilityModel.query.get_or_404(b["availability_id"])
            b1.user_id = content["user_id"]
            # update the booking data
            b1.listing_id = content["listing_id"]
            b1.availability_id = content["availability_id"]
            # Not only this, but we need to update the avaliability_id details as well
            flag_modified(b1, "availability_id")
            db.session.merge(b1)
            # Note - update the old avaliability such that it will go back to true
            old_avail.is_available = True
            flag_modified(old_avail, "is_available")
            db.session.merge(old_avail)
            db.session.flush()
            db.session.commit()
            return b1
        except Exception as e:
            logging.error(e)
            api.api.abort(500, f"{e}")


@booking.route("")
class BookingList(Resource):
    @booking.doc(description=f"Creates a new booking")
    @booking.expect(booking_details)
    @booking.marshal_with(booking_details)
    def post(self):
        content = get_request_json()
        try:
            # Receive contents from request
            logging.info(content)
            user_id = content["user_id"]
            listing_id = content["listing_id"]
            availability_id = content["availability_id"]

            # Check that the availability is still open
            a = AvailabilityModel.query.get_or_404(availability_id)
            if a is None:
                raise AvailabilityIdNotFound(availability_id)
            if not a.is_available:
                raise AvailabilityIdNotAvailable(availability_id)
            if current_user.user_id != user_id:
                raise ValueError(
                    "Token invalid, you can't request for a user that is not you!"
                )

            # The following steps must be atomic
            # 1. Make a booking
            b = BookingModel(
                user_id=user_id,
                listing_id=listing_id,
                availability_id=availability_id,
            )
            db.session.add(b)

            # 2. Mark the availability_id not available
            a.is_available = False
            db.session.add(a)

            # Commit changes to db
            db.session.commit()

            # Return the booking
            booking_id = b.booking_id
            return BookingModel.query.get_or_404(booking_id).to_dict()

        except Exception as e:
            logging.error(e)
            api.api.abort(500, f"{e}")


# TODO: Paginate this and add docs
@booking.route("/mybookings")
class MyBookings(Resource):
    @booking.doc(description=f"Fetch my bookings")
    def get(self):
        my_bookings = BookingModel.query.filter_by(user_id=current_user.user_id).all()
        my_bookings = [l.to_dict() for l in my_bookings]
        return {"mybookings": my_bookings}


# Exceptions
class AvailabilityIdNotFound(Exception):
    """
    Raised when availability_id is not found
    """

    def __init__(self, availability_id):
        self.message = f"availability_id {availability_id} not found"
        super().__init__(self.message)


class AvailabilityIdNotAvailable(Exception):
    """
    Raised when availability_id is not available
    """

    def __init__(self, availability_id):
        self.message = f"availability_id {availability_id} not available"
        super().__init__(self.message)
