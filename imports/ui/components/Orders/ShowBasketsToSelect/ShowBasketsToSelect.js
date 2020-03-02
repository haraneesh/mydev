import React, { Fragment, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Button } from 'react-bootstrap';

const ShowBasketsToSelect = ({ history, basketLists, onBasketSelect, onEmptyCartSelect }) => {

    const handleSelectPrefillBasket = (basketId) => {
        history.push(`/neworder/${basketId}`);
    }

    const handleStartEmpty = () => {
        history.push('/neworder');
    }

    return (
        <Row>
            <section className="page-header">
                <Col sm={6} smOffset={3} xs={10} xsOffset={1}>
                    <Button className="btn-block" onClick={handleStartEmpty}>Start With Empty Cart </Button>
                </Col>
            </section>

            <span className="panel-body text-center" style={{ display: 'block', marginBottom: '0px' }}> OR </span>

            <div className="panel panel-default">
                <div className="panel-heading text-center" style={{ borderBottomWidth: '0px' }}>
                    <h5> Pick a Basket to Prefill </h5>
                </div>
                <Col xs={12} className="panel panel-default">
                    {basketLists.map(element => (
                        <div className="panel-body">
                            <Col xs={8}><p>{element.name}</p></Col>
                            <Col xs={4} className="noMarginNoPadding text-right">
                                <Button className="btn-primary btn-sm" onClick={() => handleSelectPrefillBasket(element._id)}>
                                    Prefill
                                </Button>
                            </Col>
                        </div>
                    ))}
                </Col>
            </div>

        </Row >
    );

};

ShowBasketsToSelect.propTypes = {
    basketLists: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
};

export default ShowBasketsToSelect;