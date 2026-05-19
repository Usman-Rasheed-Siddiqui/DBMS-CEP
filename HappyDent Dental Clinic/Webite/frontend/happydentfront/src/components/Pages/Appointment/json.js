import './json.css';

export const json = {

  pages: [
    {
      name: "appointment-page",

      elements: [

        {
          type: "dropdown",
          name: "doctor",
          title: "Select Doctor",
          width: "100%",
          titleLocation: "top",
          titleStyle:
            "color:#000000ff;font-size:1.1rem;font-weight:bold;",

          placeholder: "Choose a doctor",

          choices: []
        },

        {
          type: "text",
          name: "appointment-date",

          width: "50%",
          minWidth: "256px",

          title: "Appointment Date",

          titleLocation: "top",

          titleStyle:
            "color:#000000ff;font-size:1.1rem;font-weight:bold;",

          defaultValueExpression: "today()",

          validators: [
            {
              type: "expression",
              text: "Appointment date cannot be in the past.",
              expression: "{appointment-date} >= today()"
            }
          ],

          inputType: "date",

          placeholder: "Select appointment date"
        },

      ]
    }
  ],

  showPrevButton: false,

  questionErrorLocation: "bottom",

  completeText: "Book Appointment",

  widthMode: "static",

  width: "904"
};