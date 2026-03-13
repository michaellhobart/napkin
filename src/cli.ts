#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { generateCommand } from './commands/generate/index.js';

const program = new Command();

program
  .name('napkin')
  .description('Turn architecture diagrams into runnable sketches')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(generateCommand);

program.parse();
