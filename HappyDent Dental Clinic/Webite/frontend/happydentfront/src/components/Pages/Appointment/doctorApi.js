import AxiosInstance from "../../Axios";

export const getDoctors = async () => {
    const response = await AxiosInstance.get("doctors/");
    return response.data;
};