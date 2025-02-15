import React, { useEffect, useState } from 'react';
import Flickity from 'flickity';
import 'flickity/dist/flickity.min.css';
import './HomePageSlider.scss';

function HomePageSlider() {
  const [flky, setFlky] = useState();

  useEffect(() => {
    const newFlky = new Flickity('#cc1', {
      // options, defaults listed

      accessibility: true,
      // enable keyboard navigation, pressing left & right keys

      prevNextButtons: false,

      adaptiveHeight: false,
      // set carousel height to the selected slide

      autoPlay: 15000,
      // advances to the next cell
      // if true, default is 15 seconds
      // or set time between advances in milliseconds
      // i.e. `autoPlay: 1000` will advance every 1 second

      cellAlign: 'center',
      // alignment of cells, 'center', 'left', or 'right'
      // or a decimal 0-1, 0 is beginning (left) of container, 1 is end (right)

      cellSelector: undefined,
      // specify selector for cell elements

      contain: false,
      // will contain cells to container
      // so no excess scroll at beginning or end
      // has no effect if wrapAround is enabled

      draggable: false,
      // enables dragging & flicking
      // if at least 2 cells

      dragThreshold: 3,
      // number of pixels a user must scroll horizontally to start dragging
      // increase to allow more room for vertical scroll for touch devices

      freeScroll: true,
      // enables content to be freely scrolled and flicked
      // without aligning cells

      groupCells: false,
      // group cells together in slides

      initialIndex: 0,
      // zero-based index of the initial selected cell

      lazyLoad: false,
      // enable lazy-loading images
      // set img data-flickity-lazyload="src.jpg"
      // set to number to load images adjacent cells

      percentPosition: false,
      // sets positioning in percent values, rather than pixels
      // Enable if items have percent widths
      // Disable if items have pixel widths, like images

      pageDots: true,
      // create and enable page dots

      resize: true,
      // listens to window resize events to adjust size & positions

      rightToLeft: false,
      // enables right-to-left layout

      setGallerySize: false,
      // sets the height of gallery
      // disable if gallery already has height set with CSS

      watchCSS: false,
      // watches the content of :after of the element
      // activates if #element:after { content: 'flickity' }

      wrapAround: true,
      // at end of cells, wraps-around to first for infinite scrolling

      selectedAttraction: 0.1,
      friction: 1,

    });

    setFlky(newFlky);
  }, []);

  return (
    <div className="carousel-health py-4">
      <h1 className="py-2">
        Greatest wealth is health
      </h1>
      <div id="cc1" className="carousel pb-2">
        <div className="carousel-cell">
          <img src="about/feedingx640.jpg?v5" alt="Feeding a baby" />
          <h7> Kids deserve the best </h7>
        </div>
        <div className="carousel-cell">
          <img src="about/exercisex640.jpg?v5" alt="Exercise" />
          <h7> Take charge of your health </h7>
        </div>
        <div className="carousel-cell">
          <img src="about/grandparentx640.jpg?v5" alt="Grandparent" />
          <h7> Happy family is a healthy family </h7>
        </div>
        {/* <div className="carousel-cell">
          <img src="about/farmx640.jpg?v1" alt="Organic Farm" />
          <h7> Preserve Nature, Sustainable Farming </h7>
        </div>
      */}
      </div>
    </div>
  );
}

export default HomePageSlider;
