export const formValChange = (e, isErrorState, fieldValues) => {
  const { name, value } = e.target;
  const indiaMobilePhoneRegExp = RegExp(/^[6789]\d{9}$/);
  const isEmailAddressRegExp = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
  const isMoneyInRupees = RegExp(/^\d+(\.\d{1,2})?$/); //    (?:\d+|\d{1,2},(?:\d{2},)*\d{3})(?:\.\d{2})?$/

  const isError = { ...isErrorState };

  const trimmedVal = value ? value.trim() : '';
  const isIndiaPincode = RegExp(/^[1-9][0-9]{5}$/);
  const isLatitude = RegExp(/^\d+(\.\d+)?$/);
  const isLongitude = RegExp(/^\d+(\.\d+)?$/);

  switch (true) {
    case name === 'amountToChargeInRs':
      isError[name] = isMoneyInRupees.test(trimmedVal)
        ? ''
        : 'amount can only be in one of these formats (1234 or 1234.56)';
      break;
    case name === 'emailAddress':
      isError.emailAddress = isEmailAddressRegExp.test(trimmedVal)
        ? ''
        : 'email address seems invalid';
      break;
    case name === 'password':
      isError[name] =
        trimmedVal.length < 6
          ? 'password has to be atleast 6 characters required'
          : '';
      break;
    case name === 'newPassword' || name === 'confirmPassword':
      isError[name] =
        trimmedVal.length < 6
          ? 'password has to be atleast 6 characters required'
          : '';

      isError.confirmPassword =
        fieldValues.confirmPassword === fieldValues.newPassword ||
        fieldValues.confirmPassword === fieldValues.password
          ? ''
          : 'two passwords do not match, please check';
      break;

    case name === 'name':
      isError.name =
        trimmedVal.length < 5
          ? 'first name should be atleast 4 characters long'
          : '';
      break;

    case name === 'firstName':
      isError.firstName =
        trimmedVal.length < 5
          ? 'first name should be atleast 4 characters long'
          : '';
      break;
    case name === 'lastName':
      isError.lastName =
        trimmedVal.length < 5
          ? 'last name should be atleast 4 characters long'
          : '';
      break;
    case name === 'otp':
      isError.otp = trimmedVal.length !== 4 ? 'OTP is a 4 digit value' : '';
      break;
    case name === 'deliveryPincode':
      isError.deliveryPincode = !isIndiaPincode.test(trimmedVal)
        ? 'pincode has to have 6 digits only'
        : '';
      break;
    case name === 'whMobilePhone' || name === 'confirmWhMobileNumber':
      isError.whMobilePhone = indiaMobilePhoneRegExp.test(trimmedVal)
        ? ''
        : 'India mobile number appears to be invalid, mobile number is 10 digits long';

      isError.confirmWhMobileNumber =
        fieldValues &&
        fieldValues.confirmWhMobileNumber &&
        fieldValues.confirmWhMobileNumber !== fieldValues.whMobilePhone
          ? 'Mobile numbers entered are not the same'
          : '';
      break;
    case name === 'deliveryAddress':
      isError.deliveryAddress =
        trimmedVal.length < 1 ? 'delivery address is required' : '';
      break;
    case name === 'eatingHealthyMeaning':
      isError.eatingHealthyMeaning =
        trimmedVal.length < 1
          ? 'You are never wrong, tell us what is in your mind'
          : '';
      break;
    case name === 'dietPreference':
      isError.dietPreference =
        trimmedVal.length < 1 ? 'Dietary preference is mandatory' : '';
      break;
    case name === 'deliveryAddressLongitude':
      isError.deliveryAddressLongitude = isLongitude.test(trimmedVal)
        ? ''
        : 'Longitude value seems invalid, please provide a valid longitude value';
      break;
    case name === 'deliveryAddressLatitude':
      isError.deliveryAddressLatitude = isLatitude.test(trimmedVal)
        ? ''
        : 'Latitude value seems invalid, please provide a valid latitude value';
      break;
    default:
      break;
  }

  return {
    isError,
  };
};

export const formValid = ({ isError }) => {
  let isValid = false;

  isValid = Object.values(isError).every((val) => {
    if (val.length > 0) {
      return false;
    }
    return true;
  });

  return isValid;
};
