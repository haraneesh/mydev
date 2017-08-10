import React from 'react';
import { Row, Col } from 'react-bootstrap';

import './Vision.scss';

const Vision = () => (
  <div className="Vision">
    <div className="Page">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="PageHeader">
            <div className="PageHeader-container">
              <h3>We are trying to make Living Healthy Effortless</h3>
            </div>
          </div>
          <div className="Content">
            <section className="text-center page-section">
              <div className="Introduction font-serif">
                <p>
                  Healthy food is a must for healthy life.</p>
                <p>
                  At the grocery store when we
                   pick something up do we know whether the food is of high quality?

                  The way in which food is grown and is distributed today is
                   complicated. There are too players in the supply chain. It is
                   impossible to trust and make good healthy choices for our families.
                  </p>
                <p><em>We want to change that.</em></p>
                <p>
                  Change is not easy, changing the the entire system is difficult. 
                  But together, we can change this for us few. 
                  Together we can make it easy and effortless for our families to consume healthy food 
                  that nourishes and replenishes us. 
                </p>
              </div>
            </section>
            <section className="text-center mission-bar">
              <Row>
                <Col xs={6} sm={3}>
                  1.
                  <div className="mission-text">
                  Revive Organic Farming
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                   2.
                  <div className="mission-text">
                  Avoid Middle Men
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                   3.
                  <div className="mission-text">
                  Promote Balanced Diet
                  </div>
                </Col>
                <Col xs={6} sm={3}>
                   4.
                  <div className="mission-text">
                  Cook Tasty Meals
                  </div>
                </Col>
              </Row>
            </section>
            <section className="text-center page-section">
              <h3>1. Revive Organic Farming</h3>
              <p>We start at the source. Farming healthy food sustainably is paramount. </p>
              <p>Use of chemicals, pesticides and preservatives is a very new practice which is impacting our wellbeing. It has crept in to our ways slowly. We have failed to notice it until recently. </p>
              <p>Farming is an age old problem. Our ancestors have perfected it severals years back and have practiced them for hundred of centuries. We only have to look a few decades back to learn of these sustainable practices.</p> 
              <p>All the produce here that is available is truely organic because it is either grown organically by us in our farms or comes from partnering farmer friends whom we have carefully vetted.</p>
              <p><img src="/vision/field.jpg" alt="Farmer" className="img-responsive" /></p>
            </section>
            <section className="text-center page-section">
              <h3>2. Avoid Middle Men </h3>
              <p>To get most from our food we have to eat it fresh. Shortening the supply chain is only way to maintain genuine freshness.</p>
              <p>We are pioneering several approaches, that deliver fresher, high-quality food from the farm directly to you, avoiding long and wasteful detours at costly grocery stores.</p>
              <p>Since there are NO preservatives, if the food is not fresh you can tell.</p>
            </section>
            <section className="text-center page-section">
              <h3>3. Promote Balanced Diet</h3>
              <p>To maintaing good health and to feel our best, Eating a healthy, balanced diet is necessary. Keeping track of the diet and ensuring that we feed our families with food containing appropriate proportions of macro and micro nutrients is very hard. We are trying that easy by rotating the food available in the week and by introducing seasonal food.</p>
              <p>We are proud that all the produce is devoid of pesticides, preservative and artificial coloring and any chemical agents that are harmful.</p>
              <p><img src="/vision/balanced-diet.jpg" alt="Variety" className="img-responsive" /></p>
            </section>
            <section className="text-center page-section">
              <h3>4. Cook Tasty Meals</h3>
              <p>Unless the food is tasty, our kids will not eat.</p>
              <p>We are trying to make it very easy to prepare dishes that not only have fresh and healthy ingredients but are tasty too. We are building a source of carefully curated and trusted recipes, sharing cooking tips and believe in the power of community to recommend & share the ones that they really like, to help others in journey to adopt and savor healthy food.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Vision;
