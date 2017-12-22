import React from 'react';
import { Panel, Col, Glyphicon } from 'react-bootstrap';
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
    this.onFocus = this.onFocus.bind(this);
  }

  onsearchStringChange() {
    const searchValue = this.searchBox.value;

    this.setState({
      searchString: searchValue,
    });
  }

  onFocus() {
    this.props.onFocus();
  }

  informProductUnavailability() {
    return (<Col xs={12}>
      <p>
        OOps! We are not able to find what you are looking for. You could try a different spelling or browse for it in the lists below.
    </p> </Col>);
  }

  clear() {
    this.setState({
      searchString: '',
    });
  }

  render() {
    const { searchString } = this.state;
    const searchResults = (searchString !== '' && searchString.length > 2) ?
        (this.props.getProductsMatchingSearch(searchString, 8)) : '';

    return (
      <div className="productOrderSearch">
        <Panel
          header={
            (
              <div className="input-group productSearchInp">
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search & Order"
                  value={this.state.searchString}
                  onChange={this.onsearchStringChange}
                  ref={searchBox => (this.searchBox = searchBox)}
                  onFocus={this.onFocus}
                />
                <span className="input-group-addon">
                  <Glyphicon glyph="remove" onClick={this.clear} />
                </span>
              </div>
            )}
        >
          { searchString !== '' && searchResults }
          { searchResults && searchResults.length === 0 && this.informProductUnavailability()}
        </Panel>
      </div>
    );
  }
}

ProductSearch.propTypes = {
  getProductsMatchingSearch: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default ProductSearch;
