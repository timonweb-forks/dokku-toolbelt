#!/usr/bin/env node
'use strict';

var dokkuGitRemoteParser = require('dokku-git-remote-parser')
var dokkuAppSsh = require('dokku-app-ssh')
var cp = require('child_process')
var _ = require('highland')
var minimist = require('minimist');
let cleanHelpCommand = require('./clean-help-command')

var argv = minimist(process.argv.slice(2))
var command = argv._.join(' ')

dokkuGitRemoteParser(function (err, host, appName) {
  if (err) {
    console.error('Dokku Toolbelt Error:', err.message)
    process.exit()
  }

  try {
    var sshCommand = dokkuAppSsh(host, command, appName)
  } catch (err) {
    console.error('Dokku Toolbelt Error:', err.message)
    process.exit()
  }

  //run the command
  var commandArgs = sshCommand.split(' ')
  var cmd = commandArgs.shift()
  var dt = cp.spawn(cmd, commandArgs)

  _(dt.stdout)
    .map(buffer => buffer.toString())
    .through(stream => {
      if (argv._[0] === 'help' || !argv._[0])
        return cleanHelpCommand(stream)

      return stream
    })
    .pipe(process.stdout)

  dt.stderr.pipe(process.stderr)
})