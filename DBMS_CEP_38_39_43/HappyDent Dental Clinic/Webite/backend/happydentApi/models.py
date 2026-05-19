# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.postgres.fields import ArrayField

class Administrative(models.Model):
    staff = models.OneToOneField('Staff', models.DO_NOTHING, primary_key=True)
    clearance_level = models.CharField(max_length=20, blank=True, null=True)
    budget_authority = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'administrative'


class Appointment(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'patient_id', 'appointment_date')
    staff = models.ForeignKey('Staff', models.DO_NOTHING)
    patient = models.ForeignKey('Patient', models.DO_NOTHING)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'appointment'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Bill(models.Model):
    bill_id = models.AutoField(primary_key=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    payment_date = models.DateField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    record = models.ForeignKey('PatientRecord', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bill'


class Department(models.Model):
    dept_id = models.CharField(primary_key=True, max_length=10)
    dept_name = models.CharField(max_length=100)
    room_number = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'department'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Doctor(models.Model):
    staff = models.OneToOneField('Staff', models.DO_NOTHING, primary_key=True)
    availability = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'doctor'


class DoctorQualification(models.Model):
    staff = models.ForeignKey(Doctor, on_delete=models.DO_NOTHING)
    qualification = models.CharField(max_length=100)

    class Meta:
        db_table = 'doctor_qualification'


class DoctorSpecialization(models.Model):
    staff = models.ForeignKey(Doctor, on_delete=models.DO_NOTHING)
    specialization = models.CharField(max_length=100)

    class Meta:
        db_table = 'doctor_specialization'


class Medical(models.Model):
    staff = models.OneToOneField('Staff', models.DO_NOTHING, primary_key=True)
    license_number = models.ForeignKey('MedicalDetails', models.DO_NOTHING, db_column='license_number', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'medical'


class MedicalDetails(models.Model):
    license_number = models.CharField(primary_key=True, max_length=50)
    years_experience = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'medical_details'


class Patient(models.Model):
    patient_id = models.CharField(primary_key=True, max_length=10)
    email = models.ForeignKey('PatientDetails', models.DO_NOTHING, db_column='email', blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'patient'


class PatientDetails(models.Model):
    email = models.CharField(primary_key=True, max_length=100)
    name_first = models.CharField(max_length=50, blank=True, null=True)
    name_last = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    marital_status = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    has_diabetes = models.BooleanField(blank=True, null=True)
    has_hypertension = models.BooleanField(blank=True, null=True)
    has_allergies = models.BooleanField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'patient_details'


class PatientPhone(models.Model):
    pk = models.CompositePrimaryKey('patient_id', 'phone')
    patient_id = models.CharField(max_length=10)
    phone = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'patient_phone'


class PatientRecord(models.Model):
    record_id = models.AutoField(primary_key=True)
    treatment_plan = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    procedure_done = models.CharField(max_length=255, blank=True, null=True)
    visit_date = models.DateField(blank=True, null=True)
    next_appointment = models.DateField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    patient_id = models.CharField(max_length=10, blank=True, null=True)
    staff = models.ForeignKey('Staff', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'patient_record'


class Salary(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'payment_date')
    staff = models.ForeignKey('Staff', models.DO_NOTHING)
    payment_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    deduction = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'salary'


class Staff(models.Model):
    staff_id = models.CharField(primary_key=True, max_length=10)
    email = models.ForeignKey('StaffDetails', models.DO_NOTHING, db_column='email', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'staff'


class StaffDetails(models.Model):
    email = models.CharField(primary_key=True, max_length=100)
    name_first = models.CharField(max_length=50)
    name_last = models.CharField(max_length=50)
    acc_password = models.CharField(max_length=255)
    dob = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_joined = models.DateField(blank=True, null=True)
    acc_status = models.CharField(max_length=20, blank=True, null=True)
    staff_role = models.CharField(max_length=50, blank=True, null=True)
    dept = models.ForeignKey(Department, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'staff_details'


class StaffPhone(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'phone')
    staff = models.ForeignKey(Staff, models.DO_NOTHING)
    phone = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'staff_phone'


class Supplier(models.Model):
    supplier_id = models.CharField(primary_key=True, max_length=10)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.ForeignKey('SupplierDetails', models.DO_NOTHING, db_column='email', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'supplier'


class SupplierDetails(models.Model):
    email = models.CharField(primary_key=True, max_length=100)
    company_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'supplier_details'

class Nurse(models.Model):
    staff = models.OneToOneField('Staff', models.DO_NOTHING, primary_key=True)
    shift_type = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'nurse'

class RecordClinicalNotes(models.Model):
    pk = models.CompositePrimaryKey('record_id', 'clinical_notes')
    record = models.ForeignKey('PatientRecord', models.DO_NOTHING)
    clinical_notes = models.TextField()

    class Meta:
        managed = False
        db_table = 'record_clinical_notes'


class Inventory(models.Model):

    item_id = models.TextField(primary_key=True)
    item_name = models.TextField()
    category = models.TextField(null=True, blank=True)
    quantity = models.IntegerField(default=0)
    unit = models.TextField(null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    supplier_id = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "Inventory"

# Views

class DoctorDirectory(models.Model):
    staff_id = models.CharField(primary_key=True, max_length=10)
    name_first = models.CharField(max_length=50, blank=True, null=True)
    name_last = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    availability = models.BooleanField(blank=True, null=True)
    dept_name = models.CharField(max_length=100, blank=True, null=True)
    qualifications = ArrayField(models.CharField(max_length=100))
    specializations = ArrayField(models.CharField(max_length=100))

    class Meta:
        managed = False
        db_table = 'doctor_directory'

class AcceptedAppointments(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'patient_id', 'appointment_date')
    staff_id = models.CharField(max_length=10)
    patient_id = models.CharField(max_length=10)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)  # null=True since rejected won't have a time

    class Meta:
        managed = False
        db_table = 'accepted_appointments'


class PendingAppointments(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'patient_id', 'appointment_date')
    staff_id = models.CharField(max_length=10)
    patient_id = models.CharField(max_length=10)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pending_appointments'


class RejectedAppointments(models.Model):
    pk = models.CompositePrimaryKey('staff_id', 'patient_id', 'appointment_date')
    staff_id = models.CharField(max_length=10)
    patient_id = models.CharField(max_length=10)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'rejected_appointments'


class PatientRecordView(models.Model):
    record_id = models.BigIntegerField(primary_key=True)
    patient_id = models.CharField(max_length=10, blank=True, null=True)
    name_first = models.CharField(max_length=50, blank=True, null=True)
    name_last = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    phones = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list
    )

    treatment_plan = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    procedure_done = models.CharField(max_length=255, blank=True, null=True)
    visit_date = models.DateField(blank=True, null=True)
    next_appointment = models.DateField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    staff_id = models.CharField(max_length=10, blank=True, null=True)
    
    clinical_notes = ArrayField(models.TextField(), blank=True, default=list)

    class Meta:
        managed = False
        db_table = 'patient_record_view'


class PatientSearchView(models.Model):
    patient_id = models.CharField(max_length=10, primary_key=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    name_first = models.CharField(max_length=50, blank=True, null=True)
    name_last = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    phones = ArrayField(
        models.CharField(max_length=20),
        blank=True,
        default=list
    )

    class Meta:
        managed = False
        db_table = 'patient_search_view'


class VStaffSalary(models.Model):
    id = models.BigIntegerField(primary_key=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    staff_id = models.CharField(max_length=10)
    payment_date = models.DateField()

    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    deduction = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "v_staff_salary"


class VStaffSalarySummary(models.Model):
    id = models.BigIntegerField(primary_key=True)

    staff_id = models.CharField(max_length=10)
    total_base_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    total_bonus = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    total_deduction = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    total_net_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "v_staff_salary_summary"

class VStaffSalaryYearly(models.Model):

    id = models.BigIntegerField(primary_key=True)

    staff_id = models.CharField(max_length=10)
    year = models.IntegerField()
    total_base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_bonus = models.DecimalField(max_digits=12, decimal_places=2)
    total_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    total_net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'v_staff_salary_yearly'
    
class VPatientAppointments(models.Model):
    id = models.BigIntegerField(primary_key=True)
    staff_id = models.CharField(max_length=10)
    patient_id = models.CharField(max_length=10)
    appointment_date = models.DateField()
    appointment_time = models.TimeField(blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)
    doctor_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "v_patient_appointments"


class PatientBillingView(models.Model):
    bill_id = models.IntegerField(primary_key=True)
    record_id = models.IntegerField()
    patient_id = models.CharField(max_length=20)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=50)
    visit_date = models.DateField()
    staff_id = models.CharField(max_length=20)
    appointment_with = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "patient_billing_view"

class PatientDueRecord(models.Model):

    record_id = models.IntegerField(primary_key=True)
    patient_id = models.CharField(max_length=20)
    visit_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = "patient_due_records"


class PatientPaymentSummary(models.Model):

    patient_id = models.CharField(max_length=20, primary_key=True)
    total_bill_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount_due = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = "patient_payment_summary"


class DoctorFullDetailsView(models.Model):
    staff_id = models.CharField(max_length=10, primary_key=True)

    email = models.EmailField()

    # Combined full name from SQL view
    full_name = models.CharField(max_length=201)

    gender = models.CharField(max_length=20)

    staff_role = models.CharField(max_length=50)

    dept_id = models.CharField(max_length=10)

    # PostgreSQL ARRAY fields
    phone_numbers = ArrayField(
        base_field=models.CharField(max_length=20),
        default=list,
        blank=True
    )

    qualifications = ArrayField(
        base_field=models.CharField(max_length=255),
        default=list,
        blank=True
    )

    specializations = ArrayField(
        base_field=models.CharField(max_length=255),
        default=list,
        blank=True
    )

    license_number = models.CharField(max_length=50, null=True, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'doctor_full_details_view'

    def __str__(self):
        return f"{self.staff_id} - {self.full_name}"
    
class NurseFullDetailsView(models.Model):
    staff_id = models.CharField(max_length=10, primary_key=True)
    email = models.EmailField()
    full_name = models.CharField(max_length=201)
    gender = models.CharField(max_length=20)
    staff_role = models.CharField(max_length=50)
    dept_id = models.CharField(max_length=10)
    acc_status = models.CharField(max_length=20)
    shift_type = models.CharField(max_length=20)
    phone_numbers = ArrayField(base_field=models.CharField(max_length=20), default=list, blank=True)

    class Meta:
        managed = False
        db_table = "nurse_full_details_view"

    def __str__(self):
        return f"{self.staff_id} - {self.full_name}"
    
class ManagementFullDetailsView(models.Model):
    staff_id = models.CharField(max_length=10, primary_key=True)
    email = models.EmailField()

    full_name = models.CharField(max_length=201)
    gender = models.CharField(max_length=20)
    staff_role = models.CharField(max_length=50)
    dept_id = models.CharField(max_length=10)
    acc_status = models.CharField(max_length=20)

    # Administrative fields
    clearance_level = models.CharField(max_length=20, null=True, blank=True)

    budget_authority = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    budget_used = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        default=0
    )

    # ARRAY FIELD (IMPORTANT)
    phone_numbers = ArrayField(
        base_field=models.CharField(max_length=20),
        default=list,
        blank=True
    )

    class Meta:
        managed = False
        db_table = "management_full_details_view"

    def __str__(self):
        return f"{self.staff_id} - {self.full_name}"


class PatientFullDetailsView(models.Model):

    patient_id = models.CharField(max_length=10, primary_key=True)
    email = models.EmailField()

    full_name = models.CharField(max_length=120)

    gender = models.CharField(max_length=10, null=True, blank=True)
    marital_status = models.CharField(max_length=20, null=True, blank=True)

    address = models.TextField(null=True, blank=True)

    has_diabetes = models.BooleanField(null=True, blank=True)
    has_hypertension = models.BooleanField(null=True, blank=True)
    has_allergies = models.BooleanField(null=True, blank=True)

    dob = models.DateField(null=True, blank=True)

    phone_numbers = ArrayField(
        models.CharField(max_length=20),
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'patient_full_details_view'

class DepartmentStaffSummary(models.Model):

    dept_id = models.CharField(max_length=10, primary_key=True)
    dept_name = models.CharField(max_length=100)
    room_number = models.BigIntegerField(null=True)

    total_staff = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'department_staff_summary'

class SupplierFullDetailsView(models.Model):

    supplier_id = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField()
    phone = models.CharField( max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'supplier_full_details_view'

class AdministrativeBudgetView(models.Model):
    staff_id = models.CharField(max_length=10, primary_key=True)
    full_name = models.CharField(max_length=200)
    email = models.CharField(max_length=100)
    clearance_level = models.CharField(max_length=20)

    budget_authority = models.DecimalField(max_digits=15, decimal_places=2)
    budget_used = models.DecimalField(max_digits=15, decimal_places=2)
    budget_remaining = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        managed = False
        db_table = "administrative_budget_view"


class CompanyBudgetSummary(models.Model):
    total_budget_authority = models.DecimalField(max_digits=15, decimal_places=2, primary_key=True)
    total_budget_used = models.DecimalField(max_digits=15, decimal_places=2)
    total_budget_remaining = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        managed = False
        db_table = "company_budget_summary"

class SupplierDropdownView(models.Model):

    supplier_id = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = "supplier_dropdown_view"

class BillingSummaryView(models.Model):

    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, primary_key=True)
    total_transactions = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'billing_summary_view'


class SalarySummaryView(models.Model):

    total_salary_paid = models.DecimalField(max_digits=15, decimal_places=2, primary_key=True)
    total_salary_transactions = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'salary_summary_view'