import { Command } from 'commander';
import { generateServiceCommand } from './service.js';

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate Napkin components');

generateCommand.addCommand(generateServiceCommand);
