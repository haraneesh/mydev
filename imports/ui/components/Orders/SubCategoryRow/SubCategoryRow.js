import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownButton, Row, Col } from 'react-bootstrap';

const SubCategoryRow = ({ items }) => {
    const [visibleCount, setVisibleCount] = useState(3); // Start with 3 visible items


    // Standard breakpoints for responsiveness (Bootstrap style)
  const breakpoints = {
    sm: 576,  // Small screen (phones)
    md: 768,  // Medium screen (tablets)
    lg: 992,  // Large screen (small desktops)
    xl: 1200, // Extra large screen (large desktops)
    xxl: 1400, // Extra extra large screen (ultra-wide monitors)
  };

  // Function to determine how many items should be shown based on the screen width
  const getItemsPerRow = (windowWidth) => {
    if (windowWidth <= breakpoints.sm) {
      return 2; // Show 2 items on small screens (mobile)
    } else if (windowWidth <= breakpoints.md) {
      return 4; // Show 4 items on medium screens (tablets)
    } else if (windowWidth <= breakpoints.lg) {
      return 5; // Show 5 items on large screens (small desktops)
    } else if (windowWidth <= breakpoints.xl) {
      return 6; // Show 6 items on extra large screens (large desktops)
    } else if (windowWidth <= breakpoints.xxl) {
      return 7; // Show 7 items on very large screens (ultra-wide monitors)
    } else {
      return 9;
    }
  };

    // Function to update visible count based on row width
    const updateVisibleCount = () => {
        const maxVisibleCount = getItemsPerRow(window.innerWidth);
        setVisibleCount(maxVisibleCount);
    
    };

    useEffect(() => {
        
        window.addEventListener('resize', updateVisibleCount);
        updateVisibleCount();
        return () => {
            // if (t) clearTimeout(t);
            window.removeEventListener('resize', updateVisibleCount); 
        }
        
    }, [items]);

    const visibleItems = items.slice(0, visibleCount);
    const hiddenItems = items.slice(visibleCount);

    return (
        <Row className="align-items-center w-100" style={{marginTop: '-10px'}}>
            {visibleItems.map((item, index) => (
                <Col key={index}>
                    <div className="text-truncate">
                        {item}
                    </div>
                </Col>
            ))}
            {hiddenItems.length > 0 && (
                <Col>
                    <DropdownButton
                        id="dropdown-basic-button"
                        title={`+ ${hiddenItems.length} more`}
                    >
                        {hiddenItems.map((item, index) => (
                            <Dropdown.Item key={index}>
                                {item}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Col>
            )}
        </Row>
    );
};

export default SubCategoryRow;
