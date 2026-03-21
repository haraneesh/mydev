import React, { useEffect, useState } from 'react';
import Flickity from 'flickity';
import 'flickity/dist/flickity.min.css';
import './FarmAccordion.scss';

function FarmAccordion() {
  const [flky, setFlky] = useState();

  useEffect(() => {
    const newFlky = new Flickity('#cc2', {
      // options, defaults listed

      accessibility: true,
      // enable keyboard navigation, pressing left & right keys

      prevNextButtons: true,

      adaptiveHeight: false,
      // set carousel height to the selected slide

      autoPlay: 7000,
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

      dragThreshold: 0,
      // number of pixels a user must scroll horizontally to start dragging
      // increase to allow more room for vertical scroll for touch devices

      freeScroll: true,
      // enables content to be freely scrolled and flicked
      // without aligning cells

      groupCells: false,
      // group cells together in slides

      initialIndex: 2,
      // zero-based index of the initial selected cell

      lazyLoad: false,
      // enable lazy-loading images
      // set img data-flickity-lazyload="src_new.jpg"
      // set to number to load images adjacent cells

      percentPosition: false,
      // sets positioning in percent values, rather than pixels
      // Enable if items have percent widths
      // Disable if items have pixel widths, like images

      pageDots: false,
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
    <div className="carousel-farm">
      <div id="cc2" className="carousel">
        <div className="carousel-cell">
          <img src="about/farm/1.jpg?v1" alt="Organic Rice Farm" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/2.jpg?v1" alt="Long Beans" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/3.jpg?v1" alt="Cow shed" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/4.jpg?v1" alt="Jeevamruth" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/5.jpg?v1" alt="Broccholi" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/6.jpg?v1" alt="Ready to Sow" />
        </div>
        <div className="carousel-cell">
          <img src="about/farm/7.jpg?v1" alt="Mother Hen and Chicks" />
        </div>
      </div>
    </div>
  );
}

export default FarmAccordion;
