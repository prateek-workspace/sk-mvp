def get_dashboard_data(role: str):
    """
    Return dummy dashboard data based on role.
    Replace these with real DB queries when ready.
    """
    if role == "student":
        return {
            "role": role,
            "dashboard": {
                "attended_classes": 18,
                "assignments_pending": 3,
                "tests_completed": 5,
                "grade": "A-"
            }
        }
    elif role == "coaching":
        return {
            "role": role,
            "dashboard": {
                "total_students": 120,
                "faculty_count": 8,
                "active_courses": 5,
                "monthly_earnings": 18500,
            }
        }
    elif role == "pg":
        return {
            "role": role,
            "dashboard": {
                "total_beds": 20,
                "occupied": 17,
                "available": 3,
                "monthly_income": 23000,
            }
        }
    elif role == "library":
        return {
            "role": role,
            "dashboard": {
                "total_seats": 50,
                "occupied": 35,
                "active_memberships": 120,
                "total_earnings": 15000,
            }
        }
    elif role == "tiffin":
        return {
            "role": role,
            "dashboard": {
                "meals_served_today": 60,
                "monthly_orders": 890,
                "avg_rating": 4.6,
                "active_subscribers": 45,
            }
        }
    else:
        return {"role": role, "dashboard": {}}
