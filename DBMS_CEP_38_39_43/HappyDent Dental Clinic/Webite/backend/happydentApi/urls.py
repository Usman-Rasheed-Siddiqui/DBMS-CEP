from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import *


appointment_list = AppointmentViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

appointment_detail = AppointmentViewSet.as_view({
    'get': 'retrieve',
    'delete': 'destroy'
})

router = DefaultRouter()

router.register('patients', PatientViewSet, basename='patients')
router.register('staff', StaffViewSet, basename='staff')
router.register('bills', BillViewSet, basename='bills')
router.register('doctors', DoctorViewSet, basename='doctors')
router.register(r'accepted-appointments', AcceptedAppointmentsViewSet, basename='accepted-appointments')
router.register(r'pending-appointments', PendingAppointmentsViewSet, basename='pending-appointments')
router.register(r'rejected-appointments', RejectedAppointmentsViewSet, basename='rejected-appointments')

urlpatterns = [
    path('', home),
    path("login/", LoginView.as_view()),
    path("signup/", SignUpView.as_view()),
    path("logout/", LogoutView.as_view()),
    path('doctors/', doctor_list, name='doctor_list'),
    path('appointments/', appointment_list),
    path('appointments/<int:staff_id>/<int:patient_id>/<str:appointment_date>/', appointment_detail),
    path('appointment-acception/', accept_appointment_api),
    path('appointment-rejection/', reject_appointment_api),

    path("patient-search/", patient_search_api),

    path("patient-records/", patient_record_api),
    path("add-patient-record/", add_patient_record_api),
    path("update-patient-record/", update_patient_record_api),
    path("add-clinical-note/", add_clinical_note_api),
    path("search-patient-records/", search_patient_records_api),
    path('delete-patient-record/<int:record_id>/', delete_patient_record),

    path("staff-salary/", StaffSalaryViewSet.as_view({"get": "list"})),
    path("staff-salary-summary/", StaffSalarySummaryView.as_view()),

    path("patient-appointments/", PatientAppointmentsViewSet.as_view({"get": "list"})),
    path("cancel-appointment/", CancelAppointmentView.as_view()),

    path("my-patient-records/", my_patient_records),

    path("doctor-profile/", get_doctor_profile),
    path("doctor-profile-update/", update_doctor_profile_api),

    path("patient-profile/", get_patient_profile),
    path("patient-profile-update/", update_patient_profile_api),

    path("management-profile/", get_management_profile),
    path("management-profile-update/", update_management_profile_api),

    path("patient-billing/", get_patient_billing, name="patient-billing"),
    path("make-payment/", make_payment_api),
    path("due-records/",get_due_records,name="get_due_records"),
    path("payment-summary/", get_payment_summary,name="payment-summary"),

    path('doctor-list-manager/', doctor_list_manager, name='doctor-list-manager'),
    path('doctor-add/', add_doctor,name='add-doctor'),
    path('doctor-edit/<str:staff_id>/', edit_doctor, name='edit-doctor'),
    path('doctor-delete/<str:staff_id>/', delete_doctor, name='delete-doctor'),

    path('nurse-list-manager/', nurse_list_manager, name='nurse-list-manager'),
    path('nurse-add/', add_nurse,name='nurse-doctor'),
    path('nurse-edit/<str:staff_id>/', edit_nurse, name='nurse-doctor'),
    path('nurse-delete/<str:staff_id>/', delete_nurse, name='nurse-doctor'),

    path('management-list-manager/', management_list_manager, name='management-list-manager'),
    path('manager-add/', add_manager, name='manager-add'),
    path('manager-edit/<str:staff_id>/', edit_manager, name='manager-edit'),
    path('manager-delete/<str:staff_id>/', delete_manager, name='manager-delete'),
    path('current-staff-info/', current_staff_info),

    path('patient-list-manager/', patient_list_manager, name='patient-list-manager'),
    path('patient-add/', add_patient, name='patient-add'),
    path('patient-edit/<str:patient_id>/', edit_patient, name='patient-edit'),
    path('patient-delete/<str:patient_id>/', delete_patient, name='patient-delete'),
    
    path('department-staff-summary/', department_list),
    path('department-list/', department_list),
    path('department-add/', add_department),
    path('department-edit/<str:dept_id>/', edit_department),
    path('department-delete/<str:dept_id>/', delete_department),

    path('supplier-list/', supplier_list),
    path('supplier-add/', add_supplier),
    path('supplier-edit/<str:supplier_id>/', edit_supplier),
    path('supplier-delete/<str:supplier_id>/', delete_supplier),

    path("admin-budget-list/", administrative_budget_list),
    path("company-budget-summary/", company_budget_summary),


    path('inventory-list/', inventory_list),
    path('inventory-add/', add_inventory),
    path('inventory-edit/<str:item_id>/', edit_inventory),
    path('inventory-delete/<str:item_id>/', delete_inventory),

    path('supplier-dropdown/', supplier_dropdown_list),

    path('add-bill/', add_bill, name='bill-add'),
    path('edit-bill/<int:bill_id>/', edit_bill, name='bill-edit'),
    path('delete-bill/<int:bill_id>/', delete_bill, name='bill-delete'),
    path('billing-list/', billing_list, name='billing-list'),
    path('billing-summary/', billing_summary, name='billing-summary'),

    path('salary-list/', salary_list, name='salary-list'),
    path('salary-summary/', salary_summary, name='salary-summary'),
    path('add-salary/', add_salary, name='add-salary'),
    path('edit-salary/<str:staff_id>/<str:payment_date>/', edit_salary, name='edit-salary'),
    path('delete-salary/<str:staff_id>/<str:payment_date>/', delete_salary, name='delete-salary'),
    
    path('staff-dropdown/', staff_dropdown, name='staff-dropdown'),
    path('patient-record-dropdown/', patient_record_dropdown, name='patient-record-dropdown'),
    path('inventory-dropdown/', inventory_dropdown_view),

    path('generate-hospital-report/', generate_clinic_report),

]

urlpatterns += router.urls