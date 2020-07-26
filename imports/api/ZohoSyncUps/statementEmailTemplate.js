const statementEmail = {
  subject: zhGeneratedDate => (`Suvai - Your statement generated on ${zhGeneratedDate}`),
  body: ({ salutation, firstName, startDate, endDate }) => (`Dear ${salutation} ${firstName},
  
    Good Morning!
  
      Thank you for being part of Suvai. Thank you for helping us grow this community of like minded people.
  
      As requested, I have attached with this email a list of all your transactions with Suvai for the period of ${startDate} to ${endDate}.   
   
    Thank you,
    Divya
  `),
};

export default statementEmail;
