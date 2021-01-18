import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Col, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';

import './ProductSearch.scss';

class ProductSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
    };
    this.onsearchStringChange = this.onsearchStringChange.bind(this);
    this.clear = this.clear.bind(this);
    this.onLostFocus = this.onLostFocus.bind(this);
  }

  onsearchStringChange() {
    const searchValue = this.searchBox.value;

    this.setState({
      searchString: searchValue,
    });
  }

  onLostFocus(e) {
    e.preventDefault();
    this.saveSearchString();
  }

  saveSearchString() {
    const { searchString } = this.state;
    Meteor.call('search.captureSearchString', searchString);
  }

  clear() {
    this.saveSearchString();
    this.setState({
      searchString: '',
    });
  }

  informProductUnavailability() {
    return (
      <Col xs={12}>
        <p>
          Oops! We are not able to find what you are looking for.
          You could try a different spelling or browse for it in the lists below.
        </p>
      </Col>
    );
  }

  render() {
    const { searchString } = this.state;
    const searchResults = (searchString !== '' && searchString.length > 2)
      ? (this.props.getProductsMatchingSearch(searchString, 8)) : '';

    return (
      <div className="productOrderSearch">
        <div className="panel panel-default" style={{ marginBottom: '0px' }}>
          <div className="panel-heading">
            <div className="input-group productSearchInp">
              <input
                className="form-control"
                type="text"
                placeholder="Search & Order"
                value={this.state.searchString}
                onChange={this.onsearchStringChange}
                onBlur={this.onLostFocus}
                ref={(searchBox) => (this.searchBox = searchBox)}
              />
              <span className="input-group-addon">
                <Glyphicon glyph="remove" onClick={this.clear} />
              </span>
            </div>
          </div>
          {searchString !== '' && (
          <div className="panel-body">
            { searchResults }
            { searchResults && searchResults.length === 0 && this.informProductUnavailability()}

          </div>
          )}
        </div>

      </div>
    );
  }
}

ProductSearch.propTypes = {
  getProductsMatchingSearch: PropTypes.func.isRequired,
};

export default ProductSearch;
