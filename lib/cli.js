var path = require('path');
var fs   = require('fs');
var _    = require("underscore");

var generator = require(path.join(__dirname,'../lib/generator.js'));
var server    = require(path.join(__dirname,'../lib/server.js'));

var get_config = function(config_file, callback){
  fs.readFile(config_file, function(err, data){

    // if there's an error we assume the config doesn't exist.
    if(err){
      var supplied_config = {}; 
    } else {
      var supplied_config = JSON.parse(data);  
    } 

    callback(supplied_config); 
  });
}

module.exports = {

  setup: function(){

    // setup site
    fs.mkdir("templates", function(err){
      if(!err)
        console.log("Created templates directory.");
    }); 

    fs.mkdir("contents", function(err){
      if(!err)
        console.log("Created contents directory.");
    }); 

    var config_file = '{ \
        "template_dir": "templates", \
        "content_dir": "contents", \
        "output_dir": "public" \
    }';

    fs.writeFile('config.json', config_file, function (err) {
      if(!err)
        console.log("Created the config.json");
    });

  },

  server: function(args){
    var config_file = "config.json";

    get_config(config_file, function(supplied_config){

      if(parseInt(args[0]) > 0){
        supplied_config["server"]["port"] = parseInt(args[1]);
      }

      supplied_config.on_start = function(callback){
        console.log("Generating the site...");
        callback();
      }

      // start server 
      server.startServer(supplied_config);

    }); 

  }, 

  generate: function(args){
    var config_file = args[0] || "config.json";

    get_config(config_file, function(supplied_config){

      var start_time = (new Date()).getTime();

      supplied_config.on_start = function(callback){
        console.log("Generating the site...");
        callback();
      }

      supplied_config.on_complete = function(){
        var time_elapsed = ((new Date()).getTime() - start_time)/1000;
        console.log("Finished generation. (" + time_elapsed + " seconds)");
      }

      supplied_config.on_each = function(action, file){
        var actions = {"render": "Rendered", "copy": "Copied"};
        console.log(actions[action] + " " + file);
      }

      // call generate with loaded config
      generator.generate(supplied_config);
    });

  },

  help: function(){
    console.log('Usage: punch COMMAND \[ARGS]\n');
    console.log('You can use following commands:');        
    console.log('  setup    - create punch directory strucutre.');
    console.log('  generate - generate HTML pages. (shorcut `punch g`)');
    console.log('  server   - starts the development server. (shortcut `punch s`)'); 
    console.log('  help     - show help. (shortcut `punch h`)\n'); 
    console.log('For more information about Punch visit: http://laktek.github.com/punch'); 
  },

  init: function(args){

    var commands = ["setup", "server", "generate", "help"];

    var short_codes = { "s": "server", "g": "generate", "h": "help" };

    var command = args.shift();

    if(_.include(commands, command)){
      return this[command](args); 
    } else if(_.include(_.keys(short_codes), command)){
      return this[short_codes[command]](args); 
    } else {
      return this["help"]();
    }
  } 

};



