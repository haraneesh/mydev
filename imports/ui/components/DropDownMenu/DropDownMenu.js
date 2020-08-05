import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  DropdownButton, MenuItem, Button, Row,
} from 'react-bootstrap';
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

    margin-top:1rem;
    margin-bottom:1rem;

    #dropdown-basic, .btn-group, .dropdown-menu {
        width: 100%;
    }
`;

const TabViewStyles = styled.div`
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    z-index: var(--stick-zIndex);

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
        <DropdownButton
          bsStyle="info"
          title={`Show ${title} `}
          id="dropdown-basic"
        >
          {
          menuItemKeys.map((el) => (
            <MenuItem
              className="text-center"
              key={menuItems[el].name}
              eventKey={menuItems[el].name}
              onClick={() => { initializeNewCategory(); history.push(`/recipes/bycategory/${menuItems[el].name}`); }}
            >
              {menuItems[el].displayName}
            </MenuItem>
          ))
        }
        </DropdownButton>
      </DropDownStyles>
    ) : (
      <TabViewStyles>
        <Row className="text-center">
          <h3>
            {menuItemKeys.map((el) => (
              <Button
                bsStyle="link"
                key={menuItems[el].name}
                className={(selectedItemKey === menuItems[el].name) ? 'activeTab' : ''}
                onClick={() => { initializeNewCategory(); history.push(`/recipes/bycategory/${menuItems[el].name}`); }}
              >
                {menuItems[el].displayName}
              </Button>
            ))}
          </h3>
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
