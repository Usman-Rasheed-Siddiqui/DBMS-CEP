
import AxiosInstance from "../../Axios";

export const submitAppointment = (formData) => {
  return AxiosInstance.post("appointments/", {
    staff: formData["doctor"],
    appointment_date: formData["appointment-date"],
    appointment_time: null,
  });


  
};