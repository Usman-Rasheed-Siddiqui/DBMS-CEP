
from rest_framework import serializers
from .models import *


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['staff', 'patient', 'appointment_date', 'appointment_time']
        read_only_fields = ['patient']

    def validate(self, data):
        request = self.context['request']
        patient = patient = Patient.objects.get(email__email=request.user.email)
        staff = data.get('staff')
        date = data.get('appointment_date')

        if Appointment.objects.filter(
            staff=staff,
            patient=patient,
            appointment_date=date
        ).exists():
            raise serializers.ValidationError(
                "You already have an appointment with this doctor on this date."
            )
        
        return data

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    
    doctor_name = serializers.CharField(
        source='staff.email.name_first',
        read_only=True
    )

    specializations = serializers.SerializerMethodField()
    qualifications = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['staff', 'availability', 'doctor_name', 'specializations', 'qualifications']


    def get_specializations(self, obj):
        return DoctorSpecialization.objects.filter(
        staff=obj
    ).values_list('specialization', flat=True)


    def get_qualifications(self, obj):
        return DoctorQualification.objects.filter(
            staff=obj
        ).values_list('qualification', flat=True)


class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventory
        fields = "__all__"


# Views Serializer
class AcceptedAppointmentsSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = AcceptedAppointments
        fields = ['staff_id', 'patient_id', 'appointment_date', 'appointment_time', 'patient_name']

    def get_patient_name(self, obj):
        patient = Patient.objects.get(patient_id=obj.patient_id)
        return f"{patient.email.name_first} {patient.email.name_last}"


class PendingAppointmentsSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = PendingAppointments
        fields = ['staff_id', 'patient_id', 'appointment_date', 'appointment_time', 'patient_name']

    def get_patient_name(self, obj):
        patient = Patient.objects.get(patient_id=obj.patient_id)
        return f"{patient.email.name_first} {patient.email.name_last}"


class RejectedAppointmentsSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()  

    class Meta:
        model = RejectedAppointments
        fields = ['staff_id', 'patient_id', 'appointment_date', 'appointment_time', 'patient_name']

    def get_patient_name(self, obj):
        patient = Patient.objects.get(patient_id=obj.patient_id)
        return f"{patient.email.name_first} {patient.email.name_last}"
    

class PatientSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientSearchView
        fields = '__all__'

class PatientRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientRecordView
        fields = '__all__'

class VStaffSalarySerializer(serializers.ModelSerializer):
    class Meta:
        model = VStaffSalary
        fields = "__all__"


class VStaffSalarySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = VStaffSalarySummary
        fields = "__all__"


class VStaffSalaryYearlySerializer(serializers.ModelSerializer):
    class Meta:
        model = VStaffSalaryYearly
        fields = "__all__"

class VPatientAppointmentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = VPatientAppointments
        fields = "__all__"

class PatientBillingViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientBillingView

        fields = "__all__"

class PatientDueRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientDueRecord
        fields = "__all__"

class PatientPaymentSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientPaymentSummary
        fields = "__all__"

class DoctorFullDetailsViewSerializer(serializers.ModelSerializer):

    class Meta:
        model = DoctorFullDetailsView
        fields = '__all__'

class NurseFullDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseFullDetailsView
        fields = "__all__"

class ManagementFullDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagementFullDetailsView
        fields = '__all__'

class PatientFullDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = PatientFullDetailsView
        fields = '__all__'

class DepartmentStaffSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = DepartmentStaffSummary
        fields = "__all__"

class SupplierFullDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = SupplierFullDetailsView

        fields = "__all__"

class AdministrativeBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdministrativeBudgetView
        fields = "__all__"


class CompanyBudgetSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyBudgetSummary
        fields = "__all__"

class SupplierDropdownSerializer(serializers.ModelSerializer):

    class Meta:
        model = SupplierDropdownView
        fields = "__all__"

class BillingSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = BillingSummaryView
        fields = '__all__'


class SalarySummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = SalarySummaryView
        fields = '__all__'

