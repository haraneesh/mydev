import $ from 'jquery';
import 'jquery-validation';

$.validator.addMethod('indiaMobilePhone', function indiaMobile(value, element) {
  // ^     #Match the beginning of the string
  // [6789] #Match a 6, 7, 8 or 9
  // \d    #Match a digit (0-9 and anything else that is a "digit" in the regex engine)
  // {9}   #Repeat the previous "\d" 9 times (9 digits)
  // $     #Match the end of the string
  return this.optional(element) || /^[6789]\d{9}$/.test(value);
});

$.validator.addMethod('isMoneyInRupees', function isMoneyInRupees(value, element) {
  return this.optional(element) || /^(?:\d+|\d{1,2},(?:\d{2},)*\d{3})(?:\.\d{2})?$/.test(value);
});

export default (form, options) => $(form).validate(options);
