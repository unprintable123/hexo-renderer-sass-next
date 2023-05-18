'use strict'
const sass = require('sass')
const url_for = require('hexo/lib/plugins/helper/url_for');

function getProperty(obj, name) {
  name = name.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');

  var split = name.split('.');
  var key = split.shift();

  if (!obj.hasOwnProperty(key)) return '';

  var result = obj[key];
  var len = split.length;

  if (!len) return result || '';
  if (typeof result !== 'object') return '';

  for (var i = 0; i < len; i++) {
    key = split[i];
    if (!result.hasOwnProperty(key)) return '';

    result = result[split[i]];
    if (typeof result !== 'object') return result;
  }

  return result;
}

module.exports = function (data) {
  const self = this;
  const opt = Object.assign({
    functions: {
      'url_for($str)': args => { return new sass.SassString(url_for.call(self, args[0].assertString('str').text.toString())) },
      "hexo-theme-config($args)": function (args) {
        var val = getProperty(self.theme.config, args[0].text.toString());
        return new sass.SassString(val);
      },
      "hexo-config($args)": function (args) {
        var val = getProperty(self.config, args[0].text.toString());
        return new sass.SassString(val);
      }
    }
  }, self.theme.config.sass || {})
  const path = data.path
  const result = sass.compile(path, opt)
  return result.css
}

