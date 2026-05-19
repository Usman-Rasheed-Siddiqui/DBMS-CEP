from django.contrib import admin

from .models import (
    Administrative,
    Bill,
    Department,
    Doctor,
    DoctorQualification,
    DoctorSpecialization,
    Medical,
    MedicalDetails,
    Nurse,
    Patient,
    PatientDetails,
    PatientRecord,
    Staff,
    StaffDetails,
    Supplier,
    SupplierDetails,
)

admin.site.register(Administrative)
admin.site.register(Bill)
admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(DoctorQualification)
admin.site.register(DoctorSpecialization)
admin.site.register(Medical)
admin.site.register(MedicalDetails)
admin.site.register(Nurse)
admin.site.register(Patient)
admin.site.register(PatientDetails)
admin.site.register(PatientRecord)
admin.site.register(Staff)
admin.site.register(StaffDetails)
admin.site.register(Supplier)
admin.site.register(SupplierDetails)