import os

import requests

API_URL = os.environ["API_URL"]


def register_user(user: dict) -> int:
    url = f"{API_URL}/users"
    response = requests.post(url, json=user)
    actual = response.json()
    expected = {
        "email": user["email"],
        "username": user["username"],
    }
    assert actual["email"] == expected["email"]
    assert actual["username"] == expected["username"]
    return actual["user_id"]


def login_user(user: dict):
    # Login first
    login_response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "username": user["username"],
            "password": user["password"],
        },
    )
    assert login_response.status_code == 200
    token = login_response.json()["accessToken"]
    return token


def create_listing(listing: dict, token: str) -> int:
    # Create a listing
    url = f"{API_URL}/listings"
    create_listing_response = requests.post(
        url,
        json=listing,
        headers={
            "Authorization": f"JWT {token}",
        },
    )
    assert create_listing_response.status_code == 200
    listing_id = create_listing_response.json()["listing_id"]
    return listing_id


def create_availability(availability: dict, listing_id: int, token: str) -> int:
    create_availability_payload = {**availability, "listing_id": listing_id}
    url = f"{API_URL}/availabilities"
    create_availability_response = requests.post(
        url,
        json=create_availability_payload,
        headers={
            "Authorization": f"JWT {token}",
        },
    )
    actual = create_availability_response.json()
    assert actual["listing_id"] == listing_id
    assert actual["start_time"] == create_availability_payload["start_time"]
    assert actual["end_time"] == create_availability_payload["end_time"]
    availability_id = actual["availability_id"]
    return availability_id


def create_booking(
    user_id: int, listing_id: int, availability_id: int, token: str
) -> int:
    create_booking_payload = {
        "user_id": user_id,
        "listing_id": listing_id,
        "availability_id": availability_id,
    }
    url = f"{API_URL}/bookings"
    create_booking_response = requests.post(
        url,
        json=create_booking_payload,
        headers={
            "Authorization": f"JWT {token}",
        },
    )
    actual = create_booking_response.json()
    assert actual["user_id"] == create_booking_payload["user_id"]
    assert actual["listing_id"] == create_booking_payload["listing_id"]
    assert actual["availability_id"] == create_booking_payload["availability_id"]
    booking_id = actual["booking_id"]
    return booking_id