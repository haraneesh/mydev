import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import Recipes from '../Recipes/Recipes';
import UserAndPosts from './UserAndPosts';

export const insertToUserAndPosts = new ValidatedMethod({
  name: 'UserAndPosts.insert',
  validate: new SimpleSchema({
    postId: { type: String },
  }).validator(),
  run({ postId }) {
    const recipe = Recipes.findOne({ _id: postId });
    let viewCount = recipe.viewCount;
    viewCount = viewCount ? viewCount + 1 : 1;
    recipe.viewCount = viewCount;
    Recipes.update({ _id: recipe._id }, { $set: recipe });
    const view = {
      postType: constants.PostTypes.Recipe.name,
      postId,
      owner: this.userId,
      isBookmarked: false,
    };
    // return UserAndPosts.insert(view);
    return UserAndPosts.upsert({
      owner: this.userId,
      postId,
    },
    { $set: view },
    { $inc: { userViewCount: 1 } },
    );
  },
});

rateLimit({
  methods: [
    insertToUserAndPosts,
  ],
  limit: 5,
  timeRange: 1000,
});
