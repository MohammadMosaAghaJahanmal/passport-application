import * as yup from 'yup';
export default (data) =>
{
  let schema = yup.object().shape({
    uxTitleID:yup.string().required("Title is Required!"),
    uxCriminalRecord:yup.string().required("Type Of Application Required!"),
    uxFamilyNameLocal:yup.string().required("Pashto Family Name Is Required!"),
    uxFamilyName:yup.string().required("English Family Name Is Required!"),
    uxGivenNamesLocal:yup.string().required("Pashto Name Is Required!"),
    uxGivenNames:yup.string().required("English Name Is Required!"),
    uxFatherNameLocal:yup.string().required("Pashto Father Name Is Required!"),
    uxFatherName:yup.string().required("English Father Name Is Required!"),
    uxGrandFatherNameLocal:yup.string().required("Pashto GrandFather Name Is Required!"),
    uxGrandFatherName:yup.string().required("English GrandFather Name Is Required!"),
    uxBirthDate_Shamsi:yup.string().required("Shamsi Date Is Required!"),
    uxBirthDate:yup.string().required("Miladi Date Is Required!"),
    uxProfessionID:yup.string().optional().default("22"),
    _Profession:yup.string().optional().default("22"),
    uxBirthLocationID:yup.string().required("Place Of Birth Is Required!"),
    uxResidenceCountryID:yup.string().required("Current Location Is Required!"),
    uxMaritalStatusID:yup.string().required("Marital Status Is Required!"),
    uxNIDTypeID:yup.string().required("National Id Type Is Required!"),
    uxSerial:yup.string().required("Tazkira/Card ID Is Required!"),
    uxJuld:yup.string().optional().default(""),
    uxPage:yup.string().optional().default(""),
    uxNo:yup.string().optional().default(""),
    uxNID:yup.string().optional().default(""),
    uxGenderID:yup.string().required("Gender Is Required!"),
    uxHairColorID:yup.string().required("Hair Color Is Required!"),
    uxEyeColorID:yup.string().required("Eyes Color Is Required!"),
    uxBodyHeightCM:yup.string().required("Body Height by (CM) Is Required!"),
    uxCode:yup.string().optional().default(""),
    axFullAddress: yup.string().required("Address Is Required!"),
    axPrimaryMobile: yup.string().required("Phone Number Is Required!"),
    ucaDurationTypeID: yup.string().required("Passport Duration Is Required!"),
    ucaPaymentTypeID: yup.string().required("Applicant Age Is Required!"),
    axLocationID: yup.string().required("Province Is Required!"),
    });

    try {
      schema.validateSync({...data});
      return {status: 'success', data: {...data}};
    } catch (error) {
      return {status: 'failure', message: error.errors[0]}
    }
}
