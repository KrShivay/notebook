import errorMessages from "utils/locales/errorMessages";
import * as Yup from "yup";
import {emailRegEx} from "./regex";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required(errorMessages.schemaStrings.email.enter)
    .matches(emailRegEx, errorMessages.schemaStrings.email.invalid),
  password: Yup.string().required(errorMessages.schemaStrings.password.enter),
});

const validation = {
  loginSchema,
};

export default validation;
