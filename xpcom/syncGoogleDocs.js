/*
 * Functions for syncing via Google Docs
 */

// get auth value for google docs
function getGDocsAuth(email, password)
{
  var auth;
  var goog_url = "https://www.google.com/accounts/ClientLogin";
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open("POST", goog_url, asynchronous);

  var params = "accountType=GOOGLE&Email=" + email + "&Passwd=" + password + "&service=writely";
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.setRequestHeader("Connection", "close");
  request.send(params);

  if (request.status == 200) {
   data = request.responseText;
   auth = data.split("\n")[2].substring(5)
  } else {
   throw new Error('read error: ' + request.status + ' ' +
  request.statusText);
  }
  return auth;
}

// make a request to GDocs
function getGDocsXMLfromURL(auth, URL, protocol, thingToSend)
{
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, URL, asynchronous);
  
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" +auth);
  request.setRequestHeader("Connection", "close");
  request.send(thingToSend);

  if (request.status == 200) 
  {
     var data = request.responseText;
     return data;
  }
  else
  {
   throw new Error('Get list: read error: ' + request.status + ' ' + request.statusText);
  }
}

// make a request to GDocs by sending xml
function getGDocsXMLfromURL_sendXML(auth, URL, protocol, thingToSend)
{
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, URL, asynchronous);
  
  request.setRequestHeader("Content-Type", "application/atom+xml");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" +auth);
  request.setRequestHeader("Content-Length", thingToSend.length);
  
  request.setRequestHeader("Connection", "close");
  request.send(thingToSend);

  if (request.status == 201)
  {
     var data = request.responseText;
     return data;
  }
  else 
  {
   throw new Error('ERROR: ' + request.status + ' ' +
   request.statusText);
  }
}

// make a plain text request to GDocs
function getGDocsXMLfromURL_sendText(auth, URL, protocol, thingToSend)
{
  var request = new XMLHttpRequest();
  var asynchronous = false;
  request.open(protocol, URL, asynchronous);
  
  request.setRequestHeader("Content-Type", "text/plain");
  request.setRequestHeader("Authorization", "GoogleLogin auth=" +auth);
  request.setRequestHeader("Content-Length", thingToSend.length);
  
  request.setRequestHeader("Connection", "close");
  request.send(thingToSend);

  if (request.status == 200)
  {
     var data = request.responseText;
     return data;
  }
  else 
  {
   throw new Error('ERROR: ' + request.status + ' ' +
   request.statusText);
  }
} 

// make chickenfoot triggers folder
function createGDocsChickenfootFolder(auth) {
  var url = "http://docs.google.com/feeds/documents/private/full";
  var entry = "";

  entry += '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">';
  entry += '<atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#folder" label="folder"/>';
  entry += '<atom:title>Chickenfoot Triggers</atom:title>';
  entry += '</atom:entry>';
  
  var result = getGDocsXMLfromURL_sendXML(auth, url, "POST", entry);
  return result;
}

// create empty file in chickenfoot triggers folder
function createGDocsEmptyFile(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var entry = "";

  entry += '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">';
  entry += '<atom:category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/docs/2007#document" label="document"/>';
  entry += '<atom:title>' + filename + '</atom:title>';
  entry += '</atom:entry>';
  
  var result = getGDocsXMLfromURL_sendXML(auth, url, "POST", entry);
  return result;
}

// get chickenfoot triggers folder id
function getGDocsChickenfootFolderID(auth) {
  var url = "http://docs.google.com/feeds/documents/private/full/-/folder?showfolders=true";
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  
  var id = _findTitleInXML(result, "Chickenfoot Triggers");
  // if not found, create folder
  if (id == "") {
    result = createGDocsChickenfootFolder(auth);
    id = _findTitleInXML(result, "Chickenfoot Triggers");
  }
  
  return id;
}

// get all file names in chickenfoot folder
function getGDocsAllChickenfootFileNames(auth, folderid) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  
  var titles = new Array();
  var j = 0;
  var parser = new DOMParser();
  var doc = parser.parseFromString(result, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    if (entry.getElementsByTagName('title').length > 0) {
      var title = entry.getElementsByTagName('title')[0].textContent;
      titles[j] = title;
      j++;
    }
  }
  
  return titles;
}

// check if folder contains filename
function containsGDocsChickenfootScript(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  
  var id = _findTitleInXML(result, filename);
  return (id != "");
}

// get document id of a chickenfoot script (create empty if not exist)
function getGDocsChickenfootScriptID(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  
  var id = _findTitleInXML(result, filename);
  // if not found, create empty file
  if (id == "") {
    result = createGDocsEmptyFile(auth, folderid, filename);
    id = _findTitleInXML(result, filename);
  }
  
  return id;
}

// get document's edit link for a chickenfoot script (create empty if not exist)
function getGDocsChickenfootScriptEditLink(auth, folderid, filename) {
  var url = "http://docs.google.com/feeds/folders/private/full/folder%3A" + folderid;
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  var editlink = _findEditLinkByTitleInXML(result, filename);
  // if not found, create empty file
  if (editlink == "") {
    result = createGDocsEmptyFile(auth, folderid, filename);
    editlink = _findEditLinkByTitleInXML(result, filename);
  }
  
  return editlink;
}

function updateGDocsDocument(auth, editlink, content) {
  var url = editlink;
  var result = getGDocsXMLfromURL_sendText(auth, url, "PUT", content);
  return result;
}

function _findTitleInXML(xml, title) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    var titles = entry.getElementsByTagName('title');
    if (titles.length > 0) {
      if (titles[0].textContent == title) {
        var id_str = entry.getElementsByTagName('id')[0].textContent;
        return id_str.substring(id_str.lastIndexOf("%3A")+3);
      }
    }
  }
  return "";
}

function _findEditLinkByTitleInXML(xml, title) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, "text/xml");
  var entries = doc.getElementsByTagName('entry');
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    var titles = entry.getElementsByTagName('title');
    if (titles.length > 0) {
      if (titles[0].textContent == title) {
        var links = entry.getElementsByTagName('link');
        for (var j=0; j<links.length; j++) {
          if (links[j].getAttribute('rel') == 'edit-media') {
            return links[j].getAttribute('href');
          }
        }
      }
    }
  }
  return "";
}

// read a file in GDocs
function readGDocsDocument(auth, folderid, filename) {
  var documentid = getGDocsChickenfootScriptID(auth, folderid, filename);
  var url = "http://docs.google.com/feeds/download/documents/Export?docID=" + documentid + "&exportFormat=txt";
  var result = getGDocsXMLfromURL(auth, url, "GET", "");
  
  return result;
}