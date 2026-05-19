from django.db import connection
from django.db.models import F

from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, CharField, Sum, Count
from django.db.models.functions import Cast
from django.contrib.auth.hashers import make_password
from django.template.loader import render_to_string
from django.conf import settings


from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from datetime import datetime
from decimal import Decimal

import io
from xhtml2pdf import pisa
import os
import json

from .models import *

from .serializers import *




def home(request):
    return HttpResponse("This is homepage")

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def perform_create(self, serializer):
        patient = Patient.objects.get(email=self.request.user.email)
        serializer.save(patient=patient)

    def get_object(self):
        staff_id = self.kwargs.get("staff_id")
        patient_id = self.kwargs.get("patient_id")
        appointment_date = self.kwargs.get("appointment_date")

        return Appointment.objects.get(
            staff_id=staff_id,
            patient_id=patient_id,
            appointment_date=appointment_date
        )


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)
        
        refresh = RefreshToken.for_user(user)

        staff_role = None

        try:
            staff = StaffDetails.objects.get(email=username)
            staff_role = staff.staff_role
        
        except StaffDetails.DoesNotExist:
            pass

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user.username,
            "staff_role": staff_role,
        })
    
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully"})
        
        except Exception:
            return Response({"error": "Invalid token"}, status=400)
        

def generate_patient_id():
    last_patient = Patient.objects.order_by("patient_id").last()

    if not last_patient:
        return "PT-000000"

    last_id = last_patient.patient_id  # e.g PT-000045
    number = int(last_id.split("-")[1])
    new_number = number + 1

    return f"PT-{new_number:06d}"


class SignUpView(APIView):

    permission_classes = [AllowAny]
    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        dob = request.data.get("date_of_birth")
        gender = request.data.get("gender")


        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)
        

        if User.objects.filter(username=email).exists():
            return Response({"error": "User already exists"}, status=400)
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        details = PatientDetails.objects.create(
            email=email,
            name_first=first_name,
            name_last=last_name,
            gender=gender,
            dob=dob
        )

        patient_id = generate_patient_id()

        patient = Patient.objects.create(
        patient_id=patient_id,
        email=details,
        )

        # 5. JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "User created successfully",
            "patient_id": patient_id,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)
    

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Staff, Doctor, DoctorQualification, DoctorSpecialization


@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_list(request):

    search = request.GET.get('search', '')
    specialization = request.GET.get('specialization', '')
    gender = request.GET.get('gender', '')

    doctors = DoctorDirectory.objects.all()

    # Name Search
    if search:
        doctors = doctors.filter(
            name_first__icontains=search
        ) | doctors.filter(
            name_last__icontains=search
        )

    # Gender Filter
    if gender:
        doctors = doctors.filter(
            gender__iexact=gender
        )

    results = []

    for doctor in doctors:

        # specialization filtering
        if specialization:

            found = False

            for s in doctor.specializations:
                if specialization.lower() in s.lower():
                    found = True
                    break

            if not found:
                continue
    
        results.append({
            "staff_id": doctor.staff_id,
            "name": f"{doctor.name_first} {doctor.name_last}",
            "gender": doctor.gender,
            "department": doctor.dept_name,
            "availability": doctor.availability,
            "qualifications": doctor.qualifications,
            "specializations": doctor.specializations,
        })

    return Response(results)


# Procedure Call

@api_view(['POST'])
@permission_classes([AllowAny])
def accept_appointment_api(request):

    staff_id = request.data.get("staff_id")
    patient_id = request.data.get("patient_id")
    date = request.data.get("date")
    time = request.data.get("time")

    with connection.cursor() as cursor:
        cursor.execute(
            """
            CALL accept_appointment(%s, %s, %s, %s)
            """,
            [staff_id, patient_id, date, time]
        )

    return Response({"message": "Appointment accepted"})

@api_view(['POST'])
@permission_classes([AllowAny])
def reject_appointment_api(request):

    staff_id = request.data.get("staff_id")
    patient_id = request.data.get("patient_id")
    date = request.data.get("date")

    with connection.cursor() as cursor:
        cursor.execute(
            """
            CALL reject_appointment(%s, %s, %s)
            """,
            [staff_id, patient_id, date]
        )

    return Response({"message": "Appointment rejected"})

# Views for Appointment Status

class AcceptedAppointmentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AcceptedAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_email = self.request.user.email

        staff = Staff.objects.get(email__email=user_email)

        return AcceptedAppointments.objects.filter(
            staff_id=staff.staff_id)
    

class PendingAppointmentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PendingAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_email = self.request.user.email

        staff = Staff.objects.get(email__email=user_email)

        return PendingAppointments.objects.filter(
            staff_id=staff.staff_id
        )


class RejectedAppointmentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RejectedAppointmentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_email = self.request.user.email

        staff = Staff.objects.get(email__email=user_email)

        return RejectedAppointments.objects.filter(
            staff_id=staff.staff_id
        )
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_search_api(request):

    query = request.GET.get("q", "")

    patients = PatientSearchView.objects.all()

    if query:
        patients = patients.filter(
            Q(name_first__icontains=query) |
            Q(name_last__icontains=query) |
            Q(email__icontains=query) |
            Q(phones__icontains=query)
        )

    data = list(patients.values(
        "patient_id",
        "email",
        "name_first",
        "name_last",
        "gender",
        "dob",
        "phones"
    ))

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def patient_record_api(request):

    patient_id = request.GET.get("patient_id")

    if not patient_id:
        return Response([])

    records = PatientRecordView.objects.filter(patient_id=patient_id)

    data = list(records.values(
        "record_id",
        "patient_id",
        "name_first",
        "name_last",
        "email",
        "gender",
        "dob",
        "phones",
        "treatment_plan",
        "prescription",
        "procedure_done",
        "visit_date",
        "next_appointment",
        "total_amount",
        "amount_paid",
        "staff_id",
        "clinical_notes"
    ))

    return Response(data)

