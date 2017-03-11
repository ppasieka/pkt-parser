var Nightmare = require('nightmare');
var jsonfile = require('jsonfile')

function extractData () {
  function defaultIfNil (obj, prop) {
    if (obj == null) {
      return ''
    }
    return obj[prop]
  }

  var transform = $obj => (selector, prop) => {
    return defaultIfNil($obj.find(selector).get(0), prop)
  }
  
  var parseBox = function (box) {
    var $box = transform($(box))
    var object = {
      'name': $box('.company-name', 'innerText'),
      'company-category': $box('.company-category', 'innerText'),
      'www': $box('.www--full', 'innerText'),
      'phone': $(box).find('meta[itemprop=telephone]').attr('content'),
      'email': $(box).find('a[data-popup=email-popup]>span').attr('title'),
      'address': $box('.street-address', 'innerText'),
      'company-snippet': $box('.company-snippet', 'innerText')
    }
    return object
  }

  return $('.box-content').toArray().map(parseBox).filter(x => x.name.length > 0)
}

function parse(url) {
  console.log(`Start parsing ${url}`)
  return Nightmare({ show: false })
    .goto(url)
    .wait()
    .evaluate(extractData)
    .end()
}

Promise.all([
  parse('https://www.pkt.pl/szukaj/noclegi/zakopane/1'),
  parse('https://www.pkt.pl/szukaj/noclegi/zakopane/2'),
  parse('https://www.pkt.pl/szukaj/noclegi/zakopane/3'),
  parse('https://www.pkt.pl/szukaj/noclegi/zakopane/4')

  // ... /49
]).then(data => {
  var output = data.reduce((a, c) => a.concat(c), [])
  jsonfile.writeFile('output.json', output, { spaces: 2}, function(err) {
    console.error(err)
  })
  console.log('DONE')
})