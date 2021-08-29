import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import {
  Row, Col, Panel,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import processHTMLTable from './processZohoHTML';
import Spinner from '../../Common/Spinner/Spinner';
import constants from '../../../../modules/constants';
import Loading from '../../Loading/Loading';

const periodSelector = (name, displayValue, selectFunction) => (
  <Col xs={6} sm={4} className="rowTopSpacing">
    <div>
      <input
        type="radio"
        id={name}
        value={name}
        name="periodSelect"
        onClick={() => { selectFunction(name); }}
      />
      <label htmlFor={name}>{`${displayValue}`}</label>
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
      <Panel style={{ padding: '1rem' }}>
        <h4>
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
          <Row className="buttonRowSpacing">
            <button
              type="button"
              className="btn btn-default"
              onClick={getStatement}
              disabled={!!isLoading}
            >
              Get Statement
              {' '}
              {(isLoading) && <Spinner />}
            </button>
          </Row>
        </div>

        {!!isLoading && (<Loading />)}
      </Panel>
      {statement}
    </div>
  );
};

export default ShowStatement;
