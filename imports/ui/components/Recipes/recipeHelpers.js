/* eslint-disable camelcase */
import React from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';

export const getRecipeNutrientValues = (ingredients) => {
  const retValue = {
    Water_g: 0,
    Energ_Kcal: 0,
    Protein_g: 0,
    Lipid_Tot_g: 0,
    Ash_g: 0,
    Carbohydrt_g: 0,
    Fiber_TD_g: 0,
    Sugar_Tot_g: 0,
    Calcium_mg: 0,
    Iron_mg: 0,
    Magnesium_mg: 0,
    Phosphorus_mg: 0,
    Potassium_mg: 0,
    Sodium_mg: 0,
    Zinc_mg: 0,
    Copper_mg: 0,
    Manganese_mg: 0,
    Selenium_ug: 0,
    Vit_C_mg: 0,
    Thiamin_mg: 0,
    Riboflavin_mg: 0,
    Niacin_mg: 0,
    Panto_Acid_mg: 0,
    Vit_B6_mg: 0,
    Folate_Tot_ug: 0,
    Folic_Acid_ug: 0,
    Food_Folate_ug: 0,
    Folate_DFE_ug: 0,
    Choline_Tot_mg: 0,
    Vit_B12_ug: 0,
    Vit_A_IU: 0,
    Vit_A_RAE: 0,
    Retinol_ug: 0,
    Alpha_Carot_ug: 0,
    Beta_Carot_ug: 0,
    Beta_Crypt_ug: 0,
    Lycopene_ug: 0,
    Lut_Zea_ug: 0,
    Vit_E_mg: 0,
    Vit_D_ug: 0,
    Vit_D_IU: 0,
    Vit_K_ug: 0,
    FA_Sat_g: 0,
    FA_Mono_g: 0,
    FA_Poly_g: 0,
    Cholestrl_mg: 0,
  };

  ingredients.forEach((ingredient) => {
    const { Water_g = 0,
                Energ_Kcal = 0,
                Protein_g = 0,
                Lipid_Tot_g = 0,
                Ash_g = 0,
                Carbohydrt_g = 0,
                Fiber_TD_g = 0,
                Sugar_Tot_g = 0,
                Calcium_mg = 0,
                Iron_mg = 0,
                Magnesium_mg = 0,
                Phosphorus_mg = 0,
                Potassium_mg = 0,
                Sodium_mg = 0,
                Zinc_mg = 0,
                Copper_mg = 0,
                Manganese_mg = 0,
                Selenium_ug = 0,
                Vit_C_mg = 0,
                Thiamin_mg = 0,
                Riboflavin_mg = 0,
                Niacin_mg = 0,
                Panto_Acid_mg = 0,
                Vit_B6_mg = 0,
                Folate_Tot_ug = 0,
                Folic_Acid_ug = 0,
                Food_Folate_ug = 0,
                Folate_DFE_ug = 0,
                Choline_Tot_mg = 0,
                Vit_B12_ug = 0,
                Vit_A_IU = 0,
                Vit_A_RAE = 0,
                Retinol_ug = 0,
                Alpha_Carot_ug = 0,
                Beta_Carot_ug = 0,
                Beta_Crypt_ug = 0,
                Lycopene_ug = 0,
                Lut_Zea_ug = 0,
                Vit_E_mg = 0,
                Vit_D_ug = 0,
                Vit_D_IU = 0,
                Vit_K_ug = 0,
                FA_Sat_g = 0,
                FA_Mono_g = 0,
                FA_Poly_g = 0,
                Cholestrl_mg = 0 } = ingredient.Nutrition;

    retValue.Water_g += Water_g;
    retValue.Energ_Kcal += Energ_Kcal;
    retValue.Protein_g += Protein_g;
    retValue.Lipid_Tot_g += Lipid_Tot_g;
    retValue.Ash_g += Ash_g;
    retValue.Carbohydrt_g += Carbohydrt_g;
    retValue.Fiber_TD_g += Fiber_TD_g;
    retValue.Sugar_Tot_g += Sugar_Tot_g;
    retValue.Calcium_mg += Calcium_mg;
    retValue.Iron_mg += Iron_mg;
    retValue.Magnesium_mg += Magnesium_mg;
    retValue.Phosphorus_mg += Phosphorus_mg;
    retValue.Potassium_mg += Potassium_mg;
    retValue.Sodium_mg += Sodium_mg;
    retValue.Zinc_mg += Zinc_mg;
    retValue.Copper_mg += Copper_mg;
    retValue.Manganese_mg += Manganese_mg;
    retValue.Selenium_ug += Selenium_ug;
    retValue.Vit_C_mg += Vit_C_mg;
    retValue.Thiamin_mg += Thiamin_mg;
    retValue.Riboflavin_mg += Riboflavin_mg;
    retValue.Niacin_mg += Niacin_mg;
    retValue.Panto_Acid_mg += Panto_Acid_mg;
    retValue.Vit_B6_mg += Vit_B6_mg;
    retValue.Folate_Tot_ug += Folate_Tot_ug;
    retValue.Folic_Acid_ug += Folic_Acid_ug;
    retValue.Food_Folate_ug += Food_Folate_ug;
    retValue.Folate_DFE_ug += Folate_DFE_ug;
    retValue.Choline_Tot_mg += Choline_Tot_mg;
    retValue.Vit_B12_ug += Vit_B12_ug;
    retValue.Vit_A_IU += Vit_A_IU;
    retValue.Vit_A_RAE += Vit_A_RAE;
    retValue.Retinol_ug += Retinol_ug;
    retValue.Alpha_Carot_ug += Alpha_Carot_ug;
    retValue.Beta_Carot_ug += Beta_Carot_ug;
    retValue.Beta_Crypt_ug += Beta_Crypt_ug;
    retValue.Lycopene_ug += Lycopene_ug;
    retValue.Lut_Zea_ug += Lut_Zea_ug;
    retValue.Vit_E_mg += Vit_E_mg;
    retValue.Vit_D_ug += Vit_D_ug;
    retValue.Vit_D_IU += Vit_D_IU;
    retValue.Vit_K_ug += Vit_K_ug;
    retValue.FA_Sat_g += FA_Sat_g;
    retValue.FA_Mono_g += FA_Mono_g;
    retValue.FA_Poly_g += FA_Poly_g;
    retValue.Cholestrl_mg += Cholestrl_mg;
  });

  return retValue;
};

