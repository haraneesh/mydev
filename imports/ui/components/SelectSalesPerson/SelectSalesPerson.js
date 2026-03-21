import { Meteor } from 'meteor/meteor';
import React from 'react';
function SelectSalesPerson({
  selectedSalesPerson,
  onSelectSalesPersonChange,
  showMandatoryFields,
}) {
  const salesPersonList = Meteor.settings.public.salesPersons;
  const handleChange = (event) => {
    const selectedId = event.target.value;
    const selectedPerson = salesPersonList.find(
      (person) => person.salesperson_zoho_id === selectedId.trim(),
    );
    onSelectSalesPersonChange(selectedPerson);
    // You can also perform other actions here when selection changes
    //console.log('Selected Name:', event.target.value);
  };

  return (
    <div className="row">
      <div className="offset-sm-2 mb-3 col-sm-8 col-12">
        <h4>
          <label htmlFor="salesPersonSelect" className="my-2">
            Sales Person
          </label>
        </h4>

        <select
          id="salesPersonSelect"
          value={selectedSalesPerson}
          onChange={handleChange}
          className="form-select"
        >
          {salesPersonList.map((person, index) => (
            <option
              key={person.salesperson_zoho_id}
              value={person.salesperson_zoho_id}
            >
              {person.salesperson_zoho_name}
            </option>
          ))}
        </select>
        {showMandatoryFields && (
          <span className="text-danger"> Select a salesperson </span>
        )}
      </div>
    </div>
  );
}

export default SelectSalesPerson;
