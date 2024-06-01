import React from 'react';
import { Meteor } from 'meteor/meteor';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Icon from '../../Icon/Icon';

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

  onsearchClick() {
    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
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
    if (searchString) {
      Meteor.call('search.captureSearchString', searchString);
    }
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
      ? (this.props.getProductsMatchingSearch(searchString /* , 8 */)) : '';

    return (
      <div className="productOrderSearch border-bottom">
        <div className="mb-0 justify-content-center card">
          <div className="card-header">
            <div className="input-group px-sm-5">
              <input
                className="form-control"
                type="text"
                placeholder="Search & Order"
                value={this.state.searchString}
                onClick={this.onsearchClick}
                onChange={this.onsearchStringChange}
                onBlur={this.onLostFocus}
                ref={(searchBox) => (this.searchBox = searchBox)}
              />
              <button className="btn btn-primary input-group-text" type="button" onClick={this.clear}>
                <Icon icon="close" type="mt" />
              </button>
            </div>
          </div>

          {searchString !== '' && (
          <div className="row card-body">
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
