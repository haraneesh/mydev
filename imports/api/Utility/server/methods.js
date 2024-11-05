import fs from 'node:fs';
import path, { dirname } from 'path';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import parseMarkdown from '../../../modules/parse-markdown';
import rateLimit from '../../../modules/rate-limit';
import getPrivateFile from '../../../modules/server/get-private-file';

Meteor.methods({
  'utility.getPage': function utilityGetPage(fileName) {
    check(fileName, String);
    return parseMarkdown(getPrivateFile(`pages/${fileName}.md`));
  },
  'utility.getAlertHTML': function getAlertHTML() {
    try {
      const appDir = Meteor.settings.public.AlertHTMLPath;
      const fileName = path.join(`${appDir}/AlertHTML.txt`);
      const data = fs.readFileSync(fileName, 'utf8');
      return data;
    } catch (error) {
      console.log(error);
    }
  },
});

rateLimit({
  methods: ['utility.getPage', 'utility.getAlertHTML'],
  limit: 5,
  timeRange: 1000,
});
