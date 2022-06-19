import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../../components/Loading/Loading';
import ProductsOrderSpecialsMain from '../../../components/Orders/ProductOrderSpecialsMain/ProductOrderSpecialsMain';

import './OrderSpecials.scss';

const OrderSpecials = ({
  loading, match, history, loggedInUserId,
}) => (!loading ? (
  <div className="OrderSpecials">
    <div className="page-header clearfix">
      <h3 className="page-header">Suvai Specials</h3>
      <ProductsOrderSpecialsMain match={match} history={history} loggedInUserId={loggedInUserId} />
    </div>
  </div>
) : <Loading />);

OrderSpecials.propTypes = {
  loading: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
};

export default OrderSpecials;
