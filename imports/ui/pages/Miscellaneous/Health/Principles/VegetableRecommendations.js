import React from 'react';

const VegetableRecommendations = () => (
  <div>
    <div className="swipe" style="color: grey">
      Swipe to see the full table.&nbsp;false
    </div>
    <div height="100px" overflow-x="auto">
&nbsp;
    </div>
    <div style="overflow-x: auto;">
      <table border="1" cellPadding="1" cellSpacing="1" className="collapsible table-striped table-bordered" style="width: 95%;">
        <thead>
          <tr>
            <th colSpan="7" scope="col">
              Weekly Vegetable Subgroup Table
            </th>
          </tr>
          <tr>
            <th colSpan="2" scope="col">&nbsp;</th>
            <th colSpan="5" rowSpan="1" scope="col">
              Amount per Week
            </th>
          </tr>
          <tr>
            <th colSpan="2" scope="col">&nbsp;</th>
            <th scope="col">Dark green vegetables</th>
            <th scope="col">Red and orange vegetables</th>
            <th scope="col">Beans and peas</th>
            <th scope="col">Starchy vegetables</th>
            <th scope="col">Other vegetables</th>
          </tr>
        </thead>
        <tbody>
          <tr />
          <tr>
            <th rowSpan="2" scope="row">
              <strong>Children</strong>
            </th>
            <td>2-3&nbsp;yrs&nbsp;old</td>
            <td>½ cup</td>
            <td>2 ½ cups</td>
            <td>½ cup</td>
            <td>2 cups</td>
            <td>1 ½ cups</td>
          </tr>
          <tr>
            <td>4-8&nbsp;yrs&nbsp;old</td>
            <td>1 cup</td>
            <td>3 cups</td>
            <td>½ cup</td>
            <td>3 ½ cups</td>
            <td>2 ½ cups</td>
          </tr>
          <tr>
            <th rowSpan="2" scope="row"><strong>Girls</strong></th>
            <td>9-13&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>4 cups</td>
            <td>1 cup</td>
            <td>4 cups</td>
            <td>3 ½ cups</td>
          </tr>
          <tr>
            <td>14-18&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>5 ½ cups</td>
            <td>1 ½ cups</td>
            <td>5 cups</td>
            <td>4 cups</td>
          </tr>
          <tr>
            <th rowSpan="2" scope="row"><strong>Boys</strong></th>
            <td>9-13&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>5 ½ cups</td>
            <td>1 ½ cups</td>
            <td>5 cups</td>
            <td>4 cups</td>
          </tr>
          <tr>
            <td>14-18&nbsp;yrs&nbsp;old</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>5 cups</td>
          </tr>
          <tr>
            <th rowSpan="3" scope="row"><strong>Women</strong></th>
            <td>19-30&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>5 ½ cups</td>
            <td>1 ½ cups</td>
            <td>5 cups</td>
            <td>4 cups</td>
          </tr>
          <tr>
            <td>31-50&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>5 ½ cups</td>
            <td>1 ½ cups</td>
            <td>5 cups</td>
            <td>4 cups</td>
          </tr>
          <tr>
            <td>51+&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>4 cups</td>
            <td>1 cup</td>
            <td>4 cups</td>
            <td>3 ½ cups</td>
          </tr>
          <tr>
            <th rowSpan="3" scope="row"><strong>Men</strong></th>
            <td>19-30&nbsp;yrs&nbsp;old</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>5 cups</td>
          </tr>
          <tr>
            <td>31-50&nbsp;yrs&nbsp;old</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>2 cups</td>
            <td>6 cups</td>
            <td>5 cups</td>
          </tr>
          <tr>
            <td>51+&nbsp;yrs&nbsp;old</td>
            <td>1 ½ cups</td>
            <td>5 ½ cups</td>
            <td>1 ½ cups</td>
            <td>5 cups</td>
            <td>4 cups</td>
          </tr>
        </tbody>

      </table>
    </div>

  </div>
);

export default VegetableRecommendations;
