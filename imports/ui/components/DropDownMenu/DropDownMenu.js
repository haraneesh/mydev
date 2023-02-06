import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import constants from '../../../modules/constants';

function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

const DropDownStyles = styled.div`
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    z-index: var(--stick-zIndex);

    #dropdown-basic, .btn-group, .dropdown-menu {
        min-width: 100%;
    }
`;

const TabViewStyles = styled.div`
    margin-top:1rem;
    margin-bottom:1rem;

    .activeTab{
      border-bottom: 2px var(--brand-primary) solid;
    }

`;

const DropDownMenu = ({
  menuItems, menuItemKeys, selectedItemKey, initializeNewCategory, title, history,
}) => {
  const size = useWindowSize();

  return ((constants.ScreenWidths.ipad.width > size.width)
    ? (
      <DropDownStyles>
        <Dropdown>
          <Dropdown.Toggle
            id="dropdown-cat"
            variant="primary"
            className="btn-block"
          >
            {`${title} `}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {
          menuItemKeys.map((el) => {
            if (menuItems[el].name !== selectedItemKey) {
              return (
                <Dropdown.Item
                  className="text-left"
                  key={menuItems[el].name}
                  onClick={() => { initializeNewCategory(menuItems[el].name); history.push(`/recipes/bycategory/${menuItems[el].name}`); }}
                >
                  {menuItems[el].displayName}
                </Dropdown.Item>
              );
            }
          })
        }
          </Dropdown.Menu>
        </Dropdown>
      </DropDownStyles>
    ) : (
      <TabViewStyles>
        <Row className="d-flex justify-content-center">
          <h4>
            {menuItemKeys.map((el) => (
              <Button
                className="px-2"
                variant="link"
                key={menuItems[el].name}
                className={(selectedItemKey === menuItems[el].name) ? 'activeTab' : ''}
                onClick={() => { initializeNewCategory(menuItems[el].name); history.push(`/recipes/bycategory/${menuItems[el].name}`); }}
              >
                {menuItems[el].displayName}
              </Button>
            ))}
          </h4>
        </Row>
      </TabViewStyles>
    )
  );
};

DropDownMenu.defaultProps = {
  title: 'All',
};

DropDownMenu.propTypes = {
  title: PropTypes.string,
  menuItems: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default DropDownMenu;
