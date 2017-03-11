var Nightmare = require('nightmare');
var jsonfile = require('jsonfile')

function extractData () {
  function propOrEmpty (obj, prop) {
    if (obj == null) {
      return ''
    }
    return obj[prop]
  }

  function parseBox (box) {
    var object = {
      'name': propOrEmpty($(box).find('.company-name').get(0), 'innerText'),
      'company-category': propOrEmpty($(box).find('.company-category').get(0), 'innerText'),
      'www': propOrEmpty($(box).find('.www--full').get(0), 'innerText'),
      'phone': $(box).find('meta[itemprop=telephone]').attr('content'),
      'email': $(box).find('a[data-popup=email-popup]>span').attr('title'),
      'address': propOrEmpty($(box).find('.street-address').get(0), 'innerText'),
      'company-snippet': propOrEmpty($(box).find('.company-snippet').get(0), 'innerText')
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
]).then(data => {
  var output = data.reduce((a, c) => a.concat(c), [])
  jsonfile.writeFile('output.json', output, { spaces: 2}, function(err) {
    console.error(err)
  })
  console.log('DONE')
})