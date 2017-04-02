/* eslint-disable no-undef */

import { browserHistory } from 'react-router';
import { Bert } from 'meteor/themeteorchef:bert';
import { upsertRecipe } from '../api/recipes/methods.js';
import './validation.js';

let component;

const handleUpsert = () => {
  const { recipe } = component.props;
  const confirmation = recipe && recipe._id ? 'Recipe updated!' : 'Recipe added!';
  const upsert = {
    title: document.querySelector('[name="title"]').value.trim(),
    body: document.querySelector('[name="body"]').value.trim(),
  };

  if (recipe && recipe._id) upsert._id = recipe._id;

  upsertRecipe.call(upsert, (error, { insertedId }) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      component.recipeEditorForm.reset();
      Bert.alert(confirmation, 'success');
      browserHistory.push(`/recipes/${insertedId || recipe._id}`);
    }
  });
};

const validate = () => {
  $(component.recipeEditorForm).validate({
    rules: {
      title: {
        required: true,
      },
      body: {
        required: true,
      },
    },
    messages: {
      title: {
        required: 'Need recipe name here, Seuss.',
      },
      body: {
        required: 'This needs a body, please.',
      },
    },
    submitHandler() { handleUpsert(); },
  });
};

export default function recipeEditor(options) {
  component = options.component;
  validate();
}
