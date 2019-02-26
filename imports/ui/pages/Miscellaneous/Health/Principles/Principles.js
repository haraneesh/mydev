import React from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';
import VegetableRecommendation from "./VegetableRecommendations";
import WholeGrainsDetails from './WholeGrainsDetails';
import './Principles.scss';

const Principles = () => (
  <div className="Principles">
    <div className="Page">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="PageHeader">
            <div className="PageHeader-container">
              <h3>Organic Whole Food Plant Based Diet, Low in Sugar and Fat <br/>
              <small>Let food be thy medicine</small>
              </h3>
            </div>
          </div>
          <div className="Content">
            <section className="text-center page-section">
              <div className="Introduction font-serif">
              <blockquote>
                <p>
                <em> 80% of heart disease, stroke and diabetes, 40% of cancer can be prevented<sup>1</sup></em><br/>
                <footer>World Health Organization</footer>
                </p>
                </blockquote>
                </div>
              </section>

                <section className="text-center organic page-section">
                 <h3>Unadultrated Organic Food</h3>
                <p> 
                  Unadultrated Organic food certainly helps in making the food we eat safe from the harms of pesticides and chemical additives.
                  There are several research findings that corroborate that. There are many such studies in support of Unadultrated, Organic food.<sup>19,20,21,22</sup>.
                </p>
                <p>
                  But <b> junk food, processed and refined food</b> is still <b>bad and unhealthy</b> even it is made from Organic ingredients. 
                </p>
                </section>

              <section className="text-center exercise page-section">
              <h3>Exercise, Sleep and Stress</h3>
              <p>
                  Science has known this literally for decades,<sup>2</sup> that proper diet, physical activity and sleep, 
                  could cut prevailing overall rates of chronic disease by an astounding 80<sup>3</sup> percent. Diet is salient among them and there
                   is a vast, diverse, globally unbiased and consistent literature that supports it<sup>24</sup>.
                </p>
                <p> While Regular physical exercise, Adequate sleep and Mitigating stress are must for healthy living, they <b>cannot </b> 
                  circumvent the ill effects of <b>bad diet and bad food</b>.
                </p>
              </section>

              <section className="personalFood text-center">
              <h3> You are Unique just like Everyone Else </h3>
              <p>
                Your genes and so your biology, your life style and emotional state determine how you respond 
                to food and everything else you encounter. A comprehensive research published<sup>23</sup> in the journal CELL 
                found that people metabolize the same foods in very different ways.
               </p>
               <p> Does a grandparent need the same food as a child? Does a sedentary office worker require the same 
                diet as an athlete? <b>NO</b>.</p>
              <p> 
                So we recommend that you approach your body and dietary path with open-mind, with curiosity. The recommendations below supported by
                peer reviewed scientific literature is meant to clear the noise and show the direction. We hope that you follow the direction and make personal 
                choices to reach your destination.
              </p>
              </section>

              <section className="basicFood text-center">
                <h3>Eat real food. Mostly plants.</h3>
                <p>
                  The food that is good for us is the one we are adapted to. That is the food our parents had and their 
                  parents before that had and their parents before that too. The food that they ate helped them thrive and that
                  is why we are here today. 
                </p>
                <p>
                  Fresh, whole foods that are grown and produced sustainably and that are minimally processed (if they are processed at all) is best food for us. 
                  On this, there is an agreement with nearly every scientist and research organization in the world.
                </p>
                <dl>
                  <dd> Dr David L. Katz, MD, MPH, FACPM, FACP, FACLM</dd>
                  <dd> is the founding director (1998) 
                      of Yale University’s Yale-Griffin Prevention Research Center, Past-President of 
                      the American College of Lifestyle Medicine gives a talk on HealthFul Eating.
                  </dd>
                </dl>
                <div className='embed-container'>
                  <iframe src="https://player.vimeo.com/video/178986447" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                </div>
                <p>
                </p>
                </section>

                <section className = "text-center">
                  <h3> Healthy Diet is a theme<br/><small>An emphasis on eating</small></h3>
                  <blockquote> 
                  <p> 
                     Whole food <b>(Un processed or minimally processed or Unrefined)</b> food
                     ,mostly plants <b>( variety of organic vegetables, fruits, pulses, whole grains, nuts and seeds ) </b>
                      with plenty of <b>water</b> for thirst. 
                  
                    <br/>
                    This can be supplemented with <b>moderate</b> addition of dairy, eggs, fish, seafood and lean meat.
                  
                </p>
                </blockquote>
            </section>

            <section className = "text-center">
              <h3>Whole Food for Balance</h3>
              <p>
                Every food has several Nutritients. If we focus on eating a variety of  organic whole-food, 
                plant-based diet we will do ourselves a world of good, instead of trying to optimize for every 
                individual nutrient in food. Plant-based foods have rich nutrient profile along with lot of fiber and water. 
                That will ensure that our bodies get the nourishment and that we do not eat excess calories.
              </p>
              <p>
                When we start eating processed and refined food for a nutrients, we tend to ignore that the food has only that one thing
                and everything else is junk such as fillers or preservatives and other foreign substances. This junk can at worse be harmful
                and at minimum be useless to our body.
                </p>
                <p>
                Similarly Modern “diet” sold as convenient food or fast food or finger food and so on, is engineered
                to be addictive<sup>8</sup> and has high concentration of refined sugar, salts, starch and fats with little or no fiber and 
                other nutrition.
              </p>
              <p> Real foods on the other hand don’t tend to stimulate addiction. They provide more nutrition than calories. 
                  This means that when you eat them, it’s easier to feel full and deeply satisfied while eating “not too much.”
              </p>
            </section>
            <section className = "text-center">
                <h3> Food Sources versus Nutrients</h3>
                <p>
                  Consuming food for a specific nutrients whilst not considering the other properties of the food may not give us the expected benefit.
                </p>
                <p>
                  Harvard researchers did a study in 2010 looking at dietary sources of protein<sup>5</sup> and the risk of cardiovascular 
                  disease in women. The biggest benefit was for those who substituted a daily serving of beans or nuts for a serving of red meat.
                </p>
                <p> 
                  Similarly not all fats are the same. Fats from different sources have different types and percentage of fatty acids. In moderation 
                  Fatty acids from nuts, seeds and vegetable sources are better than fats from animal sources. However certain fishes (sardines, mackarels and anchovies), 
                  like flax seeds have Omega 3 fatty which is an essential fat.<sup>6</sup>.
                </p>
                <p>
                  Similarly carbohydrates from whole grains and plants are considered to be beneficial<sup>7</sup> while 
                  carbohydrates from refined, processed and engineered sources are considered addictive and very 
                  bad to the overall wellbeing<sup>9</sup>.
                </p>
                <p>
                  No food is a single nutrient and benefits come from eating food as whole. It is important learn which food as a whole is good 
                  for us and consume it rather consume for a specific nutrient.
                </p>
            </section>
            <section className="text-center page-section">
              <h3>Basic framework of healthy eating</h3>
              <p>
                World Health Organization<sup>12</sup> and several countries(US<sup>13</sup> , UK<sup>14</sup> , Australia<sup>15</sup> , Canada<sup>16</sup> ) release their recommendations on healthy 
                eating. All of these recommendations endorse the same broad theme, which is to eat a variety of real food, 
                mostly plants and in appropriate proportions.
              </p>
              <p>
                Below is a representation of these recommendations by Canadian Government.
              </p>
              <p>
                <img src="/healthprinciples/canada_plate.png" alt="Health Plate" className="img-responsive" />
              </p>
            </section>
            <section className="text-center page-section">
                <div>
                   <p> There is <b>no</b> one super food that can compensate for a bad diet be it Broccoli or Quinoa or anything else. To live a healthy life we 
                     have to eat from a variety of whole foods( vegetables, fruits, grains pulses, nuts ) in the appropriate proportions.
                   </p>
                </div>
                <div class="guide-foods text-left">
                  <h3> Vegetables </h3>
                  <p> Based on their nutrient content, vegetables are organized into 5 subgroups: 
                    <ul>
                      <li>Dark green vegetables</li>
                      <li>Starchy vegetables</li>
                      <li>Red and Orange vegetables</li>
                      <li>Beans and Peas</li>
                      <li>others</li>
                    </ul>
                    </p>
                    <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p> For an adult the minimum recommendations is to 
                      <ul>
                        <li> Load up on Vegetables as much as possible. Try to eat across all the vegetables groups in a week</li>
                        <li> Eat atleast 3 cups vegetables per day</li>
                      </ul>
                    </p>

                    <h3> Fruits </h3>
                  
                    <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p>
                      <ul>
                        <li> A variety of whole fruits according to season</li>
                        <li> Eat atleast 2 cups of fruit per day if you are an adult</li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      Home made fruit juice when consumed without added sugar or without filtering out the fibre is acceptable and does count.
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li>
                          Avoid <b>fruit juice</b> bought from store. Most of them have a low percentage of actual fruit and inturn contain added sugar, fillers, artificial colors and preservatives.
                      The fibre that you benefit from is missing from this.
                        </li>
                      </ul>
                      
                    </p>

                    <h3> Healthy Grains </h3>
                    <p> India is blessed with a variety of whole grains. Their Nutritional profile is listed below just so you know how nutritious they are. </p>
                    <p><WholeGrainsDetails /></p>
                    <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p>
                      <ul>
                        <li> A variety of whole grains</li>
                        <li> Try to keep your maximum intake to about 1/4th of your food.</li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      <ul>
                        <li>Limit refined grains, like white rice and white bread, because the body rapidly turns them into blood sugar.</li>
                        <li>Grains not local and part of traditional diet such as Quinoa.</li>
                      </ul>
                       
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      Processed and manufactured products such as snacks, sugar coated cereals, cakes etc.
                    </p>

                    <h3>Healthy Proteins </h3>
                    <p> Proteins are necessary for repairing and building up our bodies and tissue. A very common misonception is that meat is the
                      only source of protein. That is not true, there are good vegetable sources that can give adequate proteins that we need.
                    </p>
                    <em>
                      Beans are the corner stone of every blue zone diet<sup>17</sup>. Some recommend that we eat pulses on a daily basis.
                    </em>
                    <p>
                    <ul>
                      <li> Toor Dal, Moong Dal, Channa Dal, Urad Dal, Masoor Dal </li> 
                      <li> Chick Peas, Brown Chickpeas, Rajma, Adzuki beans (Chori) </li>
                      <li> Green Peas, Black eyed peas </li>
                      <li> Nuts - (Peanuts, Almonds, walnuts, pecans, pistachios, cashews, and pine nuts ) </li>
                      <li> Seeds - Sesame Seeds, Chia Seeds, Sunflower seeds and Pumpkin Seeds</li>
                      <li> Soy, Tofu </li>
                      <li> Poultry and Eggs </li>
                      <li> Fish </li>
                    </ul>
                    </p>
                    <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p>
                      <ul>
                        <li> A variety of Pulses daily </li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      <ul>
                        <li> Fish - Eat small quantities of smaller fish such as sardines, anchovies, mackarels. They have lesser mercury exposure </li> 
                        <li> Eggs and Poultry - Eat in small quantities and not more than 2 or 3 servings a week</li>
                        <li> Snack on a Mix of Nuts about 2 handful and not more</li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li>
                          Any <b> Processed meats,</b> Pork and Red meat.
                        </li>
                        <li> Protein Bars and Health bars with list of unrecognizable ingredients</li>
                      </ul>
                    </p>


                    <h3>Dairy</h3>
                    <p>
                       Dairy has its place in our diet in moderate quantities. However consuming full fat milk excessively for 
                       health benefit is not advisable.
                    </p>
                    <p>
                      There is a high possibility of adulteration. The use of antibiotics and growth harmones to get higher yield is 
                      fairly common. When possible get milk from a known organic source.  
                    </p>
                    <p>
                      If the reason for Dairy is calcium, calcium is also widely available in a variety of whole seeds, plants and fruits. Sesame Seeds, Flax seeds, Rajma, Orange, 
                      Broccoli, Spinach and Beet greens are some rich sources of calcium.
                    </p>
                    <p>
                      To absorb calcium, Vitamin D is necessary. Do take a walk in the sun. The best time pan India seems to be 
                      between 11AM to 1PM.
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      <ul>
                        <li> Tea, Coffee </li>
                        <li> Youghurt which is a good source of probiotics and a good alternative to icecream </li>
                        <li> Buttermilk which is good source of probiotics and calcium without the fat</li>
                        <li> Cheese, Cottage Cheese (Paneer) </li>
                        <li> Ghee for cooking and as a dressing </li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li>
                          Any <b> sweetened, artificially flavored milk</b> in cartons
                        </li>
                      </ul>
                    </p>

                    <h3>Oils and Fat </h3>
                    <p> 
                      Omega 3 fatty acids are necessary to the human body. Try to consume food that has this.
                      Otherwise in general avoid deep fried food and limit oil consumption. 
                    </p>
                    <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p>
                      <ul>
                        <li> For Omega 3 Fatty Acids - Soybeans, Walnuts, Chia Seeds, Flax seeds </li>
                        <li> For Omega 3 Fatty Acids - Fatty fish such as Mackerels, Sardines and Anchovies </li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      <ul>
                        <li> Cold pressed oils from plant sources (Olive, Sesame oil, Peanut oil)</li>
                        <li> Coconut oil has high percentages of saturated fat so use very little </li>
                        <li> Ghee has high smoke point, can be had in moderation</li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li> Avoid deep fried foods </li>
                        <li> Vanaspati, Dalda and other Trans Fat</li>
                        <li> Refined oils in general </li>
                        <li> Palmoil, although it is plant source has very high percentage of Saturated Fat</li>
                        <li> Oils from animal sources, such as lard, animal fat, butter and ghee </li>
                      </ul>
                    </p>

                    <h3>For Thirst</h3>
                    <p> 
                      Drink plenty of water to satiate thirst. There is no equivalent.
                    </p>
                    <p><Glyphicon glyph="alert" className="text-warning" /> Enjoy in Moderation </p> 
                    <p>
                      <ul>
                        <li>Green Tea and Dark Coffee</li>
                        <li>If would like to add milk to coffee, tea then limit it to 1 or 2 servings</li>
                      </ul>
                    </p>
                    <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li> Avoid Coke, Pepsi and other carbonated sugar loaded drinks</li>
                        <li> Avoid Diet versions of those as well, they have same chemicals or sometimes more</li>
                      </ul>
                    </p>
                 </div>
              </section>
              <section className="Summary">
              <h3> To Summarize </h3>
              <p><Glyphicon glyph="heart" className="text-primary" /> Enjoy </p> 
                    <p>
                      <ul>
                        <li> Whole Vegetables </li>
                        <li> Whole Fruits </li>
                        <li> Whole Grains </li>
                        <li> Pulses </li>
                        <li> Whole Nuts and Seeds - In moderate quantities  </li>
                        <li> Whole grain flours - In moderate quantities </li>
                      </ul>
                  </p>
              <p><Glyphicon glyph="ban-circle" className="text-danger" /> Avoid </p> 
                    <p>
                      <ul>
                        <li> Transfat and Hydrogenated oils </li>
                        <li> Sugar </li>
                        <li> Processed Foods that have Ingredient names you do not know </li>
                        <li> Refined flour (Maida, White flour)</li>
                        <li> Refined grains (White rice, white pasta)</li>
                        <li> Soft Drinks (Coke, Pepsi and others) </li>
                      </ul>
                </p>        
              </section>
            <section className="References">
              <h3>REFERENCES</h3>
              <ul className="references"> 
                <li>
                  <a href="https://www.who.int/chp/chronic_disease_report/part1/en/index11.html">
                   <small>1. WHO - 80% chronic diseases can be prevented.</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.ncbi.nlm.nih.gov/pubmed/8411605">
                  <small>2. Actual causes of death in the United States.</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.ncbi.nlm.nih.gov/pubmed/19667296">
                  <small>3. Healthy living is the best revenge.</small>
                  </a>
                </li>
                <li>
                <a href="https://www.nytimes.com/2007/01/28/magazine/28nutritionism.t.html">
                  <small>4. Unhappy Meals - Newyork Times 2007</small>
                  </a>
                </li>
                <li>
                   <a href="https://www.ahajournals.org/doi/abs/10.1161/circulationaha.109.915165">
                    <small>5. Major Dietary Protein Sources and Risk of Coronary Heart Disease in Women</small>
                   </a>
                </li>
                <li>
                  <a href="https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fat/art-20045550">
                    <small>6. Dietary fats: Know which types to choose</small>
                  </a>
                </li>
                <li>
                  <li>
                    <a href="https://www.ncbi.nlm.nih.gov/pubmed/16864756">
                    <small>7. Comparison of 4 diets of varying glycemic load on weight loss and cardiovascular risk reduction in overweight and obese young adults: a randomized controlled trial.</small>
                    </a>
                  </li>
                  <li> <a href="https://www.theguardian.com/commentisfree/2017/aug/29/food-addiction-processed-drugs-addictive">
                  <small>
                    8. Stop calling food addictive - Processed foods are full of highly engineered additives.
                  </small>
                </a>
                </li>
                <li> <a href="https://www.nytimes.com/2017/11/07/well/eat/could-you-be-allergic-to-additives-in-food-or-drugs.html">
                  <small>9. Could You Be Allergic to Additives in Food or Drugs? </small>
                </a>
                </li>
                  <a href="https://www.ncbi.nlm.nih.gov/pubmed/9989963">
                    <small>
                      10. Mediterranean diet, traditional risk factors, and the rate of cardiovascular complications after myocardial infarction: final report of the Lyon Diet Heart Study.
                    </small>
                  </a>
                </li>
                <li>
                  <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet">
                    <small>11. WHO (World Health Organization) - Healthy diet</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.choosemyplate.gov">
                    <small>12. USDA - United States Deparment of Agriculture - Eating Healthy </small>
                  </a>
                </li>
                <li>
                  <a href="https://www.nhs.uk/live-well/eat-well/the-eatwell-guide/">
                    <small>13. UK - The Eatwell Guide</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.eatforhealth.gov.au">
                    <small>14. Australian Dietary Guidelines</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.healthycanadians.gc.ca/eating-nutrition/healthy-eating-saine-alimentation/tips-conseils/interactive-tools-outils-interactifs/eat-well-bien-manger-eng.php">
                    <small>15. Canada - Build a healthy meal</small>
                  </a>
                </li>
                <li>
                  <a href="https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2434738">
                  <small>
                    16. Mediterranean Diet and Invasive Breast Cancer Risk Among Women at High Cardiovascular Risk in the PREDIMED Trial
                  </small>
                  </a>
                </li>
                <li>
                  <a href="https://www.bluezones.com/recipes/food-guidelines/">
                  <small>
                    17. Blue Zone Diets
                  </small>
                  </a>
                </li>
                <li>
                  <a href="https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2707948">
                  <small>
                    18. Association of Frequency of Organic Food Consumption With Cancer Risk
                  </small>
                  </a>
                </li>
                <li>
                  <a href="https://jamanetwork.com/journals/jamainternalmedicine/article-abstract/2707943">
                  <small>
                    19. Organic Foods for Cancer Prevention—Worth the Investment?
                  </small>
                  </a>
                </li>
                <li>
                  <a href="http://pediatrics.aappublications.org/content/125/6/e1270">
                  <small>
                    20. Attention-Deficit/Hyperactivity Disorder and Urinary Metabolites of Organophosphate Pesticides
                  </small>
                  </a>
                </li>
                <li>
                  <a href="https://jamanetwork.com/journals/jamainternalmedicine/article-abstract/2707948">
                  <small>21. Association of Frequency of Organic Food Consumption With Cancer Risk</small>
                  </a>
                </li> 
                <li>
                  <a href="http://www.chennaicorporation.gov.in/departments/health/adulteration.htm">
                  <small>22. Adulteration In Food Stuff And Its Harmful Effects</small>
                  </a>
                </li>
                <li>
                  <a href="https://www.ncbi.nlm.nih.gov/pubmed/26590418">
                  <small>23. Personalized Nutrition by Prediction of Glycemic Responses</small>
                  </a>
                </li>
                <li>
                  <a href="https://jamanetwork.com/journals/jama/fullarticle/188274">
                  <small>24. Intensive Lifestyle Changes for Reversal of Coronary Heart Disease</small>
                  </a>
                </li>

              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Principles;
