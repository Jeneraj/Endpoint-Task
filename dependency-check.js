const express = require('express')
const fs = require("fs")
const axios = require('axios')
const semver = require('semver')
const app = express()
const port = 3000

// First endpoint

firstEp = (req, res) => {
  try {
    let responseString = "default response";
    var dependencyName = req.params.dependencyName;
    
    responseString = JSON.stringify(getObjectInfo(dependencyName))
    
    res.send(responseString)
  } catch (err) {
    console.log(`Error ocuured ${err}`)
    res.send(`Some error occurred while building a response`)
  }
}
app.get('/dependency/info/:dependencyName',firstEp)

// Second endpoint

app.get('/dependency/version-check/:dependencyName',async (req, res) => {
  let dependencyName = req.params.dependencyName
  let currentVersion = getObjectInfo(dependencyName)

  if(currentVersion.dependecyVersion === undefined)
  {
    res.send(`This dependency is not currently used in deps.json`)
  } else {
    let latestVersion = await getLatestVersionInfo(dependencyName)

    if(latestVersion !== null || latestVersion !== undefined) {
      let latestVersionString = latestVersion
      let versionTypeUpdate= semver.diff(currentVersion.dependecyVersion, latestVersionString)
      let updateVer = { 
          "major": versionTypeUpdate === 'major',
        	"minor": versionTypeUpdate === 'minor', 
          "patch": versionTypeUpdate === 'patch'
      }
      res.send(JSON.stringify(updateVer))    
    } else {
      res.send(`The info of latest version not found`)
    }
  }
})

// Start the server

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// Function to the get the details of the currently used version in deps.json

getObjectInfo = (dependencyName) => {
    const depsJsonString = fs.readFileSync("./deps.json");
    const jsonObject = JSON.parse(depsJsonString);

    let responseObject = {}
    let dependecyVersion = jsonObject.dependencies[dependencyName]
    let devDependecyVersion = jsonObject.devDependencies[dependencyName]

    if (dependecyVersion !== undefined) {
      responseObject.dependecyVersion = dependecyVersion
      responseObject.dependecyType = 'dependency';
    } else if (devDependecyVersion !== undefined) {
      responseObject.dependecyVersion = devDependecyVersion
      responseObject.dependecyType = 'dev dependency';
    } else {
      responseObject.dependecyVersion = undefined
      responseObject.dependecyType = undefined;
    }

    return responseObject
}

// Function to get the latest version from the API

getLatestVersionInfo = async (dependencyName) => {
  let urlToHit = `https://registry.npmjs.org/${dependencyName}`
  let latestVersion;

  console.log(`Calling url ${urlToHit}`)

  await axios.get(urlToHit)
    .then(response => {
      latestVersion = response.data["dist-tags"].latest
      console.log(`Calling url ${urlToHit} - latest version ${latestVersion}`)
    })
    .catch(error => {
      console.log(error);
    });

    return latestVersion;
}