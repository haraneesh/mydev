import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import Row from 'react-bootstrap/Row';
import PageHeader from '../../components/PageHeader/PageHeader';
import Content from '../../components/Content/Content';

const Page = ({ title, subtitle, content }) => (
  <div className="Page card p-2">
    <Row>
      <PageHeader title={title} subtitle={subtitle} />
      <Content content={content} />
    </Row>
  </div>
);

Page.defaultProps = {
  subtitle: '',
};

Page.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  content: PropTypes.string.isRequired,
};

const pageContent = new ReactiveVar('');

export default withTracker(({ content, page }) => {
  window.scrollTo(0, 0); // Force window to top of page.

  Meteor.call('utility.getPage', page, (error, response) => {
    if (error) {
      console.warn(error);
    } else {
      pageContent.set(response);
    }
  });

  return {
    content: content || pageContent.get(),
  };
})(Page);