const innerRowStyle = {
  marginLeft: '-10px',
  magrinRight: '0px',
};

const displayNutSummaryCell = (label, value, unit, width) => (
  <Col xs={width}>
    <Row className="text-muted" style={innerRowStyle}>
      <small>
        {label}
      </small>
    </Row>
    <Row style={innerRowStyle}>
      {`${Math.round(value * 100) / 100} ${unit}`}
    </Row>
  </Col>
);

const rowStyle = {
  marginBottom: '1em',
};

export const ShowNutritionSummary = ({ ingredients }) => {
  const nutrients = getRecipeNutrientValues(ingredients);
  return (
    <Row className="nutritionRow" style={rowStyle}>
      { displayNutSummaryCell('FAT', nutrients.Lipid_Tot_g, 'g', 3) }
      { displayNutSummaryCell('FIBER', nutrients.Fiber_TD_g, 'g', 3) }
      { displayNutSummaryCell('CARB', nutrients.Carbohydrt_g, 'g', 3) }
      { displayNutSummaryCell('PRO', nutrients.Protein_g, 'g', 3) }
    </Row>
  );
};

const ShowRecipeTags = (typeOfFood, width) => (
  <Col xs={width}>
    <Row className="text-muted">
      <small> TYPE </small>
    </Row>
    <Row>
      {typeOfFood}
    </Row>
  </Col>
);

const DisplayEffortSummaryCell = (iconName, value, width) => (
  <Col xs={width}>
    <Row className="text-muted" style={innerRowStyle}>
      <Glyphicon glyph={iconName} />
    </Row>
    <Row style={innerRowStyle}>
      {value}
    </Row>
  </Col>
);

export const ShowEffortSummary = ({ cookingLevel, cookingTimeInMins, serves, typeOfFood }) => (
  <Row className="effortRow" style={innerRowStyle}>
    { /* ShowRecipeTags(typeOfFood, 3) */ }

    { DisplayEffortSummaryCell('cutlery', typeOfFood, 3) }
    { DisplayEffortSummaryCell('time', `${cookingTimeInMins} Mins`, 3) }
    { DisplayEffortSummaryCell('user', `${serves} Pers`, 3) }
    { DisplayEffortSummaryCell('education', cookingLevel, 3) }

  </Row>
);
