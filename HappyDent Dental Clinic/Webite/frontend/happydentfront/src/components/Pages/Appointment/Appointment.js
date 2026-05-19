import React, { useEffect, useMemo } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";

import { themeJson } from "./theme";
import { json } from "./json";

import SpotlightCard from '../../Achievement/Achievement';
import { useNavigate } from "react-router-dom";

import "./Appointment.css";

import { submitAppointment } from "./appointmentaxios";
import { getDoctors } from "./doctorApi";

function Appointment({ setToast }) {

    const navigate = useNavigate();

    const survey = useMemo(() => {
        const model = new Model(json);
        model.applyTheme(themeJson);

        model.showCompletedPage = false;
        model.completeText = "Book Appointment";
        
        return model;
    }, []);

    useEffect(() => {

        const loadDoctors = async () => {

            try {

                const doctors = await getDoctors();

                console.log("Doctors:", doctors);
                
                doctors.forEach((doctor, index) => {
                    console.log("DOCTOR STAFF:", doctor.staff_id);
                    console.log("SPECIALIZATIONS:", doctor.specializations);
                });


                const availableDoctors = doctors.filter(
                (doctor) => doctor.availability === true  || doctor.availability === 1
                );

                console.log("Available doctors:", availableDoctors);

                const doctorQuestion =
                    survey.getQuestionByName("doctor");

                doctorQuestion.choices = availableDoctors.map((doctor) => ({
                    value: doctor.staff_id,
                    text: `${doctor.name} - ${doctor.specializations?.join(", ") || ""}`
                }));


                doctorQuestion.visible = false;
                setTimeout(() => {
                    doctorQuestion.visible = true;
                }, 0);

            }

            catch (error) {

                console.error("Failed to load doctors", error);

            }
        };

        loadDoctors();

    }, [survey]);

    useEffect(() => {

        const handleComplete = async (sender) => {
            try {
                const res = await submitAppointment(sender.data);

                setToast({
                    show: true,
                    message: "Appointment requested, please check your approval status",
                    type: "success"
                });

                sender.clear();
            }

            catch (error) {
                console.error("Appointment failed:", error.response?.data || error);
                
                const data = error.response?.data;

                const message = error.response?.data?.non_field_errors?.[0];

                setToast({
                    show: true,
                    message: message,
                    type: "danger",
                });
                sender.clear();
            }
        };

        survey.onComplete.clear();
        survey.onComplete.add(handleComplete);

    }, [survey, setToast]);

    return (
        <div
            className="book-now-card"
            style={{ marginBottom: '80px' }}
        >

            <SpotlightCard
                spotlightColor="rgba(0, 229, 255, 0.2)"
                className="appointment-spotlight-card"
            >

                <div>
                    <Survey model={survey} />
                </div>

            </SpotlightCard>

        </div>
    );
}

export default Appointment;