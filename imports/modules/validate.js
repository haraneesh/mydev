export const formValChange = (e, isErrorState, fieldValues) => {
  const { name, value } = e.target;
  const indiaMobilePhoneRegExp = RegExp(/^[6789]\d{9}$/);
  const isEmailAddressRegExp = RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const isMoneyInRupees = RegExp(/^\d+(\.\d{1,2})?$/); //    (?:\d+|\d{1,2},(?:\d{2},)*\d{3})(?:\.\d{2})?$/

  const isError = { ...isErrorState };

  const trimmedVal = value.trim();

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
      isError[name] = (trimmedVal.length > 0 && trimmedVal.length < 6)
        ? 'atleast 6 characters required'
        : '';
      break;
    case name === 'newPassword' || name === 'confirmPassword':
      isError[name] = (trimmedVal.length > 0 && trimmedVal.length < 6)
        ? 'atleast 6 characters required'
        : '';

      isError.confirmPassword = (fieldValues.confirmPassword === fieldValues.newPassword)
      || (fieldValues.confirmPassword === fieldValues.password)
        ? ''
        : 'two passwords do not match, please check';
      break;

    case name === 'name':
      isError.name = trimmedVal.length < 1
        ? 'first name should be atleast 4 characters long'
        : '';
      break;

    case name === 'firstName':
      isError.firstName = trimmedVal.length < 1
        ? 'first name should be atleast 4 characters long'
        : '';
      break;
    case name === 'lastName':
      isError.lastName = trimmedVal.length < 1
        ? 'last name should be atleast 4 characters long'
        : '';
      break;
    case name === 'whMobilePhone':
      isError.whMobilePhone = indiaMobilePhoneRegExp.test(trimmedVal)
        ? ''
        : 'India mobile number appears to be invalid';
      break;
    case name === 'deliveryAddress':
      isError.deliveryAddress = trimmedVal.length < 1
        ? 'delivery address is required'
        : '';
      break;
    case name === 'dietPreference':
      isError.dietPreference = trimmedVal.length < 1
        ? 'dietary preference is mandatory'
        : '';
      break;
    default:
      break;
  }

  return ({
    isError,
  });
};

export const formValid = ({ isError, ...rest }) => {
  let isValid = false;

  Object.values(isError).forEach((val) => {
    if (val.length > 0) {
      isValid = false;
    } else {
      isValid = true;
    }
  });

  Object.values(rest).forEach((val) => {
    if (val === null) {
      isValid = false;
    } else {
      isValid = true;
    }
  });

  return isValid;
};