@api_view(["POST"])
@permission_classes([AllowAny])
def add_patient_record_api(request):

    data = request.data

    staff = Staff.objects.get(email=request.user.email)

    print("🔥 REQUEST DATA:", request.data)

    with connection.cursor() as cursor:
        cursor.execute(
                """
                CALL add_patient_record(
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                [
                    data["patient_id"],
                    staff.staff_id,
                    data.get("treatment_plan"),
                    data.get("prescription"),
                    data.get("procedure_done"),
                    data.get("visit_date"),
                    data.get("next_appointment") or None,
                    data.get("total_amount"),
                    data.get("amount_paid"),
                    data.get("clinical_notes", [])
                ]
            )

    return Response({"message": "Record created successfully"})


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_patient_record_api(request):

    data = request.data

    with connection.cursor() as cursor:
        cursor.execute(
            """
            CALL update_patient_record(
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            [
                data["record_id"],
                data.get("treatment_plan"),
                data.get("prescription"),
                data.get("procedure_done"),
                data.get("visit_date"),
                data.get("next_appointment"),
                data.get("total_amount"),
                data.get("amount_paid"),
                data.get("clinical_notes", [])
            ]
        )

    return Response({"message": "Record updated successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
def add_clinical_note_api(request):

    data = request.data

    with connection.cursor() as cursor:
        cursor.callproc(
            "add_clinical_note",
            [
                data["record_id"],
                data["note"]
            ]
        )

    return Response({"message": "Note added"})

@api_view(["GET"])
@permission_classes([AllowAny])
def search_patient_records_api(request):

    patient_id = request.GET.get("patient_id")
    search = request.GET.get("search", "")

    with connection.cursor() as cursor:

        cursor.execute(
            """
            SELECT * FROM search_patient_records_by_date(%s, %s)
            
            """,
            [patient_id, search]
        )

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    data = [
        dict(zip(columns, row))
        for row in rows
    ]

    return Response(data)


class StaffSalaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VStaffSalarySerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        view_type = self.request.query_params.get("view", "monthly")

        if view_type == "yearly":
            return VStaffSalaryYearlySerializer

        return VStaffSalarySerializer

    def get_queryset(self):
        user_email = self.request.user.email
        staff = Staff.objects.get(email__email=user_email)

        view_type = self.request.query_params.get("view", "monthly")

        if view_type == "yearly":
            return VStaffSalaryYearly.objects.filter(
                staff_id=staff.staff_id
            ).order_by("-year")

        return VStaffSalary.objects.filter(
            staff_id=staff.staff_id
        ).order_by("-payment_date")
    

class StaffSalarySummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        staff = Staff.objects.get(email__email=request.user.email)

        data = VStaffSalarySummary.objects.filter(
            staff_id=staff.staff_id
        ).first()

        serializer = VStaffSalarySummarySerializer(data, context={"request": request})
        return Response(serializer.data)
    
class PatientAppointmentsViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = VPatientAppointmentsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        patient = Patient.objects.get(email__email=self.request.user.email)
        queryset = VPatientAppointments.objects.filter(patient_id=patient.patient_id)

        # FILTERING
        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by("-appointment_date")
    
class CancelAppointmentView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        patient = Patient.objects.get(email__email=request.user.email)

        staff_id = request.data.get("staff_id")
        appointment_date = request.data.get("appointment_date")

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT cancel_pending_appointment(%s, %s, %s)
                """,
                [
                    staff_id,
                    patient.patient_id,
                    appointment_date
                ]
            )

        return Response(
            {"message": "Appointment cancelled successfully"},
            status=status.HTTP_200_OK
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_staff_info(request):

    try:
        email = request.user.email

        manager = ManagementFullDetailsView.objects.filter(
            email=email
        ).first()

        if manager:
            return Response({
                "staff_id": manager.staff_id,
                "full_name": manager.full_name,
                "email": manager.email,
                "staff_role": "management",
                "clearance_level": manager.clearance_level,
            })

        nurse = NurseFullDetailsView.objects.filter(
            email=email
        ).first()

        if nurse:
            return Response({
                "staff_id": nurse.staff_id,
                "full_name": nurse.full_name,
                "email": nurse.email,
                "staff_role": "nurse",
            })

        doctor = DoctorFullDetailsView.objects.filter(
            email=email
        ).first()

        if doctor:
            return Response({
                "staff_id": doctor.staff_id,
                "full_name": doctor.full_name,
                "email": doctor.email,
                "staff_role": "doctor",
            })
        
        patient = PatientRecordView.objects.filter(email=email).first() 
        if patient:
            return Response({
                "staff_id": patient.patient_id, # Using patient_id fallback mapping
                "full_name": getattr(patient, 'patient_name', 'Patient Account'),
                "email": patient.email,
                "staff_role": "patient",
            })

        return Response(
            {"error": "Staff not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def my_patient_records(request):
    email = request.user.email
    date = request.GET.get("date")

    query = """
        SELECT *
        FROM patient_record_view
        WHERE email = %s
    """

    params = [email]

    if date:
        query += " AND visit_date = %s"
        params.append(date)

    query += " ORDER BY visit_date DESC"

    with connection.cursor() as cursor:
        cursor.execute(query, params)

        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return Response(rows)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_doctor_profile(request):

    email = request.user.email

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
                s.staff_id,
                sd.email,
                sd.name_first,
                sd.name_last,
                sd.dob,
                sd.gender,
                sd.address,
                sd.acc_status,
                sd.staff_role,
                sd.dept_id,
                sd.date_joined
            FROM staff s
            JOIN staff_details sd
                ON s.email = sd.email
            WHERE sd.email = %s
        """, [email])

        row = cursor.fetchone()

    if not row:
        return Response(
            {"error": "Doctor not found"},
            status=404
        )

    return Response({
        "staff_id": row[0],
        "email": row[1],
        "name_first": row[2],
        "name_last": row[3],
        "dob": row[4],
        "gender": row[5],
        "address": row[6],
        "acc_status": row[7],
        "staff_role": row[8],
        "dept_id": row[9],
        "date_joined": row[10],
    })

@api_view(["PUT"])
@permission_classes([AllowAny])
def update_doctor_profile_api(request):

    email = request.user.email
    data = request.data

    try:

        with connection.cursor() as cursor:

            # Fetch current values
            cursor.execute("""
                SELECT
                    s.staff_id,
                    sd.name_first,
                    sd.name_last,
                    sd.dob,
                    sd.gender,
                    sd.address,
                    d.availability
                FROM staff_details sd
                JOIN staff s
                    ON s.email = sd.email
                JOIN doctor d
                    ON d.staff_id = s.staff_id
                WHERE sd.email = %s
            """, [email])

            current = cursor.fetchone()

            if not current:
                return Response(
                    {"error": "Doctor not found"},
                    status=404
                )

            # Call procedure
            cursor.execute("""
                CALL update_doctor_profile(
                    %s, %s, %s, %s, %s, %s, %s
                )
            """, [

                current[0],  # staff_id

                data.get("name_first") or current[1],
                data.get("name_last") or current[2],
                data.get("dob") or current[3],
                data.get("gender") or current[4],
                data.get("address") or current[5],

                data.get("availability")
                if data.get("availability") is not None
                else current[6]

            ])

        return Response({
            "message": "Doctor profile updated successfully"
        })

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=400
        )

@api_view(["GET"])
@permission_classes([AllowAny])
def get_patient_profile(request):

    email = request.user.email

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT
                p.patient_id,
                pd.email,
                pd.name_first,
                pd.name_last,
                pd.dob,
                pd.gender,
                pd.address,
                pd.marital_status,
                pd.has_diabetes,
                pd.has_hypertension,
                pd.has_allergies,
                au.password
            FROM patient_details pd
            JOIN patient p
                ON p.email = pd.email
            LEFT JOIN auth_user au
                ON au.email = pd.email
            WHERE pd.email = %s
        """, [email])

        row = cursor.fetchone()

    if not row:
        return Response(
            {"error": "Patient not found"},
            status=404
        )

    return Response({
        "patient_id": row[0],
        "email": row[1],
        "name_first": row[2],
        "name_last": row[3],
        "dob": row[4],
        "gender": row[5],
        "address": row[6],
        "marital_status": row[7],
        "has_diabetes": row[8],
        "has_hypertension": row[9],
        "has_allergies": row[10],
        "password": row[11],
    })


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_patient_profile_api(request):
    email = request.user.email
    data = request.data

    try:
        with connection.cursor() as cursor:
            # 1. Fetch current details to fill gaps
            cursor.execute("SELECT name_first, name_last, dob, gender, address, marital_status, has_diabetes, has_hypertension, has_allergies FROM patient_details WHERE email = %s", [email])
            current = cursor.fetchone()

            # 2. Get the password from request
            password = data.get("acc_password") # Frontend uses acc_password
            
            # 3. Handle Password hashing correctly
            hashed_password = None
            if password and password.strip() != "":
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                hashed_password = user.password # This is the PBKDF2 hash
            else:
                # Get existing hashed password if not changing
                user = User.objects.get(email=email)
                hashed_password = user.password

            # 4. Update Procedure Call - PASS THE HASHED PASSWORD
            cursor.execute("""
                CALL update_patient_profile(
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, [
                email,
                data.get("name_first") or current[0],
                data.get("name_last") or current[1],
                hashed_password, # Pass hashed pwd to procedure
                data.get("dob") or current[2],
                data.get("gender") or current[3],
                data.get("address") or current[4],
                data.get("marital_status") or current[5],
                data.get("has_diabetes") if data.get("has_diabetes") is not None else current[6],
                data.get("has_hypertension") if data.get("has_hypertension") is not None else current[7],
                data.get("has_allergies") if data.get("has_allergies") is not None else current[8],
            ])

        return Response({"message": "Profile updated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def get_management_profile(request):
    email = request.user.email

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                s.staff_id,
                sd.email,
                sd.name_first,
                sd.name_last,
                sd.dob,
                sd.gender,
                sd.address,
                sd.acc_status,
                sd.staff_role,
                sd.dept_id,
                sd.date_joined,
                a.clearance_level,
                a.budget_authority,
                a.budget_used
            FROM staff s
            JOIN staff_details sd ON s.email = sd.email
            LEFT JOIN administrative a ON s.staff_id = a.staff_id
            WHERE sd.email = %s AND sd.staff_role = 'management'
        """, [email])
        
        row = cursor.fetchone()

    if not row:
        return Response({"error": "Management staff record not found"}, status=404)

    return Response({
        "staff_id": row[0],
        "email": row[1],
        "name_first": row[2],
        "name_last": row[3],
        "dob": str(row[4]) if row[4] else "",
        "gender": row[5],
        "address": row[6],
        "acc_status": row[7],
        "staff_role": row[8],
        "dept_id": row[9],
        "date_joined": str(row[10]) if row[10] else "",
        "clearance_level": row[11],
        "budget_authority": float(row[12]) if row[12] else 0.0,
        "budget_used": float(row[13]) if row[13] else 0.0,
    })


@api_view(["PUT"])
@permission_classes([AllowAny])
def update_management_profile_api(request):
    email = request.user.email
    data = request.data

    try:
        with connection.cursor() as cursor:
            # 1. Fetch current profile data to protect unsubmitted parameters
            cursor.execute("""
                SELECT name_first, name_last, dob, gender, address, acc_status, acc_password 
                FROM staff_details 
                WHERE email = %s AND staff_role = 'management'
            """, [email])
            current = cursor.fetchone()

            if not current:
                return Response({"error": "Management staff record not found"}, status=404)

            # 2. Synchronize Authentication State
            new_password = data.get("acc_password")
            password_for_staff_table = current[6]

            if new_password and new_password.strip() != "":
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                password_for_staff_table = new_password

            # 3. Call PostgreSQL Stored Procedure
            cursor.execute("""
                CALL update_management_profile(
                    %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, [
                email,
                data.get("name_first") or current[0],
                data.get("name_last") or current[1],
                password_for_staff_table,
                data.get("dob") or current[2],
                data.get("gender") or current[3],
                data.get("address") or current[4],
                data.get("acc_status") or current[5]
            ])

        return Response({"message": "Management profile updated safely. Administrative metrics unchanged."})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_patient_billing(request):

    try:

        # SEARCH PARAM
        search = request.GET.get("search", "").strip()

        # GET CURRENT LOGGED IN PATIENT
        patient = Patient.objects.get(email=request.user.email)

        # FILTER ONLY THIS PATIENT'S BILLS
        bills = PatientBillingView.objects.filter(patient_id=patient.patient_id)

        # SEARCHING
        if search:

            bills = bills.annotate(
                date_str=Cast('visit_date', CharField())
            ).filter(
                Q(appointment_with__icontains=search) |
                Q(date_str__icontains=search)
            )

        # ORDERING
        bills = bills.order_by("-payment_date")

        serializer = PatientBillingViewSerializer(bills, many=True)

        return Response(serializer.data)

    except Patient.DoesNotExist:
        
        return Response(
            {"error": "Patient not found"},
            status=404
        )

    except Exception as e:
        print("BILLING ERROR:", str(e))
        return Response(
            {"error": str(e)},
            status=400
        )
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_due_records(request):

    email = request.user.email

    search = request.GET.get("search", "").strip()

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT patient_id
            FROM patient
            WHERE email = %s
        """, [email])

        patient_row = cursor.fetchone()

    patient_id = patient_row[0]

    records = PatientDueRecord.objects.filter(patient_id=patient_id)

    # SEARCH BY VISIT DATE
    if search:
        records = records.filter(visit_date__icontains=search)

    serializer = PatientDueRecordSerializer(records, many=True)

    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_payment_summary(request):
    try:
        patient = Patient.objects.get(email=request.user.email)
        summary = PatientPaymentSummary.objects.get(patient_id=patient.patient_id)
        
        # We manually map the Supabase names to the React names here
        return Response({
            "total_paid": summary.total_amount_paid,
            "total_due": summary.total_amount_due
        })

    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=404)
    except PatientPaymentSummary.DoesNotExist:
        return Response({"total_paid": 0, "total_due": 0}) 
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def make_payment_api(request):

    try:

        record_id = request.data.get("record_id")
        amount = request.data.get("amount")

        with connection.cursor() as cursor:

            cursor.execute("""
                CALL make_payment(%s, %s, %s)
            """, [
                record_id,
                amount,
                "Online"
            ])

        return Response({
            "message": "Payment successful"
        })

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=400
        )
    
@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_list_manager(request):
    # 1. Get search parameters from React
    search = request.GET.get('search', '').strip()
    gender = request.GET.get('gender', '').strip()
    spec_query = request.GET.get('specialization', '').strip()
    qual_query = request.GET.get('qualification', '').strip()
    license_query = request.GET.get('license_number', '').strip()
    exp_query = request.GET.get('years_experience', '').strip()

    # 2. Start with the base QuerySet
    doctors = DoctorFullDetailsView.objects.all()

    # 3. Apply SQL-level filters (Case-insensitive)
    if search:
        doctors = doctors.filter(
            Q(full_name__icontains=search) |
            Q(staff_id__icontains=search) |
            Q(email__icontains=search)
        )

    if gender:
        doctors = doctors.filter(gender__iexact=gender)

    if spec_query:
        doctors = doctors.filter(specializations__icontains=spec_query)

    if qual_query:
        doctors = doctors.filter(qualifications__icontains=qual_query)

    # 🔥 ADDED: medical filters
    if license_query:
        doctors = doctors.filter(license_number__icontains=license_query)

    if exp_query:
        doctors = doctors.filter(years_experience__icontains=exp_query)

    # 4. Construct the JSON response
    results = []
    for d in doctors:
        results.append({
            "staff_id": d.staff_id,
            "email": d.email,
            "full_name": d.full_name,
            "gender": d.gender,
            "dept_id": d.dept_id,

            # existing arrays
            "phone_numbers": d.phone_numbers,
            "qualifications": d.qualifications,
            "specializations": d.specializations,

            # 🔥 ADDED medical fields
            "license_number": getattr(d, "license_number", None),
            "years_experience": getattr(d, "years_experience", None),
        })

    return Response(results)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_doctor(request):
    data = request.data
    email = data.get('email', '').strip()

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                "SELECT staff_id FROM public.staff WHERE staff_id LIKE 'ST-%%' ORDER BY staff_id DESC LIMIT 1"
            )
            last_id_row = cursor.fetchone()

            if last_id_row:
                last_id_str = last_id_row[0]
                last_id_int = int(last_id_str.split('-')[1])
                new_id_int = last_id_int + 1
            else:
                new_id_int = 1

            generated_staff_id = f"ST-{new_id_int:06d}"

            # 🔥 ADDED: MEDICAL INFO EXTRACT
            license_number = data.get('license_number')
            years_experience = data.get('years_experience')

            cursor.execute(
                "CALL public.add_doctor(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [
                    email,
                    data.get('first_name'),
                    data.get('last_name'),
                    data.get('password'),
                    data.get('gender'),
                    data.get('dept_id'),
                    generated_staff_id,
                    license_number,
                    years_experience,
                    data.get('phone_numbers', []),
                    data.get('qualifications', []),
                    data.get('specializations', []),
                ]
            )

        return Response(
            {"message": f"Doctor added successfully with ID: {generated_staff_id}"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_doctor(request, staff_id):

    data = request.data

    try:
        doctor = DoctorFullDetailsView.objects.get(staff_id=staff_id)

    except DoctorFullDetailsView.DoesNotExist:
        return Response(
            {"error": "Doctor not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        with connection.cursor() as cursor:

            name_parts = (doctor.full_name or "").split()
            default_first = name_parts[0] if name_parts else ""
            default_last = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            # 🔥 ADDED: MEDICAL INFO
            license_number = data.get('license_number', doctor.license_number)
            years_experience = data.get('years_experience', doctor.years_experience)

            cursor.execute(
                "CALL public.edit_doctor(%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [
                    staff_id,
                    data.get('first_name', default_first),
                    data.get('last_name', default_last),
                    data.get('gender', doctor.gender),
                    data.get('dept_id', doctor.dept_id),

                    license_number,
                    years_experience,

                    data.get('phone_numbers', doctor.phone_numbers),
                    data.get('qualifications', doctor.qualifications),
                    data.get('specializations', doctor.specializations),
                ]
            )

        return Response({"message": "Doctor updated successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_doctor(request, staff_id):
    try:
        with connection.cursor() as cursor:
            # We use cursor.execute instead of callproc for Procedures
            cursor.execute("CALL public.delete_doctor(%s)", [staff_id])

        return Response(
            {"message": "Doctor deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def nurse_list_manager(request):

    search = request.GET.get('search', '').strip()
    gender = request.GET.get('gender', '').strip()
    shift_query = request.GET.get('shift_type', '').strip()

    nurses = NurseFullDetailsView.objects.all()

    if search:
        nurses = nurses.filter(
            Q(full_name__icontains=search) |
            Q(staff_id__icontains=search) |
            Q(email__icontains=search)
        )

    if gender:
        nurses = nurses.filter(gender__iexact=gender)

    if shift_query:
        nurses = nurses.filter(shift_type__icontains=shift_query)

    results = []

    for n in nurses:
        results.append({
            "staff_id": n.staff_id,
            "email": n.email,
            "full_name": n.full_name,
            "gender": n.gender,
            "dept_id": n.dept_id,
            "acc_status": n.acc_status,
            "shift_type": n.shift_type,
            "phone_numbers": n.phone_numbers,
        })

    return Response(results)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_nurse(request):

    data = request.data
    email = data.get('email', '').strip()

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:

            # AUTO STAFF ID GENERATION
            cursor.execute("""
                SELECT staff_id
                FROM public.staff
                WHERE staff_id LIKE 'ST-%%'
                ORDER BY staff_id DESC
                LIMIT 1
            """)
            last_id_row = cursor.fetchone()

            if last_id_row:
                last_id_int = int(last_id_row[0].split('-')[1])
                new_id_int = last_id_int + 1
            else:
                new_id_int = 1

            generated_staff_id = f"ST-{new_id_int:06d}"

            cursor.execute(
                "CALL public.add_nurse(%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                [
                    email,
                    data.get('first_name'),
                    data.get('last_name'),
                    data.get('password'),
                    data.get('gender'),
                    data.get('dept_id'),
                    generated_staff_id,
                    data.get('shift_type'),
                    data.get('phone_numbers', [])
                ]
            )

        return Response(
            {"message": f"Nurse added successfully with ID: {generated_staff_id}"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_nurse(request, staff_id):

    data = request.data

    try:
        nurse = NurseFullDetailsView.objects.get(staff_id=staff_id)

    except NurseFullDetailsView.DoesNotExist:
        return Response(
            {"error": "Nurse not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        with connection.cursor() as cursor:

            name_parts = (nurse.full_name or "").split()
            default_first = name_parts[0] if name_parts else ""
            default_last = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            cursor.execute(
                "CALL public.edit_nurse(%s, %s, %s, %s, %s, %s, %s)",
                [
                    staff_id,
                    data.get('first_name', default_first),
                    data.get('last_name', default_last),
                    data.get('gender', nurse.gender),
                    data.get('dept_id', nurse.dept_id),
                    data.get('shift_type', nurse.shift_type),
                    data.get('phone_numbers', nurse.phone_numbers),
                ]
            )

        return Response({"message": "Nurse updated successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_nurse(request, staff_id):

    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL public.delete_nurse(%s)", [staff_id])

        return Response(
            {"message": "Nurse deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['GET'])
@permission_classes([AllowAny])
def management_list_manager(request):

    search = request.GET.get('search', '').strip()
    gender = request.GET.get('gender', '').strip()
    clearance_query = request.GET.get('clearance_level', '').strip()

    managers = ManagementFullDetailsView.objects.all()

    # ---------------- SEARCH FILTER ----------------
    if search:
        managers = managers.filter(
            Q(full_name__icontains=search) |
            Q(staff_id__icontains=search) |
            Q(email__icontains=search)
        )

    # ---------------- GENDER FILTER ----------------
    if gender:
        managers = managers.filter(gender__iexact=gender)

    # ---------------- CLEARANCE FILTER ----------------
    if clearance_query:
        managers = managers.filter(clearance_level__icontains=clearance_query)

    # ----------------- SORTING --------------------

    managers = managers.order_by('staff_id')
    # ---------------- RESPONSE ----------------
    results = []

    for m in managers:
        results.append({
            "staff_id": m.staff_id,
            "email": m.email,
            "full_name": m.full_name,
            "gender": m.gender,
            "dept_id": m.dept_id,
            "acc_status": m.acc_status,

            "clearance_level": m.clearance_level,
            "budget_authority": m.budget_authority,
            "budget_used": m.budget_used,

            "phone_numbers": m.phone_numbers,
        })

    return Response(results)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_manager(request):

    data = request.data
    email = data.get('email', '').strip()

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        with connection.cursor() as cursor:

            # ---------------- AUTO STAFF ID ----------------
            cursor.execute("""
                SELECT staff_id
                FROM public.staff
                WHERE staff_id LIKE 'ST-%%'
                ORDER BY staff_id DESC
                LIMIT 1
            """)

            last_id_row = cursor.fetchone()

            if last_id_row:
                last_id_int = int(
                    last_id_row[0].split('-')[1]
                )
                new_id_int = last_id_int + 1
            else:
                new_id_int = 1

            generated_staff_id = (
                f"ST-{new_id_int:06d}"
            )

            # ---------------- CALL PROCEDURE ----------------
            cursor.execute(
                """
                CALL public.add_manager(
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s
                )
                """,
                [
                    email,

                    data.get('first_name'),
                    data.get('last_name'),

                    data.get('password'),

                    data.get('gender'),
                    data.get('dept_id'),

                    generated_staff_id,

                    data.get('clearance_level'),

                    data.get('budget_authority'),

                    data.get('budget_used', 0),

                    data.get('phone_numbers', [])
                ]
            )

        return Response(
            {
                "message":
                f"Manager added successfully with ID: {generated_staff_id}"
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_manager(request, staff_id):

    data = request.data

    try:

        manager = ManagementFullDetailsView.objects.get(
            staff_id=staff_id
        )

    except ManagementFullDetailsView.DoesNotExist:

        return Response(
            {"error": "Manager not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:

        with connection.cursor() as cursor:

            name_parts = (
                manager.full_name or ""
            ).split()

            default_first = (
                name_parts[0]
                if name_parts else ""
            )

            default_last = (
                " ".join(name_parts[1:])
                if len(name_parts) > 1
                else ""
            )

            cursor.execute(
                """
                CALL public.edit_manager(
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                """,
                [
                    staff_id,

                    data.get(
                        'first_name',
                        default_first
                    ),

                    data.get(
                        'last_name',
                        default_last
                    ),

                    data.get(
                        'gender',
                        manager.gender
                    ),

                    data.get(
                        'dept_id',
                        manager.dept_id
                    ),

                    data.get(
                        'clearance_level',
                        manager.clearance_level
                    ),

                    data.get(
                        'budget_authority',
                        getattr(
                            manager,
                            'budget_authority',
                            0
                        )
                    ),

                    data.get(
                        'budget_used',
                        getattr(
                            manager,
                            'budget_used',
                            0
                        )
                    ),

                    data.get(
                        'phone_numbers',
                        manager.phone_numbers
                    ),
                ]
            )

        return Response(
            {
                "message":
                "Manager updated successfully"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_manager(request, staff_id):

    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL public.delete_manager(%s)", [staff_id])

        return Response(
            {"message": "Manager deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def patient_list_manager(request):

    search = request.GET.get('search', '').strip()
    gender = request.GET.get('gender', '').strip()
    marital_status = request.GET.get('marital_status', '').strip()

    patients = PatientFullDetailsView.objects.all()

    # ---------------- SEARCH FILTER ----------------
    if search:
        patients = patients.filter(
            Q(full_name__icontains=search) |
            Q(patient_id__icontains=search) |
            Q(email__icontains=search)
        )

    # ---------------- GENDER FILTER ----------------
    if gender:
        patients = patients.filter(gender__iexact=gender)

    # ---------------- MARITAL STATUS FILTER ----------------
    if marital_status:
        patients = patients.filter(
            marital_status__icontains=marital_status
        )

    # ---------------- SORTING ----------------
    patients = patients.order_by('patient_id')

    # ---------------- RESPONSE ----------------
    results = []

    for p in patients:
        results.append({
            "patient_id": p.patient_id,
            "email": p.email,
            "full_name": p.full_name,

            "gender": p.gender,
            "marital_status": p.marital_status,

            "address": p.address,

            "has_diabetes": p.has_diabetes,
            "has_hypertension": p.has_hypertension,
            "has_allergies": p.has_allergies,

            "dob": p.dob,

            "phone_numbers": p.phone_numbers,

            "created_at": p.created_at,
        })

    return Response(results)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_patient(request):

    data = request.data

    email = data.get('email', '').strip()

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        with connection.cursor() as cursor:

            # ---------------- AUTO PATIENT ID ----------------
            cursor.execute("""
                SELECT patient_id
                FROM public.patient
                WHERE patient_id LIKE 'PT-%%'
                ORDER BY patient_id DESC
                LIMIT 1
            """)

            last_id_row = cursor.fetchone()

            if last_id_row:
                last_id_int = int(last_id_row[0].split('-')[1])
                new_id_int = last_id_int + 1
            else:
                new_id_int = 1

            generated_patient_id = f"PT-{new_id_int:06d}"

            # ---------------- CALL PROCEDURE ----------------
            cursor.execute(
                """
                CALL public.add_patient(
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s
                )
                """,
                [
                    email,
                    make_password(data.get('password')),

                    data.get('first_name'),
                    data.get('last_name'),

                    data.get('gender'),
                    data.get('marital_status'),

                    data.get('address'),

                    data.get('has_diabetes'),
                    data.get('has_hypertension'),
                    data.get('has_allergies'),

                    data.get('dob'),

                    generated_patient_id,

                    data.get('phone_numbers', [])
                ]
            )

        return Response(
            {
                "message": f"Patient added successfully with ID: {generated_patient_id}"
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_patient(request, patient_id):

    data = request.data

    try:

        patient = PatientFullDetailsView.objects.get(
            patient_id=patient_id
        )

    except PatientFullDetailsView.DoesNotExist:

        return Response(
            {"error": "Patient not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:

        with connection.cursor() as cursor:

            name_parts = (patient.full_name or "").split()

            default_first = name_parts[0] if name_parts else ""

            default_last = (
                " ".join(name_parts[1:])
                if len(name_parts) > 1
                else ""
            )

            cursor.execute(
                """
                CALL public.edit_patient(
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s
                )
                """,
                [
                    patient_id,

                    data.get('first_name', default_first),
                    data.get('last_name', default_last),

                    data.get('gender', patient.gender),
                    data.get('marital_status', patient.marital_status),

                    data.get('address', patient.address),

                    data.get('has_diabetes', patient.has_diabetes),
                    data.get('has_hypertension', patient.has_hypertension),
                    data.get('has_allergies', patient.has_allergies),

                    data.get('dob', patient.dob),

                    data.get('phone_numbers', patient.phone_numbers),
                ]
            )

        return Response(
            {"message": "Patient updated successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        print("ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_patient(request, patient_id):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_patient(%s)",
                [patient_id]
            )

        return Response(
            {"message": "Patient deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        print("DATABASE ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_patient_record(request, record_id):

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_patient_record(%s)",
                [record_id]
            )

        return Response(
            {"message": "Patient record deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        print("DELETE RECORD ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def department_list(request):

    search = request.GET.get('search', '').strip()

    departments = DepartmentStaffSummary.objects.all()

    # ---------------- SEARCH FILTER ----------------
    if search:

        departments = departments.filter(
            Q(dept_id__icontains=search) |
            Q(dept_name__icontains=search)
        )

    # ---------------- SORTING ----------------
    departments = departments.order_by('dept_id')

    # ---------------- RESPONSE ----------------
    results = []

    for d in departments:

        results.append({
            "dept_id": d.dept_id,
            "dept_name": d.dept_name,
            "room_number": d.room_number,
            "total_staff": d.total_staff,
        })

    return Response(results)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_department(request):

    data = request.data

    try:

        with connection.cursor() as cursor:

            # ---------------- AUTO DEPARTMENT ID ----------------
            cursor.execute("""
                SELECT dept_id
                FROM public.department
                WHERE dept_id LIKE 'D-%%'
                ORDER BY dept_id DESC
                LIMIT 1
            """)

            last_id_row = cursor.fetchone()

            if last_id_row:

                last_id_int = int(
                    last_id_row[0].split('-')[1]
                )

                new_id_int = last_id_int + 1

            else:

                new_id_int = 101

            generated_department_id = (
                f"D-{new_id_int}"
            )

            # ---------------- CALL PROCEDURE ----------------
            cursor.execute(
                """
                CALL public.add_department(
                    %s,
                    %s,
                    %s
                )
                """,
                [
                    generated_department_id,
                    data.get('dept_name'),
                    data.get('room_number'),
                ]
            )

        return Response(
            {
                "message":
                f"Department added successfully with ID: {generated_department_id}"
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_department(request, dept_id):

    data = request.data

    try:

        department = Department.objects.get(
            dept_id=dept_id
        )

    except Department.DoesNotExist:

        return Response(
            {"error": "Department not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CALL public.update_department(
                    %s,
                    %s,
                    %s
                )
                """,
                [
                    dept_id,

                    data.get(
                        'dept_name',
                        department.dept_name
                    ),

                    data.get(
                        'room_number',
                        department.room_number
                    ),
                ]
            )

        return Response(
            {
                "message":
                "Department updated successfully"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_department(request, dept_id):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_department(%s)",
                [dept_id]
            )

        return Response(
            {
                "message":
                "Department deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_list(request):

    search = request.GET.get('search', '').strip()
    suppliers = SupplierFullDetailsView.objects.all()

    # SEARCH FILTER

    if search:

        suppliers = suppliers.filter(

            Q(company_name__icontains=search) |
            Q(contact_person__icontains=search) |
            Q(email__icontains=search) |
            Q(supplier_id__icontains=search)

        )

    suppliers = suppliers.order_by('supplier_id')

    serializer = SupplierFullDetailsSerializer(
        suppliers,
        many=True
    )

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_supplier(request):

    data = request.data

    try:

        with connection.cursor() as cursor:

            cursor.execute("""
                    SELECT supplier_id
                    FROM public.supplier
                    WHERE supplier_id LIKE 'SUP-%%'
                    ORDER BY supplier_id DESC
                    LIMIT 1
            """)

            last_id_row = cursor.fetchone()

            if last_id_row:

                last_id_int = int(
                    last_id_row[0].split('-')[1]
                )

                new_id_int = last_id_int + 1

            else:

                new_id_int = 1

            generated_supplier_id = f"SUP-{new_id_int:06d}"

            print(generated_supplier_id)

            cursor.execute(
                """
                CALL public.add_supplier(
                    %s, %s, %s, %s, %s, %s
                )
                """,
                [
                    generated_supplier_id,
                    data.get('contact_person'),
                    data.get('email'),
                    data.get('company_name'),
                    data.get('phone'),
                    data.get('address'),
                ]
            )

        return Response(
            {
                "message":
                f"Supplier added successfully with ID: {generated_supplier_id}"
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_supplier(request, supplier_id):

    data = request.data

    try:

        supplier = SupplierFullDetailsView.objects.get(
            supplier_id=supplier_id
        )

    except SupplierFullDetailsView.DoesNotExist:

        return Response(
            {"error": "Supplier not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CALL public.edit_supplier(
                    %s, %s, %s, %s, %s
                )
                """,
                [
                    supplier_id,

                    data.get(
                        'contact_person',
                        supplier.contact_person
                    ),

                    data.get(
                        'company_name',
                        supplier.company_name
                    ),

                    data.get(
                        'phone',
                        supplier.phone
                    ),

                    data.get(
                        'address',
                        supplier.address
                    ),
                ]
            )

        return Response(
            {"message": "Supplier updated successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_supplier(request, supplier_id):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_supplier(%s)",
                [supplier_id]
            )

        return Response(
            {"message": "Supplier deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_budget_summary(request):
    data = CompanyBudgetSummary.objects.first()
    serializer = CompanyBudgetSummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def administrative_budget_list(request):

    try:
        email = request.user.email

        # get staff_id from staff table
        staff = Staff.objects.get(email=email)

        data = AdministrativeBudgetView.objects.filter(
            staff_id=staff.staff_id
        ).first()

        if not data:
            return Response(
                {"error": "Budget data not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdministrativeBudgetSerializer(data)

        return Response(serializer.data)

    except Staff.DoesNotExist:
        return Response(
            {"error": "Staff record not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_list(request):
    search = request.GET.get('search', '').strip()
    category = request.GET.get('category', '').strip()

    inventories = Inventory.objects.all()

    if category:
        inventories = inventories.filter(category__icontains=category)

    # BROAD SEARCH
    if search:
        matching_supplier_ids = SupplierDropdownView.objects.filter(
            company_name__icontains=search
        ).values_list('supplier_id', flat=True)

        inventories = inventories.annotate(
            item_id_str=Cast('item_id', CharField()),
            supplier_id_str=Cast('supplier_id', CharField())
        ).filter(
            Q(item_id_str__icontains=search) |
            Q(item_name__icontains=search) |
            Q(supplier_id_str__icontains=search) |
            Q(supplier_id__in=list(matching_supplier_ids)) 
        )
    
    # Order layout records clean
    inventories = inventories.order_by('item_id')
    
    # Serialize data sets
    serializer = InventorySerializer(inventories, many=True)
    inventory_data = serializer.data

    # Map the supplier company names for frontend rendering
    supplier_map = {
        s.supplier_id: s.company_name 
        for s in SupplierDropdownView.objects.all()
    }

    for item in inventory_data:
        s_id = item.get('supplier_id')
        item['company_name'] = supplier_map.get(s_id, "N/A")

    return Response(inventory_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_dropdown_list(request):

    suppliers = SupplierDropdownView.objects.all(
    ).order_by('supplier_id')

    serializer = SupplierDropdownSerializer(
        suppliers,
        many=True
    )

    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_inventory(request):

    data = request.data

    try:
        email = request.user.email
        staff = Staff.objects.get(email=email)

        with connection.cursor() as cursor:

            # AUTO ITEM ID
            cursor.execute("""
                SELECT item_id
                FROM public."Inventory"
                WHERE item_id LIKE 'INV-%'
                ORDER BY item_id DESC
                LIMIT 1
            """)

            last_id_row = cursor.fetchone()

            if last_id_row:

                last_id_int = int(last_id_row[0].split('-')[1])
                new_id_int = last_id_int + 1
            else:
                new_id_int = 1

            generated_item_id = (
                f"INV-{new_id_int:06d}"
            )

            # CALL PROCEDURE
            cursor.execute(
                """
                CALL public.add_inventory(
                    %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                """,
                [
                    generated_item_id,
                    data.get('item_name'),
                    data.get('category'),
                    data.get('quantity'),
                    data.get('unit'),
                    data.get('unit_price'),
                    data.get('supplier_id'),
                    staff.staff_id
                ]
            )

        return Response(
            {"message":
                f"Inventory added successfully with ID: {generated_item_id}"
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_inventory(request, item_id):

    data = request.data

    try:

        email = request.user.email
        staff = Staff.objects.get(email=email)

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CALL public.edit_inventory(
                    %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                """,
                [
                    item_id,
                    data.get('item_name'),
                    data.get('category'),
                    data.get('quantity'),
                    data.get('unit'),
                    data.get('unit_price'),
                    data.get('supplier_id'),
                    staff.staff_id
                ]
            )

        return Response(
            {
                "message":
                "Inventory updated successfully"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_inventory(request, item_id):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CALL public.delete_inventory(%s)
                """,
                [item_id]
            )

        return Response(
            {
                "message":
                "Inventory deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_list(request):
    search = request.GET.get('search', '').strip()
    data = PatientBillingView.objects.all()

    if search:
        data = data.annotate(
            patient_id_str=Cast('patient_id', CharField()),
        ).filter(
            Q(patient_id_str__icontains=search) |
            Q(appointment_with__icontains=search) |
            Q(payment_method__icontains=search)
        )

    data = data.order_by('-payment_date')
    serializer = PatientBillingViewSerializer(data, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_list(request):

    search = request.GET.get('search', '').strip()

    data = VStaffSalary.objects.all()

    if search:
        data = data.filter(
            Q(staff_id__icontains=search) |
            Q(full_name__icontains=search) |
            Q(payment_date__icontains=search)
        )

    data = data.order_by('-payment_date')

    serializer = VStaffSalarySerializer(data, many=True)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_summary(request):

    data = BillingSummaryView.objects.first()

    serializer = BillingSummarySerializer(data)

    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_summary(request):
    data = SalarySummaryView.objects.first()

    # Safety Fallback: If the view returns nothing, provide an empty dictionary
    if not data:
        return Response({
            "total_salary_paid": 0.00,
            "total_salary_transactions": 0
        })

    serializer = SalarySummarySerializer(data)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_bill(request):

    data = request.data

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                CALL public.add_bill(
                    %s, %s, %s, %s
                )
                """,
                [
                    data.get('amount_paid'),
                    data.get('payment_date'),
                    data.get('payment_method'),
                    data.get('record_id')
                ]
            )

        return Response(
            {"message": "Bill added successfully"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_bill(request, bill_id):
    data = request.data

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CALL public.edit_bill(
                    %s, %s, %s, %s
                )
                """,
                [
                    bill_id,                     # 1. p_bill_id (int)
                    data.get('amount_paid'),     # 2. p_amount_paid (numeric)
                    data.get('payment_date'),    # 3. p_payment_date (date)
                    data.get('payment_method')   # 4. p_payment_method (varchar)
                ]
            )

        return Response(
            {"message": "Bill updated successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        error_message = str(e).split('CONTEXT:')[0].replace('exception:', '').strip()

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_bill(request, bill_id):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_bill(%s)",
                [bill_id]
            )

        return Response(
            {"message": "Bill deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_salary(request):
    data = request.data
    try:
        # Fallback empty fields or missing payloads to 0.00 safely
        clean_amount = data.get('amount') if data.get('amount') not in [None, ''] else 0.00
        clean_bonus = data.get('bonus') if data.get('bonus') not in [None, ''] else 0.00
        clean_deduction = data.get('deduction') if data.get('deduction') not in [None, ''] else 0.00

        with connection.cursor() as cursor:
            cursor.execute(
                """
                CALL public.add_salary(
                    %s, %s, %s, %s, %s
                )
                """,
                [
                    data.get('staff_id'),
                    data.get('payment_date'),
                    clean_amount,
                    clean_bonus,
                    clean_deduction
                ]
            )

        return Response(
            {"message": "Salary added successfully"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_salary(request, staff_id, payment_date):
    data = request.data
    try:
        # Fallback empty fields to 0.00 safely
        clean_amount = data.get('amount') if data.get('amount') not in [None, ''] else 0.00
        clean_bonus = data.get('bonus') if data.get('bonus') not in [None, ''] else 0.00
        clean_deduction = data.get('deduction') if data.get('deduction') not in [None, ''] else 0.00

        with connection.cursor() as cursor:
            cursor.execute(
                """
                CALL public.edit_salary(
                    %s::character varying, 
                    %s::date, 
                    %s::numeric, 
                    %s::numeric, 
                    %s::numeric
                )
                """,
                [
                    str(staff_id),
                    str(payment_date), 
                    clean_amount,      
                    clean_bonus,       
                    clean_deduction    
                ]
            )

        return Response({"message": "Salary updated successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_salary(request, staff_id, payment_date):

    try:

        with connection.cursor() as cursor:

            cursor.execute(
                "CALL public.delete_salary(%s, %s)",
                [
                    staff_id,
                    payment_date
                ]
            )

        return Response(
            {"message": "Salary deleted successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:

        error_message = str(e).split('.')[0]

        return Response(
            {"error": error_message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_dropdown(request):

    data = VStaffSalary.objects.all().order_by('staff_id')

    results = []

    for s in data:

        results.append({
            "staff_id": s.staff_id,
            "label": f"{s.staff_id} - {s.full_name}"
        })

    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_record_dropdown(request):
    # Fetch all records ordered by record_id descending
    data = PatientRecordView.objects.all().order_by('-record_id')

    results = []
    for r in data:
        # 1. Combine first and last names safely
        first = r.name_first or ""
        last = r.name_last or ""
        full_name = f"{first} {last}".strip() or "Unknown Patient"


        amount = r.total_amount if r.total_amount is not None else 0.00
        formatted_amount = f"PKR{amount:,.2f}"

        results.append({
            "record_id": r.record_id,
            "total_amount": float(amount),
            "label": f"Record #{r.record_id} | {r.patient_id or 'N/A'} | {full_name} ({formatted_amount})"
        })

    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_dropdown_view(request):
    try:
        # Fetch only the columns the frontend needs to save memory
        items = Inventory.objects.values('item_id', 'item_name')
        return Response(list(items))
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_clinic_report(request):
    user = request.user
    data = request.data
    
    report_by = data.get("report_by")       # "doctor", "management", or "patient"
    report_type = data.get("report_type")   # "salary", "patient_records", "inventory", etc.
    scope = data.get("scope", "all")        # "all" or "single"
    target_id = data.get("target_id")       # ID of the specific record if scope is single

    # Extract user email exactly like your profile matching logic does
    user_email = getattr(user, 'email', None)
    if not user_email:
        return Response({"error": "User account lacks a valid email association."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. RESOLVE USER ID FROM EMAIL VIA PROFILE VIEWS
    resolved_id = None
    try:
        if report_by == "patient":
            patient_prof = PatientRecordView.objects.filter(email=user_email).first()
            if patient_prof:
                resolved_id = getattr(patient_prof, 'patient_id', None)
        elif report_by == "doctor":
            doctor_prof = DoctorFullDetailsView.objects.filter(email=user_email).first()
            if doctor_prof:
                resolved_id = getattr(doctor_prof, 'staff_id', None)
        elif report_by == "management":
            mgmt_prof = ManagementFullDetailsView.objects.filter(email=user_email).first()
            if mgmt_prof:
                resolved_id = getattr(mgmt_prof, 'staff_id', None)

        # Safety Fallback check
        if not resolved_id and report_by != "management":
            return Response({"error": f"Could not map active profile credentials for role: {report_by}"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as profile_err:
        return Response({"error": f"Profile correlation failed: {str(profile_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 🛑 CRITICAL FIX: OVERRIDE INCOMING PARAMS TO FORCE RETRIEVAL LOCKDOWN FOR DOCTOR SALARIES
    if report_by == "doctor" and report_type == "salary":
        scope = "single"
        target_id = resolved_id

    # 🛑 PATIENT PRIVACY LOCKDOWN: FORCE PATIENTS TO ONLY ACCESS THEIR OWN BILLS / TREATMENT HISTORY
    if report_by == "patient":
        scope = "single"
        target_id = resolved_id

    # 2. ROLE CHECK AND DATABASE QUERIES
    try:
        # --- Patient Role Permissions ---
        if report_by == "patient":
            # Force active_id to use the backend-resolved profile ID exclusively
            active_id = resolved_id
            
            if report_type == "patient_records":
                queryset = PatientRecordView.objects.filter(patient_id=active_id)
            elif report_type == "bills":
                queryset = PatientBillingView.objects.filter(patient_id=active_id)
            else:
                return Response({"error": "Patients are not allowed to access this report type."}, status=status.HTTP_403_FORBIDDEN)
                
        # --- Doctor Role Permissions ---
        elif report_by == "doctor":
            if report_type == "patient_records":
                queryset = PatientRecordView.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(patient_id=target_id)
            elif report_type == "salary":
                # Double-locked: Always strictly filtered by their profile id
                queryset = VStaffSalary.objects.filter(staff_id=resolved_id)
            else:
                return Response({"error": "Doctors are not allowed to access this report type."}, status=status.HTTP_403_FORBIDDEN)
                
        # --- Management Role Permissions ---
        elif report_by == "management":
            if report_type == "patient_records":
                queryset = PatientRecordView.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(patient_id=target_id)
            elif report_type == "salary":
                queryset = VStaffSalary.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(staff_id=target_id)
            elif report_type == "bills":
                queryset = PatientBillingView.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(Q(patient_id=target_id) | Q(staff_id=target_id))
            elif report_type == "appointments":
                queryset = VPatientAppointments.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(Q(patient_id=target_id) | Q(staff_id=target_id))
            elif report_type == "suppliers":
                queryset = SupplierFullDetailsView.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(supplier_id=target_id)
            elif report_type == "inventory":
                queryset = Inventory.objects.all()
                if scope == "single" and target_id:
                    queryset = queryset.filter(item_id=target_id)
            elif report_type == "departments":
                queryset = DepartmentStaffSummary.objects.all()
            else:
                return Response({"error": "Invalid report type requested."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Invalid user role type."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as query_err:
        return Response({"error": f"Database query initialization failed: {str(query_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 3. GENERATE SUMMARY CARDS AND TABLE DATA
    summary_cards = []
    table_headers = []
    table_rows = []
    
    target_name_str = ""
    formatted_type = str(report_type).replace('_', ' ').title() if report_type else "Hospital"
    
    try:
        # --- PATIENT RECORDS ---
        if report_type == "patient_records":
            totals = queryset.aggregate(total_bill=Sum('total_amount'), total_paid=Sum('amount_paid'), record_count=Count('record_id'))
            bill = totals.get('total_bill') or Decimal('0.00')
            paid = totals.get('total_paid') or Decimal('0.00')
            due = Decimal(bill) - Decimal(paid)
            
            summary_cards = [
                {"title": "Total Consultations", "value": f"{totals.get('record_count') or 0} Visits"},
                {"title": "Total Charges", "value": f"Rs. {bill:,.2f}"},
                {"title": "Amount Settled", "value": f"Rs. {paid:,.2f}"},
                {"title": "Outstanding Due", "value": f"Rs. {due:,.2f}"}
            ]

            if report_by in ["management", "doctor"]:
                table_headers = ["Patient ID", "Doctor ID", "Clinical Notes", "Procedure Done", "Visit Date"]
            else:
                table_headers = ["Record ID", "Visit Date", "Procedure / Treatment", "Doctor", "Charges", "Settled"]
            
            first_rec = queryset.first()
            # Suppress target appended ID strings for clean personal patient reports
            if scope == "single" and first_rec and report_by != "patient":
                display_id = target_id if target_id else resolved_id
                target_name_str = f" - Patient ID: {display_id}"
            
            for r in queryset.order_by('record_id'):
                if report_by in ["management", "doctor"]:
                    raw_notes = getattr(r, 'clinical_notes', None)
                    formatted_notes = "None"
                    
                    if raw_notes:
                        if isinstance(raw_notes, list):
                            formatted_notes = ", ".join(str(note) for note in raw_notes)
                        elif isinstance(raw_notes, str):
                            try:
                                parsed = json.loads(raw_notes)
                                if isinstance(parsed, list):
                                    formatted_notes = ", ".join(str(note) for note in parsed)
                                else:
                                    formatted_notes = str(parsed)
                            except json.JSONDecodeError:
                                formatted_notes = raw_notes.strip("[]\"'")

                    table_rows.append([
                        getattr(r, 'patient_id', 'N/A'),
                        getattr(r, 'staff_id', 'N/A'),
                        formatted_notes,
                        getattr(r, 'procedure_done', 'Routine Consultation') or 'Routine Consultation',
                        str(getattr(r, 'visit_date', 'N/A'))
                    ])
                else:
                    table_rows.append([
                        f"#{getattr(r, 'record_id', 'N/A')}", str(getattr(r, 'visit_date', 'N/A')), 
                        getattr(r, 'procedure_done', 'Routine Consultation') or 'Routine Consultation',
                        f"ID: {getattr(r, 'staff_id', 'N/A')}", f"Rs. {getattr(r, 'total_amount', 0) or 0:,.2f}", f"Rs. {getattr(r, 'amount_paid', 0) or 0:,.2f}"
                    ])

        # --- SALARY HISTORY ---
        elif report_type == "salary":
            totals = queryset.aggregate(base=Sum('amount'), bonus=Sum('bonus'), deduct=Sum('deduction'), net=Sum('net_salary'), trans_count=Count('id'))
            summary_cards = [
                {"title": "Disbursements", "value": f"{totals.get('trans_count') or 0} Transactions"},
                {"title": "Total Base", "value": f"Rs. {totals.get('base') or 0:,.2f}"},
                {"title": "Total Bonuses", "value": f"Rs. {totals.get('bonus') or 0:,.2f}"},
                {"title": "Net Payroll", "value": f"Rs. {totals.get('net') or 0:,.2f}"}
            ]
            
            if report_by == "doctor":
                table_headers = ["Disbursement Date", "Base Salary", "Bonus Amount", "Deductions", "Net Paid Amount"]
            else:
                table_headers = ["Staff ID", "Employee Name", "Disbursement Date", "Base", "Bonus", "Deduction", "Net Paid"]
            
            first_rec = queryset.first()
            if scope == "single" and first_rec and report_by != "doctor":
                name = getattr(first_rec, 'full_name', 'Staff Member')
                target_name_str = f" - {name} (ID: {target_id or resolved_id})"

            for s in queryset.order_by('-payment_date'):
                if report_by == "doctor":
                    table_rows.append([
                        str(getattr(s, 'payment_date', 'N/A')),
                        f"Rs. {getattr(s, 'amount', 0) or 0:,.2f}", f"Rs. {getattr(s, 'bonus', 0) or 0:,.2f}",
                        f"Rs. {getattr(s, 'deduction', 0) or 0:,.2f}", f"Rs. {getattr(s, 'net_salary', 0) or 0:,.2f}"
                    ])
                else:
                    name = getattr(s, 'full_name', 'System Staff Member') or 'System Staff Member'
                    table_rows.append([
                        getattr(s, 'staff_id', 'N/A'), name, str(getattr(s, 'payment_date', 'N/A')),
                        f"Rs. {getattr(s, 'amount', 0) or 0:,.2f}", f"Rs. {getattr(s, 'bonus', 0) or 0:,.2f}",
                        f"Rs. {getattr(s, 'deduction', 0) or 0:,.2f}", f"Rs. {getattr(s, 'net_salary', 0) or 0:,.2f}"
                    ])

        # --- PATIENT BILLS ---
        elif report_type == "bills":
            totals = queryset.aggregate(t=Sum('total_amount'), p=Sum('amount_paid'), r=Sum('remaining_amount'), c=Count('bill_id'))
            summary_cards = [
                {"title": "Invoices Issued", "value": f"{totals.get('c') or 0} Bills"},
                {"title": "Invoiced Volume", "value": f"Rs. {totals.get('t') or 0:,.2f}"},
                {"title": "Cash Collections", "value": f"Rs. {totals.get('p') or 0:,.2f}"},
                {"title": "Remaining Due", "value": f"Rs. {totals.get('r') or 0:,.2f}"}
            ]
            table_headers = ["Invoice Code", "Visit Date", "Attending Consultant", "Total Cost", "Paid", "Remaining", "Payment Date"]
            
            first_rec = queryset.first()
            if scope == "single" and first_rec and report_by != "patient":
                display_id = target_id if target_id else resolved_id
                target_name_str = f" - ID/Ref: {display_id}"

            for b in queryset.order_by('bill_id'):
                table_rows.append([
                    f"INV-{getattr(b, 'bill_id', 'N/A')}", str(getattr(b, 'visit_date', 'N/A')), getattr(b, 'appointment_with', 'N/A') or 'N/A',
                    f"Rs. {getattr(b, 'total_amount', 0) or 0:,.2f}", f"Rs. {getattr(b, 'amount_paid', 0) or 0:,.2f}", f"Rs. {getattr(b, 'remaining_amount', 0) or 0:,.2f}", str(getattr(b, 'payment_date', 'N/A'))
                ])

        # --- APPOINTMENTS ---
        elif report_type == "appointments":
            totals = queryset.values('status').annotate(count=Count('id'))
            count_map = {str(item['status'] or 'pending').lower(): item['count'] for item in totals}
            summary_cards = [
                {"title": "Pending", "value": f"{count_map.get('pending', 0)} Cases"},
                {"title": "Confirmed", "value": f"{count_map.get('accepted', 0)} Bookings"},
                {"title": "Cancellations", "value": f"{count_map.get('rejected', 0)} Records"}
            ]
            table_headers = ["Date", "Time Slots", "Staff ID", "Doctor Name", "Patient Ref", "Status"]
            if scope == "single" and target_id:
                target_name_str = f" - Target Entity ID: {target_id}"
            for a in queryset.order_by('-appointment_date'):
                table_rows.append([
                    str(getattr(a, 'appointment_date', 'N/A')), str(getattr(a, 'appointment_time', 'Unscheduled') or 'Unscheduled'),
                    getattr(a, 'staff_id', 'N/A'), getattr(a, 'doctor_name', 'N/A') or 'N/A', getattr(a, 'patient_id', 'N/A'), str(getattr(a, 'status', 'Pending') or 'Pending').upper()
                ])

        # --- STOCK INVENTORY ---
        elif report_type == "inventory":
            totals = queryset.aggregate(total_items=Count('item_id'), total_stock=Sum('quantity'), total_value=Sum(F('quantity') * F('unit_price')))
            val = totals.get('total_value') or Decimal('0.00')
            summary_cards = [
                {"title": "Unique Items", "value": f"{totals.get('total_items') or 0} SKUs"},
                {"title": "Total Stock Items", "value": f"{totals.get('total_stock') or 0} Units"},
                {"title": "Inventory Value", "value": f"Rs. {val:,.2f}"}
            ]
            table_headers = ["Item ID", "Item Name", "Category", "Quantity", "Unit", "Unit Price", "Supplier ID"]
            first_rec = queryset.first()
            if scope == "single" and first_rec:
                target_name_str = f" - {getattr(first_rec, 'item_name', 'Item')} (ID: {target_id})"
            for item in queryset.order_by('item_id'):
                table_rows.append([
                    getattr(item, 'item_id', 'N/A'), getattr(item, 'item_name', 'N/A'), getattr(item, 'category', 'N/A') or 'General',
                    f"{getattr(item, 'quantity', 0) or 0}", getattr(item, 'unit', 'pcs') or 'pcs', f"Rs. {getattr(item, 'unit_price', 0) or 0:,.2f}", getattr(item, 'supplier_id', 'N/A') or 'N/A'
                ])

        # --- SUPPLIERS ---
        elif report_type == "suppliers":
            totals = queryset.aggregate(total_partners=Count('supplier_id'))
            summary_cards = [{"title": "Total Suppliers", "value": f"{totals.get('total_partners') or 0} Active Vendors"}]
            table_headers = ["Supplier ID", "Company Name", "Contact Person", "Email", "Phone"]
            first_rec = queryset.first()
            if scope == "single" and first_rec:
                comp_title = getattr(first_rec, 'company_name', 'Supplier')
                target_name_str = f" - {comp_title} (ID: {target_id})"
            for sup in queryset.order_by('supplier_id'):
                table_rows.append([
                    getattr(sup, 'supplier_id', 'N/A'), getattr(sup, 'company_name', 'N/A'), getattr(sup, 'contact_person', 'N/A') or 'N/A', getattr(sup, 'email', 'N/A'), getattr(sup, 'phone', 'N/A') or 'N/A'
                ])

        # --- DEPARTMENTS ---
        elif report_type == "departments":
            totals = queryset.aggregate(tc=Sum('total_staff'), dc=Count('dept_id'))
            summary_cards = [{"title": "Active Departments", "value": f"{totals.get('dc') or 0} Depts"}, {"title": "Total Staff Size", "value": f"{totals.get('tc') or 0} Personnel"}]
            table_headers = ["Dept ID", "Department Name", "Room Location", "Staff Headcount"]
            for dept in queryset:
                table_rows.append([getattr(dept, 'dept_id', 'N/A'), getattr(dept, 'dept_name', 'N/A'), str(getattr(dept, 'room_number', 'N/A') or 'N/A'), f"{getattr(dept, 'total_staff', 0) or 0} Active Staff"])
        else:
            return Response({"error": "Unknown report type request."}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as data_err:
        return Response({"error": f"Failed to format data for report table: {str(data_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 4. RENDER TO HTML AND GENERATE BLOB PDF
    title_text = f"Personal {formatted_type} Statement" if report_by in ["patient", "doctor"] and scope == "all" else f"{formatted_type} Summary Report{target_name_str}"
    
    if report_by == "doctor" and report_type == "salary":
        title_text = "Personal Salary Ledger Statement"
        
    # Clear and clean header for patients viewing their statement
    if report_by == "patient":
        title_text = f"Personal {formatted_type} Ledger Statement"

    logo_path = os.path.abspath(os.path.join(settings.BASE_DIR, 'assets', 'HappyDent_logo.png'))
    name_pic_path = os.path.abspath(os.path.join(settings.BASE_DIR, 'assets', 'HappyDent_word_logo.png'))

    context = {
        "now_str": datetime.now().strftime("%I:%M %p | %d %B, %Y"),
        "scope_str": scope.upper(),
        "title_text": title_text,
        "summary_cards": summary_cards,
        "table_headers": table_headers,
        "table_rows": table_rows,
        "logo_path": logo_path, 
        "name_pic_path": name_pic_path,
    }
    
    html_string = render_to_string('report_template.html', context)

    try:
        result = io.BytesIO()
        pdf = pisa.pisaDocument(io.BytesIO(html_string.encode("UTF-8")), result)
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Hospital_Report_{report_type}.pdf"'
            return response
            
        return Response({"error": "PDF layout rendering engine failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as pdf_err:
        return Response({"error": f"PDF generator crashed: {str(pdf_err)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)