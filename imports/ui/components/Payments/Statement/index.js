import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import processHTMLTable from './processZohoHTML';
import Spinner from '../../Common/Spinner/Spinner';
import constants from '../../../../modules/constants';
import Loading from '../../Loading/Loading';

const periodSelector = (name, displayValue, selectFunction) => (
  <Col xs={6} sm={4}>
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        id={name}
        value={name}
        name="periodSelect"
        onClick={() => { selectFunction(name); }}
      />
      <label className="form-check-label" htmlFor={name}>{`${displayValue}`}</label>
    </div>
  </Col>
);

const ShowStatement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [statement, setStatement] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');

  const setPeriod = (period) => {
    setPeriodSelected(period);
  };

  const getStatement = () => {
    setIsLoading(true);
    setStatement('');
    Meteor.call('customer.getStatement', {
      periodSelected,
    }, (error, retMessage) => {
      setIsLoading(false);
      if (error) {
        toast.error(error.reason);
      } else if (retMessage.message !== 'success') {
        toast.error(retMessage.message);
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = retMessage.data.html_string;
        const p = processHTMLTable(tempDiv, periodSelected);
        setStatement(p);
      }
    });
  };

  return (
    <div>
      <Card className="p-3">
        <h4 className="mb-3">
          Statement is a consolidated view of all your transactions with Suvai.
        </h4>

        <div>
          <Row>
            { Object.keys(constants.StatementPeriod).map((period) => (
              periodSelector(
                constants.StatementPeriod[period].name,
                constants.StatementPeriod[period].display_value,
                setPeriod,
              )
            ))}
          </Row>

          <Button
            onClick={getStatement}
            disabled={!!isLoading}
            className="mt-3"
          >
            Get Statement
            {(isLoading) && <Spinner />}
          </Button>

        </div>

        {!!isLoading && (<Loading />)}
      </Card>
      {statement}
    </div>
  );
};

export default ShowStatement;
