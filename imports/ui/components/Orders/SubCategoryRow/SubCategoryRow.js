import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';

const MIN_TAB_WIDTH = 112;
const MORE_MENU_WIDTH = 86;

const SubCategoryRow = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const rowRef = useRef(null);
  const measurementRef = useRef(null);
  const itemMeasurementRefs = useRef([]);
  const moreMeasurementRef = useRef(null);
  const animationFrameRef = useRef(null);

  const updateVisibleCount = useCallback(() => {
    if (!rowRef.current) return;

    const rowWidth = rowRef.current.clientWidth;
    if (rowWidth <= 0) return;

    const measuredItemWidths = items.map((item, index) => {
      const itemElement = itemMeasurementRefs.current[index];
      return itemElement
        ? itemElement.getBoundingClientRect().width
        : MIN_TAB_WIDTH;
    });

    const totalItemsWidth = measuredItemWidths.reduce(
      (totalWidth, itemWidth) => totalWidth + itemWidth,
      0,
    );

    if (totalItemsWidth <= rowWidth) {
      setVisibleCount(items.length);
      return;
    }

    const moreWidth = moreMeasurementRef.current
      ? moreMeasurementRef.current.getBoundingClientRect().width
      : MORE_MENU_WIDTH;
    const availableWidth = rowWidth - moreWidth;
    let nextVisibleCount = 0;
    let usedWidth = 0;

    measuredItemWidths.some((itemWidth) => {
      if (usedWidth + itemWidth > availableWidth) {
        return true;
      }

      usedWidth += itemWidth;
      nextVisibleCount += 1;
      return false;
    });

    setVisibleCount(Math.min(items.length, Math.max(1, nextVisibleCount)));
  }, [items]);

  useLayoutEffect(() => {
    const scheduleUpdate = () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        updateVisibleCount();
      });
    };
    scheduleUpdate();

    const rowElement = rowRef.current;
    const measurementElement = measurementRef.current;
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleUpdate)
      : null;

    if (resizeObserver && rowElement) {
      resizeObserver.observe(rowElement);
    }

    if (resizeObserver && measurementElement) {
      resizeObserver.observe(measurementElement);
    }

    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [updateVisibleCount]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [activeIndex, items.length]);

  const visibleIndexes = items
    .slice(0, visibleCount)
    .map((item, index) => index);

  if (
    activeIndex < items.length &&
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
      <div
        aria-hidden="true"
        className="subCategoryPriorityMeasurement"
        ref={measurementRef}
      >
        {items.map((item, index) => (
          <div
            className="subCategoryPriorityItem"
            key={item.key}
            ref={(element) => {
              itemMeasurementRefs.current[index] = element;
            }}
          >
            <button className="nav-link" tabIndex={-1} type="button">
              <span>{item.label}</span>
            </button>
          </div>
        ))}
        <div className="subCategoryMore" ref={moreMeasurementRef}>
          <button
            className="dropdown-toggle btn btn-link"
            tabIndex={-1}
            type="button"
          >
            More
          </button>
        </div>
      </div>

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
