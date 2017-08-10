import $ from 'jquery';
import 'jquery-validation';

$.validator.addMethod('indiaMobilePhone', function indiaMobile(value, element) {
  // ^     #Match the beginning of the string
  // [789] #Match a 7, 8 or 9
  // \d    #Match a digit (0-9 and anything else that is a "digit" in the regex engine)
  // {9}   #Repeat the previous "\d" 9 times (9 digits)
  // $     #Match the end of the string
  return this.optional(element) || /^[789]\d{9}$/.test(value);
});

export default (form, options) => $(form).validate(options);
