var Nightmare = require('nightmare');
var jsonfile = require('jsonfile');
var co = require('co')
var R = require('ramda')

var log = header => R.tap(value => console.log(`${header}: ${value}`))

var extractData = function extractData () {
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

var extractTotalPages = function extractTotalPages () {
  // TODO > implement this function
  return 5;
}

var getNumOfPages = function getNumOfPages(url) {
  console.log(`Extracting ${url}`)
  return Nightmare()
    .goto(url)
    .wait()
    .evaluate(extractTotalPages)
    .end()
    .then(log('Found pages'))
}

var parse = function parse(url) {
  console.log(`Start parsing ${url}`)
  return Nightmare()
    .goto(url)
    .wait()
    .evaluate(extractData)
    .end()
    .then(data => { 
      console.log(`Finished with: ${url}`);
      return data;
   })
}


var makePagesArray = R.compose(R.range(1), R.inc)

var locationStr = 'zakopane'
var url = `https://www.pkt.pl/szukaj/noclegi/${locationStr}/`

var parsePages = function*(pages) {
  var parseOutput = []
  var result = null
  for(let p of pages) {
    result = yield parse(url + p)
    parseOutput = parseOutput.concat(result)
  }
  return parseOutput
}


getNumOfPages(url)
  .then(makePagesArray)
  .then(pages => co(parsePages(pages)) )
  .then(allData => {
    jsonfile.writeFile(`${locationStr}.json`, allData, { spaces: 2 }, function (err) {
      console.error(err)
    })
  })
  .catch(err => {
    console.log(err)
  })