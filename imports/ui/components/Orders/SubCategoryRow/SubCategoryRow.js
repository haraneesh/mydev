import React, { useEffect, useRef, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';

const MIN_TAB_WIDTH = 112;
const MORE_MENU_WIDTH = 86;

const SubCategoryRow = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const rowRef = useRef(null);

  const updateVisibleCount = () => {
    if (!rowRef.current) return;

    const rowWidth = rowRef.current.clientWidth;
    const fullRowCount = Math.floor(rowWidth / MIN_TAB_WIDTH);

    if (fullRowCount >= items.length) {
      setVisibleCount(items.length);
      return;
    }

    const availableWidth = rowWidth - MORE_MENU_WIDTH;
    const nextVisibleCount = Math.max(
      2,
      Math.floor(availableWidth / MIN_TAB_WIDTH),
    );

    setVisibleCount(Math.min(items.length, nextVisibleCount));
  };

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [items]);

  const visibleIndexes = items
    .slice(0, visibleCount)
    .map((item, index) => index);

  if (
    activeIndex >= visibleCount &&
    visibleIndexes.length > 0 &&
    visibleCount < items.length
  ) {
    visibleIndexes[visibleIndexes.length - 1] = activeIndex;
  }

  const visibleIndexSet = new Set(visibleIndexes);
  const hiddenIndexes = items
    .map((item, index) => index)
    .filter((index) => !visibleIndexSet.has(index));

  const handleSelect = (index) => {
    setActiveIndex(index);
    items[index].onClick();
  };

  return (
    <div className="subCategoryPriorityRow" ref={rowRef}>
      <div className="subCategoryPriorityTabs">
        {visibleIndexes.map((index) => (
          <Nav.Item className="subCategoryPriorityItem" key={items[index].key}>
            <Nav.Link
              className={activeIndex === index ? 'active' : ''}
              onClick={() => handleSelect(index)}
            >
              <span>{items[index].label}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </div>

      {hiddenIndexes.length > 0 && (
        <Dropdown align="end" className="subCategoryMore">
          <Dropdown.Toggle id="sub-category-more" variant="link">
            More
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {hiddenIndexes.map((index) => (
              <Dropdown.Item
                active={activeIndex === index}
                key={items[index].key}
                onClick={() => handleSelect(index)}
              >
                {items[index].label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
};

export default SubCategoryRow;
