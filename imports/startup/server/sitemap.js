import xml from 'xml';
import { Meteor } from 'meteor/meteor';
import { Picker } from 'meteor/meteorhacks:picker';
// import Documents from '../../api/Documents/Documents';
import { iso } from '../../modules/dates.js';

const baseUrl = Meteor.absoluteUrl();

// NOTE: Slashes are omitted at front because it comes with baseUrl.
const routes = [
  { base: 'signup', priority: '0.8' },
  { base: 'login', priority: '0.5' },

  { base: 'about', priority: '0.5' },
  { base: 'vision', priority: '1.0' },
  { base: 'healthprinciples', priority: '1.0' },
  { base: 'healthfaq', priority: '0.5' },

  /* {
    base: 'documents',
    collection: Documents,
    priority: '1.0',
    // NOTE: Edit this query to limit what you publish.
    query: {},
    projection: { fields: { _id: 1, createdAt: 1 }, sort: { createdAt: -1 } },
  }, */
];

const sitemap = {
  urlset: [{ _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } }],
};

routes.forEach(({ base, priority, collection, query, projection }) => {
  const currentDateTime = new Date().toISOString();
  const urlTemplate = (path, date, priority = '1.0') => ({
    url: [
      { loc: `${baseUrl}${path}` },
      { lastmod: iso(date) },
      { changefreq: 'monthly' },
      { priority },
    ],
  });

  sitemap.urlset.push(urlTemplate(base, currentDateTime, priority ));

  if (collection) {
    const items = collection.find(query, projection).fetch();
    if (items.length > 0) {
      items.forEach(({ _id, createdAt }) => {
        sitemap.urlset.push(urlTemplate(`${base}/${_id}`, createdAt, 0.5));
      });
    }
  }
});

Picker.route('/sitemap.xml', (params, request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/xml' });
  response.end(xml(sitemap, { declaration: { standalone: 'yes', encoding: 'utf-8' } }));
});
