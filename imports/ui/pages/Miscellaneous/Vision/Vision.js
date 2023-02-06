import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Vision.scss';

const Vision = () => (
  <div className="Vision px-3 pb-5">
    <div className="card">
      <div className="p-3">
        <div>

          <h3 className="text-center">We are Making Living Healthy a little more easy</h3>

          <div className="Content">
            <section className="text-center page-section">
              <div className="Introduction font-serif">
                <p>
                  Healthful food is a must for a healthy life.
                </p>
                <p>
                  At the grocery store when we
                  pick something up, can we trust that food to be of high quality?

                  Today, the way in which food is grown and is distributed, is complicated. It goes through many different
                  hands in the supply chain and the entire process is opaque. It is
                  impossible to trust and make good healthy choices for our families.
                </p>
                <p><em>We want to change that.</em></p>
                <p>
                  {' '}
                  We want to make the process transparent and
                  convenient to consume tasty and nutritious food that nourishes and replenishes us.
                  Change is not easy, changing the the entire system is next to impossible.
                  But together, we can change this for us few.
                </p>
              </div>
            </section>
            <section className="text-center mission-bar">
              <Row>
                <Col xs={6} sm={3}>
                  1.
                  <div className="mission-text">
                    Support Organic & Sustainable Farming
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  2.
                  <div className="mission-text">
                    Get Fresh, Direct From Farm
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  3.
                  <div className="mission-text">
                    Promote Variety & Tasty Food
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                  4.
                  <div className="mission-text">
                    Learn from Each Other
                  </div>
                </Col>
              </Row>
            </section>
            <section className="text-center page-section">
              <h3>1. Support Organic and Sustainable Farming</h3>
              <p>We start at the source. Farming healthful food sustainably is paramount.</p>
              <p>
                The unfettered use of synthetic fertilizers, chemical pesticides and artificial
                preservatives is a relatively new development in our history.
                But, as we learn more about the side-effects and after-effects of these substances,
                we realise that for what we gain in short term, we lose more in the long term.

              </p>
              <p>
                Traditional farming practices are sustainable as they have been practiced and improved upon,
                over hundreds of years.

              </p>
              <p>
                All of our produce comes from our farms or from growers we have carefully vetted.
                We work with farmers who follow sustainable and natural farming practices.
                We look to our past to relearn traditional practices that are suitable to our unique
                environment. Rather than shunning modern advances altogether,
                our farmer community learns and adapts them to achieve our sustainability goals.

              </p>

              <p>
                We are proud to say that all the produce have zero pesticides,
                preservative and artificial coloring and any chemical agents that are harmful.

              </p>

              <p><img className="figure-img img-fluid rounded" src="/vision/field.jpg" alt="Farmer" /></p>
            </section>
            <section className="text-center page-section">
              <h3>2. Get Fresh, Direct From Farm </h3>
              <p>To get most from our food we have to eat it fresh.</p>

              <p>
                Modern supermarkets demand shelf life, uniformity, and ease of handling, over freshness, nutrition and taste.
                Produce is picked before it is ripe so that it can withstand passing through the hands of many middlemen.
                It is often colored, is treated and artificially preserved to give the appearance of freshness.

              </p>

              <p>
                We do not do any of this and yet keep our food fresh. The only way to do this is by shortening the supply chain
                and get the produce directly from the farmer. We are pioneering several approaches, that deliver fresher, high-quality food from
                the farm directly to you, avoiding long and wasteful detours at costly grocery stores.

              </p>

              <p>At Suvai, our produce reaches you on the same day of the harvest. When you bite in to it, you will know the difference.</p>

            </section>
            <section className="text-center page-section">
              <h3>3. Promote Eating a Variety of Tasty Food </h3>
              <p>To maintain good health and to feel our best, eating a tasty and healthy balanced diet is necessary. </p>
              <p>
                Ensuring that we feed our families healthful food that has the necessary proportions of macro
                and micro nutrients and to prepare them delicious to taste is very hard.

              </p>
              <p>
                We are making it easy by sharing delicious recipes, cooking tips and by giving you a choice
                to select from a variety of seasonal and wholesome produce.
                {' '}

              </p>

              <p><img className="figure-img img-fluid rounded" src="/vision/balanced-diet.jpg" alt="Variety" /></p>
            </section>
            <section className="text-center page-section">
              <h3>4. Learn from each other, Namma Suvai community</h3>

              <p>
                {' '}
                We started as a community of friends who were in search of ways to feed our families healthful food.
                Every action from there on including products on offer was a suggestion, an idea or recommendations from the community.

              </p>

              <p>
                {' '}
                We have grown since and today, ours is a community of Young parents, Senior citizens, Working professionals, Home Makers, Farmers, Experts,
                Nutrionists, Chefs, thinkers and doers who are bound by the simple idea of living a healthy life through sustainable practices.

              </p>

              <p>
                {' '}
                We realize that without the passionate community, we would not be here today. So we are fully
                committed to continue building a strong and vibrant community on which each of us can lean on for tips,
                suggestions, recommendations and inspiration.
                {' '}

              </p>

            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Vision;
